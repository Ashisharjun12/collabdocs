import { eq, and, desc } from "drizzle-orm";
import { db } from "../../infrastructure/postgres/postgres-client.js";
import { documents, TDocument, TCreateDocument, documentMembers, documentVersions, TDocumentVersion, userFavorites } from "./docs.schema.js";
import { IDocsRepository } from "./docs.interface.js";



export class DocsRepository implements IDocsRepository {
    // create document  
    async create(data: TCreateDocument): Promise<TDocument> {
        const [doc] = await db.insert(documents).values(data).returning();
        return doc;
    }
// find document by id  
    async findById(id: string): Promise<TDocument | null> {
        const doc = await db.query.documents.findFirst({
            where: eq(documents.id, id),
        });
        return doc || null;
    }

    // find document by slug  
    async findBySlug(slug: string): Promise<TDocument | null> {
        const doc = await db.query.documents.findFirst({
            where: eq(documents.slug, slug),
        });
        return doc || null;
    }

    // find document by share token
    async findByToken(token: string): Promise<TDocument | null> {
        const doc = await db.query.documents.findFirst({
            where: eq(documents.shareToken, token),
        });
        return doc || null;
    }


    // list documents in a workspace  
    async listByWorkspace(workspaceId: string, status: 'all' | 'active' | 'archived' = 'active', limit: number = 15, offset: number = 0): Promise<TDocument[]> {
        let condition = eq(documents.workspaceId, workspaceId);
        
        if (status === 'active') {
            condition = and(condition, eq(documents.isArchived, false)) as any;
        } else if (status === 'archived') {
            condition = and(condition, eq(documents.isArchived, true)) as any;
        }
        
        return await db.query.documents.findMany({
            where: condition,
            orderBy: [desc(documents.updatedAt)],
            limit,
            offset,
        });
    }
// update document  
    async update(id: string, data: Partial<TDocument>): Promise<TDocument> {
        const [updated] = await db.update(documents)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(documents.id, id))
            .returning();
        return updated;
    }
// delete document
    async delete(id: string): Promise<void> {
        await db.delete(documents).where(eq(documents.id, id));
    }
// add member to document  
    async addMember(docId: string, userId: string, role: any): Promise<void> {
        await db.insert(documentMembers).values({
            documentId: docId,
            userId,
            role,
        }).onConflictDoUpdate({
            target: [documentMembers.documentId, documentMembers.userId],
            set: { role },
        });
    }

    async removeMember(docId: string, userId: string): Promise<void> {
        await db.delete(documentMembers).where(
            and(
                eq(documentMembers.documentId, docId),
                eq(documentMembers.userId, userId)
            )
        );
    }

    async listMembers(docId: string): Promise<any[]> {
        return await db.query.documentMembers.findMany({
            where: eq(documentMembers.documentId, docId),
            with: {
                user: true
            }
        });
    }


// get member role
    async getMemberRole(docId: string, userId: string): Promise<string | null> {
        const member = await db.query.documentMembers.findFirst({
            where: and(
                eq(documentMembers.documentId, docId),
                eq(documentMembers.userId, userId)
            ),
        });
        return member?.role || null;
    }

    // list versions
    async listVersions(docId: string, limit: number = 15, offset: number = 0): Promise<TDocumentVersion[]> {
        return await db.query.documentVersions.findMany({
            where: eq(documentVersions.documentId, docId),
            orderBy: [desc(documentVersions.createdAt)],
            limit,
            offset,
        });
    }

    // rename version
    async renameVersion(versionId: string, name: string): Promise<TDocumentVersion> {
        const [updated] = await db.update(documentVersions)
            .set({ name, isAutoSaved: false })
            .where(eq(documentVersions.id, versionId))
            .returning();
        return updated;
    }

    // get favorite status
    async getFavoriteStatus(userId: string, docId: string): Promise<boolean> {
        const favorite = await db.query.userFavorites.findFirst({
            where: and(
                eq(userFavorites.userId, userId),
                eq(userFavorites.documentId, docId)
            )
        });
        return !!favorite;
    }

    // toggle favorite
    async toggleFavorite(userId: string, docId: string): Promise<boolean> {
        const isFav = await this.getFavoriteStatus(userId, docId);
        if (isFav) {
            await db.delete(userFavorites).where(
                and(
                    eq(userFavorites.userId, userId),
                    eq(userFavorites.documentId, docId)
                )
            );
            return false;
        } else {
            await db.insert(userFavorites).values({
                userId,
                documentId: docId
            });
            return true;
        }
    }

    async listFavorites(userId: string, workspaceId: string): Promise<TDocument[]> {
        const favorites = await db
            .select({
                doc: documents
            })
            .from(userFavorites)
            .innerJoin(documents, eq(userFavorites.documentId, documents.id))
            .where(
                and(
                    eq(userFavorites.userId, userId),
                    eq(documents.workspaceId, workspaceId)
                )
            )
            .orderBy(desc(userFavorites.createdAt));
            
        return favorites.map(f => f.doc);
    }
}

