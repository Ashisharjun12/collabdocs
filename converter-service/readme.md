#  Collabdocs Converter Service

A high-performance document conversion engine built in Python, designed to handle complex document imports and transformations for the Flow platform.

---

## Purpose
The Converter Service is responsible for:
- Transforming external file formats (Markdown, HTML, DOCX) into Flow-compatible formats.
- Parsing structured data for document imports.
- Offloading CPU-intensive processing from the main Node.js API.

<!-- Space for a diagram showing the conversion flow -->
![Conversion Flow](https://via.placeholder.com/800x300?text=Document+Conversion+Flow+Process)

---

##  Technical Stack
- **Language**: Python 3.10+
- **Environment**: Virtualenv for dependency isolation.
- **Processing**: Optimized for multi-threaded document parsing.
- **Integration**: Works as a companion service to the Node.js backend.

---

## 🚀 Installation & Setup

1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate Environment**:
   - **Windows**: `venv\Scripts\activate`
   - **Unix/macOS**: `source venv/bin/activate`

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Service**:
   ```bash
   python main.py
   ```

---

##  Internal Structure
```bash
 converter-service/
├──  main.py           # Entry point and processing logic
├──  Lib/              # Venv library files (git-ignored)
├──  Scripts/          # Venv executable files (git-ignored)
├──  requirements.txt  # Python dependencies
└──  .env.sample       # Configuration template
```

---

##  Configuration
The service requires a `.env` file for integration:
```env
# Example configuration
BACKEND_CALLBACK_URL=http://localhost:5000/api/v1/docs/import/callback
TEMP_STORAGE_DIR=./temp
```

---

##  Performance Note
This service is designed to be horizontally scalable. Multiple instances can run concurrently to process a high volume of document conversion tasks triggered by the backend's job queue.
