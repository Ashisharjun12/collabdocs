import { IDocsService, ICreateDocDto, IUpdateDocDto, IDocsRepository } from "./docs.interface.js";
import { TDocument, TDocumentVersion } from "./docs.schema.js";
import { AccessControlService } from "../../shared/services/AccessControlService.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { v4 as uuidv4 } from "uuid";
import { addSnapshotJob } from "../../infrastructure/bullmq/snapshot/snapshot.queue.js";
import { addConversionJob } from "../../infrastructure/bullmq/docs/docs.queue.js";
import { CollabService } from "./collab.service.js";
import { R2StorageService } from "../../infrastructure/storage/r2.service.js";

export class DocsService implements IDocsService {
    constructor(private docsRepository: IDocsRepository) {}
    // create document
    async createDocument(userId: string, dto: ICreateDocDto): Promise<TDocument> {
        // 1. Permission check: Can user create in this workspace?
        const hasAccess = await AccessControlService.hasWorkspaceAccess(userId, dto.workspaceId, 'editor');
        if (!hasAccess) {
            throw ApiError.forbidden("You don't have permission to create documents in this workspace");
        }

        // 2. Generate slug
        const title = dto.title || "Untitled";
        let slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        if (!slug) slug = "untitled";

        // Check if slug exists
        const existing = await this.docsRepository.findBySlug(slug);
        if (existing) {
            slug = `${slug}-${uuidv4().substring(0, 5)}`;
        }

        // 3. Create document
        const doc = await this.docsRepository.create({
            title,
            slug,
            ownerId: userId,
            workspaceId: dto.workspaceId,
            visibility: dto.visibility || 'workspace',
            icon: dto.icon,
        });

        return doc;
    }

    // get document
    async getDocument(userId: string, id: string, shareToken?: string): Promise<TDocument> {
        // 1. Permission check
        const hasAccess = await AccessControlService.hasAccess(userId, id, 'viewer', shareToken);
        if (!hasAccess) {
            throw ApiError.forbidden("You do not have access to this document");
        }

        const doc = await this.docsRepository.findById(id);
        if (!doc) throw ApiError.notFound("Document not found");

        return doc;
    }

    // get workspace documents
    async getWorkspaceDocuments(
        userId: string, 
        workspaceId: string, 
        status: 'all' | 'active' | 'archived' = 'active',
        page: number = 1,
        limit: number = 15
    ): Promise<{ docs: TDocument[], hasMore: boolean }> {
        // 1. Permission check: Can user view this workspace?
        const hasAccess = await AccessControlService.hasWorkspaceAccess(userId, workspaceId, 'viewer');
        if (!hasAccess) {
            throw ApiError.forbidden("You don't have access to this workspace");
        }

        const offset = (page - 1) * limit;

        // 2. Fetch documents + 1 to check for next page
        const docs = await this.docsRepository.listByWorkspace(workspaceId, status, limit + 1, offset);
        
        const hasMore = docs.length > limit;
        if (hasMore) {
            docs.pop();
        }

        // 3. Filter private docs that the user doesn't have explicit access to
        const accessibleDocs = [];
        for (const doc of docs) {
            if (doc.visibility !== 'private') {
                accessibleDocs.push(doc);
            } else {
                const hasDocAccess = await AccessControlService.hasAccess(userId, doc.id, 'viewer');
                if (hasDocAccess) accessibleDocs.push(doc);
            }
        }

        return { docs: accessibleDocs, hasMore };
    }

