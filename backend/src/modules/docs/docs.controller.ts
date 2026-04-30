import { Request, Response } from "express";
import { IDocsService } from "./docs.interface.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";

export class DocsController {
    constructor(private docsService: IDocsService) {}

    // create document
    createDoc = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const doc = await this.docsService.createDocument(userId, req.body);
        
        res.status(201).json({
            status: "success",
            data: { doc },
        });
    });

    // import document from file
    importDocFromFile = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { fileKey, workspaceId, title } = req.body;
        
        const doc = await (this.docsService as any).importFromFile(userId, { fileKey, workspaceId, title });
        
        res.status(202).json({
            status: "success",
            data: { doc },
            message: "Document import job queued successfully",
        });
    });

    // get document by id
    getDoc = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const shareToken = req.query.token as string;
        
        const doc = await this.docsService.getDocument(userId, id as string, shareToken);
        
        res.status(200).json({
            status: "success",
            data: { doc },
        });
    });

    // get documents of workspace
    getWorkspaceDocs = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { workspaceId } = req.params;
        const status = (req.query.status as any) || 'active';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        
        const { docs, hasMore } = await this.docsService.getWorkspaceDocuments(userId, workspaceId as string, status, page, limit);
        
        res.status(200).json({
            status: "success",
            data: { docs, hasMore },
        });
    });

    // update document
    updateDoc = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        
        const doc = await this.docsService.updateDocument(userId, id as string, req.body);
        
        res.status(200).json({
            status: "success",
            data: { doc },
        });
    });

    // delete document
    deleteDoc = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        
        await this.docsService.deleteDocument(userId, id as string);
        
        res.status(200).json({
            status: "success",
            message: "Document deleted successfully",
        });
    });

    // list versions
    listVersions = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        
        const { versions, hasMore } = await this.docsService.listVersions(userId, id as string, page, limit);
        
        res.status(200).json({
            status: "success",
            data: { versions, hasMore },
        });
    });

    // save version manually
    saveVersion = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const { name } = req.body;
        
        await this.docsService.saveVersion(userId, id as string, name);
        
        res.status(202).json({
            status: "success",
            message: "Version save job queued successfully",
        });
    });

    // rename version
    renameVersion = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id, versionId } = req.params;
        const { name } = req.body;
        
        const version = await this.docsService.renameVersion(userId, id as string, versionId as string, name);
        
        res.status(200).json({
            status: "success",
            data: { version },
        });
    });
    // get favorite status
    getFavoriteStatus = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        
        const isFavorite = await this.docsService.getFavoriteStatus(userId, id as string);
        
        res.status(200).json({
            status: "success",
            data: { isFavorite },
        });
    });

    // toggle favorite
    toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        
        const isFavorite = await this.docsService.toggleFavorite(userId, id as string);
        
        res.status(200).json({
            status: "success",
            data: { isFavorite },
            message: isFavorite ? "Added to favorites" : "Removed from favorites",
        });
    });

    // send chat message
    sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const { content } = req.body;
        
        const message = await this.docsService.sendChatMessage(userId, id as string, content, req.user as any);
        
        res.status(201).json({
            status: "success",
            data: { message },
        });
    });

    // get chat history
    getChatHistory = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const cursor = req.query.cursor as string;
        
        const messages = await this.docsService.getChatHistory(userId, id as string, limit, cursor);
        
        res.status(200).json({
            status: "success",
            data: { messages },
        });
    });
    
    // get public document by slug
    getPublicDoc = asyncHandler(async (req: Request, res: Response) => {
        const { slug } = req.params;
        const doc = await this.docsService.getPublicDocumentBySlug(slug as string);
        
        res.status(200).json({
            status: "success",
            data: { doc },
        });
    });

    // Add member to document
    addMember = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const { targetUserId, role } = req.body;
        
        await this.docsService.addMember(userId, id as any, targetUserId, role);
        
        res.status(200).json({
            status: "success",
            message: "Member added successfully",
        });
    });

    // List document members
    listMembers = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        
        const members = await this.docsService.listMembers(userId, id as string) ;
        
        res.status(200).json({
            status: "success",
            data: { members },
        });
    });

    // Remove document member
    removeMember = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id, userId: targetUserId } = req.params;
        
        await this.docsService.removeMember(userId, id as string, targetUserId as string);
        
        res.status(200).json({
            status: "success",
            message: "Member removed successfully",
        });
    });

    // get favorite documents
    getFavorites = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { workspaceId } = req.params;
        
        const docs = await this.docsService.getFavoriteDocuments(userId, workspaceId as string);
        
        res.status(200).json({
            status: "success",
            data: { docs },
        });
    });
}


