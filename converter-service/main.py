import os
import io
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import boto3
from botocore.config import Config
from docx import Document
from pdfminer.high_level import extract_text

# Load environment variables
load_dotenv()

app = FastAPI(title="Flow Document Converter")

# Initialize R2 Client
r2_client = boto3.client(
    "s3",
    endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
    aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

class ConvertRequest(BaseModel):
    file_key: str

def parse_docx(file_bytes):
    """Converts DOCX to a list of Block objects"""
    doc = Document(io.BytesIO(file_bytes))
    blocks = []
    
    for para in doc.paragraphs:
        if not para.text.strip():
            continue
            
        # Basic mapping: Headings to headings, others to paragraphs
        if para.style.name.startswith('Heading'):
            level = 1
            if '1' in para.style.name: level = 1
            elif '2' in para.style.name: level = 2
            blocks.append({
                "type": "heading",
                "props": {"level": level},
                "content": para.text
            })
        else:
            blocks.append({
                "type": "paragraph",
                "content": para.text
            })
    return blocks

def parse_pdf(file_bytes):
    """Converts PDF to a list of Block objects using block-level extraction."""
    import fitz

    doc = fitz.open(stream=file_bytes, filetype="pdf")
    blocks = []

    for i, page in enumerate(doc):
        # get_text("blocks") returns: (x0, y0, x1, y1, text, block_no, block_type)
        # block_type 0 = text, 1 = image
        raw_blocks = page.get_text("blocks")

        # Compute average font size to detect headings
        page_dict = page.get_text("dict")
        font_sizes = []
        for b in page_dict.get("blocks", []):
            for line in b.get("lines", []):
                for span in line.get("spans", []):
                    if span.get("size"):
                        font_sizes.append(span["size"])
        avg_size = sum(font_sizes) / len(font_sizes) if font_sizes else 12

        for raw in sorted(raw_blocks, key=lambda b: (b[1], b[0])):  # sort top-to-bottom
            if raw[6] != 0:  # skip image blocks
                continue
            text = raw[4].strip().replace("\n", " ")
            if not text:
                continue

            # Simple heading detection: get font size of first span in this block area
            # Use page_dict spans that overlap this block's bbox
            block_bbox = fitz.Rect(raw[0], raw[1], raw[2], raw[3])
            block_font_sizes = []
            for b in page_dict.get("blocks", []):
                r = fitz.Rect(b.get("bbox", [0,0,0,0]))
                if r.intersects(block_bbox):
                    for line in b.get("lines", []):
                        for span in line.get("spans", []):
                            block_font_sizes.append(span.get("size", avg_size))

            block_avg = sum(block_font_sizes) / len(block_font_sizes) if block_font_sizes else avg_size

            if block_avg > avg_size * 1.4:
                level = 1 if block_avg > avg_size * 1.8 else 2
                blocks.append({"type": "heading", "props": {"level": level}, "content": text})
            else:
                blocks.append({"type": "paragraph", "content": text})

        # Page break between pages (not after the last page)
        if i < len(doc) - 1:
            blocks.append({"type": "page-break", "content": ""})

    return blocks

@app.get("/health")
async def health_check():
    """Health check for load balancers, Docker, and Kubernetes probes."""
    return {
        "status": "healthy",
        "service": "converter-service",
        "version": "1.0.0",
    }

@app.post("/convert")
async def convert_file(request: ConvertRequest):
    try:
        print(f"DEBUG: Received conversion request for: {request.file_key}")
        # 1. Download file from R2
        try:
            response = r2_client.get_object(Bucket=os.getenv("R2_BUCKET"), Key=request.file_key)
            file_content = response['Body'].read()
            print(f"DEBUG: Downloaded {len(file_content)} bytes from R2")
        except Exception as e:
            print(f"ERROR: Failed to fetch from R2: {e}")
            raise HTTPException(status_code=404, detail=f"File not found in R2: {str(e)}")

        # 2. Determine file type and parse
        file_ext = request.file_key.split('.')[-1].lower()
        print(f"DEBUG: Detected extension: {file_ext}")
        
        blocks = []
        if file_ext == 'docx':
            blocks = parse_docx(file_content)
        elif file_ext == 'pdf':
            blocks = parse_pdf(file_content)
        elif file_ext in ['txt', 'md']:
            content = file_content.decode('utf-8')
            blocks = [{"type": "paragraph", "content": line} for line in content.split('\n') if line.strip()]
        else:
            print(f"ERROR: Unsupported format: {file_ext}")
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {file_ext}")

        print(f"DEBUG: Successfully extracted {len(blocks)} blocks")
        if len(blocks) > 0:
            print(f"DEBUG: Sample block: {str(blocks[0])[:100]}...")

        return {
            "status": "success",
            "file_key": request.file_key,
            "blocks": blocks
        }

    except Exception as e:
        print(f"Conversion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import multiprocessing

    port = int(os.getenv("PORT", 8000))

    workers = min(multiprocessing.cpu_count(), 4)

    print(f"Starting converter-service with {workers} workers on port {port}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        workers=workers,
        log_level="info",
    )
