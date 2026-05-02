import { pgTable, uuid, varchar, timestamp, boolean, pgEnum, text, index } from "drizzle-orm/pg-core";
import { users } from "../user/user.schema.js";
import { workspaces } from "../workspace/workspace.schema.js";

// Roles 
export const documentRoleEnum = pgEnum('document_role', [
  'viewer', 'commenter', 'editor', 'owner'
]);

// Visibility 
export const documentVisibilityEnum = pgEnum('document_visibility', [
  'private',    // Only owner + document_members
  'workspace',  // Everyone in workspace + document_members
  'public'      // Anyone with link + workspace + document_members
]);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull().default('Untitled'),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  visibility: documentVisibilityEnum("visibility").notNull().default('workspace'),
  contentR2Key: varchar("content_r2_key", { length: 500 }), // R2 key for Yjs binary state
  importStatus: varchar("import_status", { length: 50 }).notNull().default('active'),
  importedBlocks: text("imported_blocks"), // JSON string of parsed blocks 
  contentKey: varchar("content_key", { length: 500 }),
  icon: varchar("icon", { length: 255 }),
  coverImage: varchar("cover_image", { length: 500 }),
  isArchived: boolean("is_archived").notNull().default(false),
  shareToken: varchar("share_token", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Explicit user-level permissions
export const documentMembers = pgTable("document_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: documentRoleEnum("role").notNull().default('viewer'),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Secret token links 
export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  role: documentRoleEnum("role").notNull().default('viewer'),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// document versions
export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), 
  name: varchar("name", { length: 255 }), 
  r2Key: varchar("r2_key", { length: 500 }).notNull(),
  isAutoSaved: boolean("is_auto_saved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// user favorites
export const userFavorites = pgTable("user_favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//docs  chat
export const documentChats = pgTable("document_chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('text'), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    docIdx: index("idx_chat_doc_id").on(table.documentId),
    docTimeIdx: index("idx_chat_doc_time").on(table.documentId, table.createdAt),
  };
});

// Types
export type TDocument = typeof documents.$inferSelect;
export type TCreateDocument = typeof documents.$inferInsert;
export type TDocumentMember = typeof documentMembers.$inferSelect;
export type TShareLink = typeof shareLinks.$inferSelect;
export type TDocumentVersion = typeof documentVersions.$inferSelect;
export type TCreateDocumentVersion = typeof documentVersions.$inferInsert;
export type TUserFavorite = typeof userFavorites.$inferSelect;
export type TDocumentChat = typeof documentChats.$inferSelect;
export type TCreateDocumentChat = typeof documentChats.$inferInsert;