    // update document
    async updateDocument(userId: string, id: string, dto: IUpdateDocDto): Promise<TDocument> {
        const doc = await this.docsRepository.findById(id);
        if (!doc) throw ApiError.notFound("Document not found");

        // 1. Permission check
        const wsRole = await AccessControlService.getWorkspaceRole(userId, doc.workspaceId);
        const isDocOwner = doc.ownerId === userId;
        const isWorkspaceOwner = wsRole === 'owner';
        const isWorkspaceAdmin = wsRole === 'admin';

        // If trying to Archive/Unarchive, need higher permissions (Owner or Admin)
        if (dto.isArchived !== undefined) {
            const canArchive = isDocOwner || isWorkspaceOwner || isWorkspaceAdmin;
            if (!canArchive) {
                throw ApiError.forbidden("Only workspace owners or admins can archive documents");
            }
        }

        // Standard metadata update requires Editor access
        const hasAccess = await AccessControlService.hasAccess(userId, id, 'editor');
        if (!hasAccess) {
            throw ApiError.forbidden("You don't have permission to update this document");
        }

        // 2. Update metadata
        let updatedData = { ...dto };
        
        // Generate shareToken if publishing to public for the first time
        if (dto.visibility === 'public' && !doc.shareToken) {
            updatedData.shareToken = uuidv4().replace(/-/g, '').substring(0, 12);
        }

        const updatedDoc = await this.docsRepository.update(id, updatedData);

        // 3. Edge Case: If archiving, kick everyone out of the WebSocket connection
        if (dto.isArchived === true) {
            await CollabService.evictAll(id);
        }

        return updatedDoc;
    }

    // delete document
    async deleteDocument(userId: string, id: string): Promise<void> {
        const doc = await this.docsRepository.findById(id);
        if (!doc) throw ApiError.notFound("Document not found");

        // 1. Permission check: Only Doc Owner or Workspace Owner can delete
        const wsRole = await AccessControlService.getWorkspaceRole(userId, doc.workspaceId);
        const isDocOwner = doc.ownerId === userId;
        const isWorkspaceOwner = wsRole === 'owner';

        if (!isDocOwner && !isWorkspaceOwner) {
            throw ApiError.forbidden("Only the document owner or workspace owner can delete this document");
        }

        // 2. Delete
        await this.docsRepository.delete(id);

        // 3. Kick everyone out of the WebSocket connection and clear Presence
        await CollabService.evictAll(id);
    }

    // list versions
    async listVersions(userId: string, id: string, page: number = 1, limit: number = 15): Promise<{ versions: any[], hasMore: boolean }> {
        const hasAccess = await AccessControlService.hasAccess(userId, id, 'viewer');
        if (!hasAccess) throw ApiError.forbidden("You do not have access to view this document's history");
        
        const offset = (page - 1) * limit;
        // Fetch one extra to check if there are more
        const dbVersions = await this.docsRepository.listVersions(id, limit + 1, offset);
        
        const hasMore = dbVersions.length > limit;
        if (hasMore) {
            dbVersions.pop(); // Remove the extra one we fetched
        }

        const r2Service = new R2StorageService();

        const versions = dbVersions.map(v => ({
            ...v,
            url: r2Service.getPublicUrl(v.r2Key)
        }));

        return { versions, hasMore };
    }

    // save version
    async saveVersion(userId: string, id: string, name: string): Promise<void> {
        const hasAccess = await AccessControlService.hasAccess(userId, id, 'editor');
        if (!hasAccess) throw ApiError.forbidden("Must be an editor to save a version");

        const doc = await this.docsRepository.findById(id);
        if (!doc) throw ApiError.notFound("Document not found");
        if (!doc.contentR2Key) throw ApiError.badRequest("Document has no saved state yet — edit the document first before saving a version.");

        // Fetch the live Yjs binary from R2
        const r2 = new R2StorageService();
        const stateBuffer = await r2.downloadBuffer(doc.contentR2Key);
        if (!stateBuffer) throw ApiError.badRequest("Document state not found in storage.");

        // Manually trigger the snapshot job
        await addSnapshotJob(id, userId, name, stateBuffer, false);

    }

    // rename version
    async renameVersion(userId: string, id: string, versionId: string, name: string): Promise<TDocumentVersion> {
        const hasAccess = await AccessControlService.hasAccess(userId, id, 'editor');
        if (!hasAccess) throw ApiError.forbidden("Must be an editor to rename a version");

        if (!name || name.trim() === "") throw ApiError.badRequest("Name cannot be empty");

        return await this.docsRepository.renameVersion(versionId, name.trim());
    }

    // get favorite status
    async getFavoriteStatus(userId: string, id: string): Promise<boolean> {
        const hasAccess = await AccessControlService.hasAccess(userId, id, 'viewer');
        if (!hasAccess) throw ApiError.forbidden("You do not have access to this document");

        return await this.docsRepository.getFavoriteStatus(userId, id);
    }

