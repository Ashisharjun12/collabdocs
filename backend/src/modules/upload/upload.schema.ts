import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar, jsonb } from "drizzle-orm/pg-core";
import { users } from "../user/user.schema.js";

export const uploadStatusEnum = pgEnum("upload_status", ["pending", "completed", "failed"]);
export const processingStatusEnum = pgEnum("processing_status", ["none", "queued", "processing", "completed", "failed"]);

export const uploads = pgTable("uploads", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull().unique(),
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    size: integer("size"),
    status: uploadStatusEnum("status").notNull().default("pending"),
    processingStatus: processingStatusEnum("processing_status").notNull().default("none"),
    providerUploadId: text("provider_upload_id"), // R2 UploadId for multipart support
    metadata: jsonb("metadata"), // Flexible storage for image dimensions, PDF page counts, etc.
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type TUpload = typeof uploads.$inferSelect;
export type TCreateUpload = typeof uploads.$inferInsert;