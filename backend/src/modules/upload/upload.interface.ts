import { TCreateUpload, TUpload } from "./upload.schema.js";

export interface IUploadRepository {
    create(data: TCreateUpload): Promise<TUpload>;
    findByKey(key: string): Promise<TUpload | null>;
    findById(id: string): Promise<TUpload | null>;
    updateStatus(id: string, status: "pending" | "completed" | "failed"): Promise<TUpload>;
    updateProcessingStatus(id: string, status: "none" | "queued" | "processing" | "completed" | "failed", metadata?: any): Promise<TUpload>;
    delete(id: string): Promise<void>;
    listByUserId(userId: string, limit: number, offset: number): Promise<TUpload[]>;
    countByUserId(userId: string): Promise<number>;
}

export interface IPresignedUrlRequest {
    filename: string;
    contentType: string;
}

export interface IPresignedUrlResponse {
    uploadId: string;
    uploadUrl: string;
    key: string;
    publicUrl: string;
}

export interface IMultipartInitiateRequest {
    filename: string;
    contentType: string;
}

export interface IMultipartInitiateResponse {
    uploadId: string;
    key: string;
}

export interface IMultipartPartRequest {
    key: string;
    uploadId: string;
    partNumber: number;
}

export interface IMultipartCompleteRequest {
    uploadId: string;
    parts: { ETag: string; PartNumber: number }[];
}

export interface IUploadService {
    generateUploadUrl(userId: string, dto: IPresignedUrlRequest): Promise<IPresignedUrlResponse>;
    initiateMultipart(userId: string, dto: IMultipartInitiateRequest): Promise<IMultipartInitiateResponse>;
    getMultipartPartUrl(dto: IMultipartPartRequest): Promise<string>;
    completeMultipart(uploadId: string, parts: any[]): Promise<{ publicUrl: string }>;
    deleteFile(key: string): Promise<void>;
    listUserFiles(userId: string, page: number, limit: number): Promise<{ data: any[], total: number, page: number, limit: number, totalPages: number }>;
}
