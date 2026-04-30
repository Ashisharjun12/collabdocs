import { 
    IUploadService, 
    IUploadRepository, 
    IPresignedUrlRequest, 
    IPresignedUrlResponse,
    IMultipartInitiateRequest,
    IMultipartInitiateResponse,
    IMultipartPartRequest
} from "./upload.interface.js";
import { R2StorageService } from "../../infrastructure/storage/r2.service.js";
import { ApiError } from "../../shared/errors/ApiError.js";

export class UploadService implements IUploadService {
    constructor(
        private uploadRepository: IUploadRepository,
        private storageService: R2StorageService
    ) {}

    // generate presigned url
    async generateUploadUrl(userId: string, dto: IPresignedUrlRequest): Promise<IPresignedUrlResponse> {
        const { uploadUrl, key } = await this.storageService.getUploadUrl(dto.filename, dto.contentType);
        
        const upload = await this.uploadRepository.create({
            userId,
            key,
            filename: dto.filename,
            mimeType: dto.contentType,
            status: "pending",
        });

        return {
            uploadId: upload.id,
            uploadUrl,
            key,
            publicUrl: this.storageService.getPublicUrl(key)
        };
    }

    // initiate multipart upload
    async initiateMultipart(userId: string, dto: IMultipartInitiateRequest): Promise<IMultipartInitiateResponse> {
        const { uploadId: r2UploadId, key } = await this.storageService.startMultipartUpload(dto.filename, dto.contentType);
        
        const upload = await this.uploadRepository.create({
            userId,
            key,
            filename: dto.filename,
            mimeType: dto.contentType,
            status: "pending",
            providerUploadId: r2UploadId,
        });

        
        return {
            uploadId: upload.id,
            key
        };
    }

    // generate multipart part url
    async getMultipartPartUrl(dto: IMultipartPartRequest): Promise<string> {
        const upload = await this.uploadRepository.findById(dto.uploadId);
        if (!upload || !upload.providerUploadId) {
            throw ApiError.badRequest("Invalid upload or not a multipart upload");
        }
        
        return this.storageService.getMultipartPartUrl(upload.key, upload.providerUploadId, dto.partNumber);
    }

    // complete multipart upload
    async completeMultipart(uploadId: string, parts: any[]): Promise<{ publicUrl: string }> {
        const upload = await this.uploadRepository.findById(uploadId);
        if (!upload || !upload.providerUploadId) {
            throw ApiError.notFound("Upload not found or missing provider ID");
        }

        await this.storageService.completeMultipartUpload(upload.key, upload.providerUploadId, parts);
        await this.uploadRepository.updateStatus(uploadId, "completed");
        
        return { publicUrl: this.storageService.getPublicUrl(upload.key) };
    }

    // finalize simple upload
    async finalizeUpload(uploadId: string): Promise<{ publicUrl: string }> {
        const upload = await this.uploadRepository.findById(uploadId);
        if (!upload) throw ApiError.notFound("Upload not found");

        await this.uploadRepository.updateStatus(uploadId, "completed");
        return { publicUrl: this.storageService.getPublicUrl(upload.key) };
    }

    async deleteFile(key: string): Promise<void> {
        // 1. Delete from R2
        await this.storageService.deleteFile(key);
        
        // 2. Delete from DB if exists
        const upload = await this.uploadRepository.findByKey(key);
        if (upload) {
            await this.uploadRepository.delete(upload.id);
        }
    }

    async listUserFiles(userId: string, page: number = 1, limit: number = 20): Promise<{ data: any[], total: number, page: number, limit: number, totalPages: number }> {
        const offset = (page - 1) * limit;
        const total = await this.uploadRepository.countByUserId(userId);
        const files = await this.uploadRepository.listByUserId(userId, limit, offset);
        
        const data = files.map((file) => ({
             ...file,
             publicUrl: this.storageService.getPublicUrl(file.key)
        }));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}
