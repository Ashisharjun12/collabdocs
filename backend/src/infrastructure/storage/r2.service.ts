import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { _config } from "../../config/config.js";
import { CircuitBreakerFactory } from "../circuitBreaker/CircuitBreaker.js";

export class R2StorageService {
    private client: S3Client;
    private bucket: string;
    private breaker;

    constructor() {
        this.bucket = _config.R2_BUCKET!;
        this.client = new S3Client({
            region: "auto",
            endpoint: `https://${_config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: _config.R2_ACCESS_KEY!,
                secretAccessKey: _config.R2_SECRET_KEY!,
            },
            requestChecksumCalculation: "WHEN_REQUIRED", // Prevents automatic checksums that break CORS
        });

        this.breaker = CircuitBreakerFactory.create(
            (command: any) => this.client.send(command),
            'R2StorageService',
            { timeout: 15000 }
        );
    }

    // 1. Get Presigned URL for Upload
    async getUploadUrl(filename: string, contentType: string) {
        const folder = this.getFolderName(contentType);
        const timestamp = Date.now();
        const key = `uploads/${folder}/${timestamp}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 });
        return { uploadUrl, key };
    }

    // 2. Get Presigned URL for View/Download
    async getDownloadUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return getSignedUrl(this.client, command, { expiresIn: 3600 });
    }

    // 3. List All Files
    async listFiles(prefix = "uploads/") {
        const command = new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: prefix,
        });

        const { Contents = [] } = (await this.breaker.fire(command)) as any;

        return Promise.all(Contents.map(async (item: any) => ({
            key: item.Key,
            url: await this.getDownloadUrl(item.Key!),
            size: item.Size,
            lastModified: item.LastModified
        })));
    }

    // 4. Delete File
    async deleteFile(key: string) {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return this.breaker.fire(command);
    }

    // --- Multipart Upload ---

    async startMultipartUpload(filename: string, contentType: string) {
        const folder = this.getFolderName(contentType);
        const timestamp = Date.now();
        const key = `uploads/${folder}/${timestamp}-${filename}`;

        const command = new CreateMultipartUploadCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const response = (await this.breaker.fire(command)) as any;
        return { uploadId: response.UploadId, key };
    }

    async getMultipartPartUrl(key: string, uploadId: string, partNumber: number) {
        const command = new UploadPartCommand({
            Bucket: this.bucket,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
        });
        return getSignedUrl(this.client, command, { expiresIn: 3600 });
    }

    async completeMultipartUpload(key: string, uploadId: string, parts: any[]) {
        const command = new CompleteMultipartUploadCommand({
            Bucket: this.bucket,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: parts },
        });
        return this.breaker.fire(command);
    }

    // --- Direct Buffer Upload (For Server-Side Snapshots) ---
    
    async uploadBuffer(key: string, buffer: Buffer, contentType: string = 'application/octet-stream') {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });
        
        return this.breaker.fire(command);
    }

    // Download an object from R2 as a Buffer
    async downloadBuffer(key: string): Promise<Buffer | null> {
        try {
            const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
            const response = (await this.breaker.fire(command)) as any;
            if (!response?.Body) return null;
            
           
            const byteArray = await response.Body.transformToByteArray();
            return Buffer.from(byteArray);
        } catch (err: any) {
           
            if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) return null;
            throw err;
        }
    }

    // Helper to organize files
    private getFolderName(contentType: string): string {
        if (contentType.startsWith('image/')) return 'images';
        if (contentType === 'application/pdf') return 'pdf';
        return 'others';
    }

    // Helper to get public URL
    getPublicUrl(key: string): string {
        if (_config.R2_PUBLIC_URL) {
            return `${_config.R2_PUBLIC_URL}/${key}`;
        }
        // Fallback to R2 authenticated URL if no public URL is set
        return `https://${this.bucket}.${_config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
    }
}
