import { Worker } from "bullmq";
import { bullmqConnection } from "../connection.js";
import { R2StorageService } from "../../storage/r2.service.js";
import { db } from "../../postgres/postgres-client.js";
import { documentVersions } from "../../../modules/docs/docs.schema.js";
import { logger } from "../../../utils/logger.js";
import { randomUUID } from "crypto";

const r2Service = new R2StorageService();

export const snapshotWorker = new Worker(
    "snapshot-queue",
    async (job) => {
        const { documentId, userId, name, stateBuffer: base64State, isAutoSaved } = job.data;

        logger.info({ documentId, jobId: job.id }, "Processing snapshot job");

        try {
            // 1. Convert base64 back to Buffer
            const buffer = Buffer.from(base64State, 'base64');
            const snapshotId = randomUUID();
            
            // 2. Define R2 Key
            const r2Key = `documents/${documentId}/snapshots/${snapshotId}.bin`;

            // 3. Upload binary snapshot to Cloudflare R2
            await r2Service.uploadBuffer(r2Key, buffer, "application/octet-stream");
            
            logger.info({ r2Key }, "Snapshot uploaded to R2 successfully");

            // 4. Save metadata to PostgreSQL database
            await db.insert(documentVersions).values({
                id: snapshotId,
                documentId,
                userId: userId || null, // for autosave userId is null
                name: name || null,
                r2Key,
                isAutoSaved,
            });

            logger.info({ snapshotId, documentId }, "Snapshot saved to Database");

            return { success: true, snapshotId, r2Key };
        } catch (error) {
            logger.error({ err: error, documentId }, "Failed to process snapshot job");
            throw error; 
        }
    },
    {
        connection: bullmqConnection,
        concurrency: 5, 
    }
);

// Error handling for the worker
snapshotWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Snapshot job failed');
});