    // toggle favorite
    async toggleFavorite(userId: string, id: string): Promise<boolean> {
        const hasAccess = await AccessControlService.hasAccess(userId, id, 'viewer');
        if (!hasAccess) throw ApiError.forbidden("You do not have access to this document");

        return await this.docsRepository.toggleFavorite(userId, id);
    }

    // Send chat message
    async sendChatMessage(userId: string, docId: string, content: string, userProfile?: any): Promise<any> {
        const hasAccess = await AccessControlService.hasAccess(userId, docId, 'viewer');
        if (!hasAccess) throw ApiError.forbidden("You do not have access to this document");

        const { docsChatService } = await import("./docs.chat.service.js");
        return await docsChatService.sendMessage(docId, userId, content, userProfile);
    }

    // Get chat history
    async getChatHistory(userId: string, docId: string, limit: number = 50, cursor?: string): Promise<any[]> {
        const hasAccess = await AccessControlService.hasAccess(userId, docId, 'viewer');
        if (!hasAccess) throw ApiError.forbidden("You do not have access to this document");

        const { docsChatService } = await import("./docs.chat.service.js");
        return await docsChatService.getHistory(docId, limit, cursor);
    }

    async getPublicDocumentBySlug(slug: string): Promise<TDocument> {
        let doc = await this.docsRepository.findBySlug(slug);
        
        // Fallback: Check if the "slug" passed is actually a token
        if (!doc) {
            doc = await this.docsRepository.findByToken(slug);
        }

        if (!doc) throw ApiError.notFound("Document not found");

        if (doc.visibility !== 'public') {
            throw ApiError.forbidden("This document is not public");
        }

        return doc;
    }

    async getPublicDocumentByToken(token: string): Promise<TDocument> {
        const doc = await this.docsRepository.findByToken(token);
        if (!doc) throw ApiError.notFound("Document not found");

        if (doc.visibility !== 'public') {
            throw ApiError.forbidden("This document is not public");
        }

        return doc;
    }


    // import document from file (background)
    async importFromFile(userId: string, dto: { fileKey: string, workspaceId: string, title?: string }): Promise<TDocument> {
        // 1. Permission check
        const hasAccess = await AccessControlService.hasWorkspaceAccess(userId, dto.workspaceId, 'editor');
        if (!hasAccess) throw ApiError.forbidden("No permission to create in this workspace");

        // 2. Create the document record first
        const title = dto.title || dto.fileKey.split('/').pop() || "Imported Document";
        let slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        slug = `${slug}-${uuidv4().substring(0, 5)}`;

        const doc = await this.docsRepository.create({
            title,
            slug,
            ownerId: userId,
            workspaceId: dto.workspaceId,
            visibility: 'workspace',
            importStatus: 'importing',
        });

        // 3. Dispatch conversion job
        await addConversionJob({
            fileKey: dto.fileKey,
            docId: doc.id,
            userId
        });

        return doc;
    }

    async addMember(userId: string, docId: string, targetUserId: string, role: string): Promise<void> {
        // Check if requester is owner/admin
        const requesterRole = await AccessControlService.getDocumentRole(userId, docId);
        if (requesterRole !== 'owner') {
            throw ApiError.forbidden("Only the owner can add members to this document");
        }

        await this.docsRepository.addMember(docId, targetUserId, role);
    }

    async removeMember(userId: string, docId: string, targetUserId: string): Promise<void> {
        const requesterRole = await AccessControlService.getDocumentRole(userId, docId);
        if (requesterRole !== 'owner') {
            throw ApiError.forbidden("Only the owner can remove members from this document");
        }

        await this.docsRepository.removeMember(docId, targetUserId);
    }

    async listMembers(userId: string, docId: string): Promise<any[]> {
        const hasAccess = await AccessControlService.hasAccess(userId, docId, 'viewer');
        if (!hasAccess) throw ApiError.forbidden("You do not have access to view members");

        return await this.docsRepository.listMembers(docId);
    }

    async getFavoriteDocuments(userId: string, workspaceId: string): Promise<TDocument[]> {
        const hasAccess = await AccessControlService.hasWorkspaceAccess(userId, workspaceId, 'viewer');
        if (!hasAccess) {
            throw ApiError.forbidden("You don't have access to this workspace");
        }

        return await this.docsRepository.listFavorites(userId, workspaceId);
    }
}


