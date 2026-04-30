import { db } from "../../infrastructure/postgres/postgres-client.js";
import { uploads, TUpload, TCreateUpload } from "./upload.schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { IUploadRepository } from "./upload.interface.js";

export class UploadRepository implements IUploadRepository {
    // create upload record
    async create(data: TCreateUpload): Promise<TUpload> {
        const result = await db.insert(uploads).values(data).returning();
        return result[0];
    }

    // find upload by key
    async findByKey(key: string): Promise<TUpload | null> {
        const result = await db.select().from(uploads).where(eq(uploads.key, key)).limit(1);
        return result[0] || null;
    }

    // find upload by id
    async findById(id: string): Promise<TUpload | null> {
        const result = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
        return result[0] || null;
    }

    // update upload status
    async updateStatus(id: string, status: "pending" | "completed" | "failed"): Promise<TUpload> {
        const result = await db.update(uploads)
            .set({ status, updatedAt: new Date() })
            .where(eq(uploads.id, id))
            .returning();
        return result[0];
    }

    // update processing status & metadata
    async updateProcessingStatus(id: string, status: "none" | "queued" | "processing" | "completed" | "failed", metadata?: any): Promise<TUpload> {
        const updateData: any = { processingStatus: status, updatedAt: new Date() };
        if (metadata !== undefined) {
            updateData.metadata = metadata;
        }
        const result = await db.update(uploads)
            .set(updateData)
            .where(eq(uploads.id, id))
            .returning();
        return result[0];
    }

    // delete upload record
    async delete(id: string): Promise<void> {
        await db.delete(uploads).where(eq(uploads.id, id));
    }

    // list uploads by user id
    async listByUserId(userId: string, limit: number, offset: number): Promise<TUpload[]> {
        return db.select().from(uploads)
            .where(eq(uploads.userId, userId))
            .orderBy(desc(uploads.createdAt))
            .limit(limit)
            .offset(offset);
    }

    // count total uploads by user id
    async countByUserId(userId: string): Promise<number> {
        const result = await db.select({ count: sql`count(*)` }).from(uploads).where(eq(uploads.userId, userId));
        return Number(result[0].count);
    }
}
