import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import { UploadService } from "./upload.service.js";
import { UploadRepository } from "./upload.repository.js";
import { R2StorageService } from "../../infrastructure/storage/r2.service.js";
import { authGuard } from "../../gateway/auth-guard.js";

const router = Router();

const uploadRepository = new UploadRepository();
const uploadStorageService = new R2StorageService();
const uploadService = new UploadService(uploadRepository, uploadStorageService);
const uploadController = new UploadController(uploadService);

// routes
router.use(authGuard);

router.post("/presigned-url", uploadController.generatePresignedUrl);
router.post("/complete", uploadController.completeUpload);
router.post("/multipart/initiate", uploadController.initiateMultipart);
router.post("/multipart/part-url", uploadController.getMultipartPartUrl);
router.post("/multipart/complete", uploadController.completeMultipartUpload);
router.delete("/file/:key", uploadController.deleteFile); 
router.get("/files", uploadController.listUserFiles);

export default router;
