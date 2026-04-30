import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { IUploadService } from "./upload.interface.js";
import { ApiError } from "../../shared/errors/ApiError.js";

export class UploadController {
  constructor(private uploadService: IUploadService) {}

  // Generate presigned URL for simple upload
  generatePresignedUrl = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { filename, contentType } = req.body;

    const result = await this.uploadService.generateUploadUrl(userId, { filename, contentType });

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  // Finalize simple upload
  completeUpload = asyncHandler(async (req: Request, res: Response) => {
    const { uploadId } = req.body;

    const result = await (this.uploadService as any).finalizeUpload(uploadId);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  // Initiate multipart upload
  initiateMultipart = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { filename, contentType } = req.body;

    const result = await this.uploadService.initiateMultipart(userId, { filename, contentType });

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  // Get Multipart Part URL
  getMultipartPartUrl = asyncHandler(async (req: Request, res: Response) => {
    const { uploadId, partNumber } = req.body;
    const url = await this.uploadService.getMultipartPartUrl({ uploadId, partNumber, key: "" });

    res.status(200).json({
      status: "success",
      data: { url },
    });
  });

  // Complete Multipart Upload
  completeMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const { uploadId, parts } = req.body;

    const result = await this.uploadService.completeMultipart(uploadId, parts);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  // Delete file
  deleteFile = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!key) throw ApiError.badRequest("File key is required");

    await this.uploadService.deleteFile(key as string);

    res.status(200).json({
      status: "success",
      message: "File deleted successfully",
    });
  });

  // List user files
  listUserFiles = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.uploadService.listUserFiles(userId, page, limit);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });
}
