import { TCreateDocument, TDocument, TDocumentVersion } from "./docs.schema.js";

export interface ICreateDocDto {
    title?: string;
    workspaceId: string;
    visibility?: 'private' | 'workspace' | 'public';
    icon?: string;
    shareToken?: string;
}

export interface IUpdateDocDto {
    title?: string;
    visibility?: 'private' | 'workspace' | 'public';
    icon?: string;
    coverImage?: string;
    isArchived?: boolean;
    shareToken?: string;
}


export interface IDocsRepository {
    create(data: TCreateDocument): Promise<TDocument>;
    findById(id: string): Promise<TDocument | null>;
    findBySlug(slug: string): Promise<TDocument | null>;
    findByToken(token: string): Promise<TDocument | null>;
    listByWorkspace(workspaceId: string, status?: 'all' | 'active' | 'archived', limit?: number, offset?: number): Promise<TDocument[]>;
    update(id: string, data: Partial<TDocument>): Promise<TDocument>;
    delete(id: string): Promise<void>;
    addMember(docId: string, userId: string, role: string): Promise<void>;
    getMemberRole(docId: string, userId: string): Promise<string | null>;
    listVersions(docId: string, limit?: number, offset?: number): Promise<TDocumentVersion[]>;
    renameVersion(versionId: string, name: string): Promise<TDocumentVersion>;
    listMembers(docId: string): Promise<any[]>;
    removeMember(docId: string, userId: string): Promise<void>;
    getFavoriteStatus(userId: string, docId: string): Promise<boolean>;
    toggleFavorite(userId: string, docId: string): Promise<boolean>;
    listFavorites(userId: string, workspaceId: string): Promise<TDocument[]>;
}



export interface IDocsService {
    createDocument(userId: string, dto: ICreateDocDto): Promise<TDocument>;
    getDocument(userId: string, id: string, shareToken?: string): Promise<TDocument>;
    getWorkspaceDocuments(userId: string, workspaceId: string, status?: 'all' | 'active' | 'archived', page?: number, limit?: number): Promise<{ docs: TDocument[], hasMore: boolean }>;
    updateDocument(userId: string, id: string, dto: IUpdateDocDto): Promise<TDocument>;
    deleteDocument(userId: string, id: string): Promise<void>;
    listVersions(userId: string, id: string, page: number, limit: number): Promise<{ versions: any[], hasMore: boolean }>;
    saveVersion(userId: string, id: string, name: string): Promise<void>;
    renameVersion(userId: string, id: string, versionId: string, name: string): Promise<TDocumentVersion>;
    getFavoriteStatus(userId: string, id: string): Promise<boolean>;
    toggleFavorite(userId: string, id: string): Promise<boolean>;
    sendChatMessage(userId: string, docId: string, content: string, userProfile?: any): Promise<any>;
    getChatHistory(userId: string, docId: string, limit?: number, cursor?: string): Promise<any[]>;
    importFromFile(userId: string, dto: { fileKey: string, workspaceId: string, title?: string }): Promise<TDocument>;
    getPublicDocumentBySlug(slug: string): Promise<TDocument>;
    getPublicDocumentByToken(token: string): Promise<TDocument>;
    addMember(userId: string, docId: string, targetUserId: string, role: string): Promise<void>;
    removeMember(userId: string, docId: string, targetUserId: string): Promise<void>;
    listMembers(userId: string, docId: string): Promise<any[]>;
    getFavoriteDocuments(userId: string, workspaceId: string): Promise<TDocument[]>;
}




