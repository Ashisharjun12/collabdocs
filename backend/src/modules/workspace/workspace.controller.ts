import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { IWorkspaceService } from "./workspace.interface.js";

export class WorkspaceController {
    constructor(private workspaceService: IWorkspaceService) {}
 // create new workspace
    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const workspace = await this.workspaceService.createWorkspace(userId, req.body);

        res.status(201).json({
            status: "success",
            data: { workspace }
        });
    });

    // get all workspace of user
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const workspaces = await this.workspaceService.getUserWorkspaces(userId);

        res.status(200).json({
            status: "success",
            data: { workspaces }
        });
    });

    // get workspace by id
    getOne = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const workspace = await this.workspaceService.getWorkspaceById(userId, id as string);

        res.status(200).json({
            status: "success",
            data: { workspace }
        });
    });

    // update workspace
    update = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const workspace = await this.workspaceService.updateWorkspace(userId, id as string, req.body);

        res.status(200).json({
            status: "success",
            data: { workspace }
        });
    });

    // delete workspace
    delete = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        await this.workspaceService.deleteWorkspace(userId, id as string);

        res.status(200).json({
            status: "success",
            message: "Workspace deleted successfully"
        });
    });

    // invite user to workspace
    invite = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const { email, role } = req.body;
        await this.workspaceService.inviteUser(userId, id as string, email, role);

        res.status(200).json({
            status: "success",
            message: `Invitation sent to ${email}`
        });
    });

    // bulk invite users to workspace
    bulkInvite = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id } = req.params;
        const { invitations } = req.body; // Expecting { invitations: [{email, role}, ...] }
        
        await this.workspaceService.inviteUsers(userId, id as string, invitations);

        res.status(200).json({
            status: "success",
            message: "Invitations processed successfully"
        });
    });

    // update member role
    updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id, userId: targetUserId } = req.params;
        const { role } = req.body;
        
        await this.workspaceService.updateMemberRole(userId, id as string, targetUserId as string, role);

        res.status(200).json({
            status: "success",
            message: "Member role updated successfully"
        });
    });

    // remove member
    removeMember = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { id, userId: targetUserId } = req.params;
        
        await this.workspaceService.removeMember(userId, id as string, targetUserId as string);

        res.status(200).json({
            status: "success",
            message: "Member removed successfully"
        });
    });

    // accept invitation
    acceptInvite = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { token } = req.params;
        await this.workspaceService.acceptInvite(userId, token as string);

        res.status(200).json({
            status: "success",
            message: "Invitation accepted successfully. You are now a member of the workspace."
        });
    });
}
