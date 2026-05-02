import { IWorkspaceService, IWorkspaceRepository, ICreateWorkspaceDto, IUpdateWorkspaceDto, IWorkspaceResponse } from "./workspace.interface.js";
import { TWorkspace } from "./workspace.schema.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { IUserRepository } from "../user/user.interface.js";
import { v4 as uuidv4 } from "uuid";
import { addMailToQueue } from "../../infrastructure/bullmq/mail/mail.queue.js";
import { _config } from "../../config/config.js";

export class WorkspaceService implements IWorkspaceService {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private userRepository: IUserRepository
    ) { }

    // create workspace
    async createWorkspace(userId: string, dto: ICreateWorkspaceDto): Promise<TWorkspace> {
        // Generate slug from name
        let slug = dto.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        // Check if slug exists, if so append random string
        const existing = await this.workspaceRepository.findBySlug(slug);
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        const workspace = await this.workspaceRepository.create({
            name: dto.name,
            slug,
            ownerId: userId,
            inviteCode: dto.inviteCode || `ws_${Math.random().toString(36).substring(2, 12)}`,
            logo: dto.logo,
            logoType: dto.logoType || "generated",
            visibility: dto.visibility || "private",
            isPersonal: dto.isPersonal || false,
        });

        // Add creator as owner in members table
        await this.workspaceRepository.addMember(workspace.id, userId, "owner");

        return {
            ...workspace,
            userRole: "owner"
        } as any;
    }

    // invite user to existing workspace
    async inviteUser(userId: string, workspaceId: string, email: string, role: "owner" | "admin" | "editor" | "viewer"): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) throw ApiError.notFound("Workspace not found");

        // Permission check: only admin or owner can invite
        const inviterRole = await this.workspaceRepository.getMemberRole(workspaceId, userId);
        if (inviterRole !== "owner" && inviterRole !== "admin") {
            throw ApiError.forbidden("Only workspace owners or admins can invite members");
        }

        // Requirement: User must have an account on the platform
        const userExists = await this.userRepository.findByEmail(email);
        if (!userExists) {
            throw ApiError.badRequest(`User with email ${email} not found. They must create an account first.`);
        }

        // Check if already a member
        const isMember = await this.workspaceRepository.isMember(workspaceId, userExists.id);
        if (isMember) throw ApiError.badRequest("User is already a member of this workspace");

        const inviter = await this.userRepository.findById(userId);
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        await this.workspaceRepository.createInvite({
            workspaceId,
            email,
            role,
            token,
            invitedBy: userId,
            expiresAt,
        });

        // Add to BullMQ Queue for professional email delivery
        await addMailToQueue(
            email,
            `Join ${workspace.name} on CollabDocs`,
            "invites/invite-mail",
            {
                inviterName: inviter?.name || "A teammate",
                workspaceName: workspace.name,
                role: role,
                inviteUrl: `${_config.CLIENT_URL}/invite/${token}`
            }
        );
    }

    // invite multiple users to workspace
    async inviteUsers(userId: string, workspaceId: string, invitations: { email: string, role: "owner" | "admin" | "editor" | "viewer" }[]): Promise<void> {
        for (const invitation of invitations) {
            try {
                await this.inviteUser(userId, workspaceId, invitation.email, invitation.role);
            } catch (error) {
                console.error(`Failed to invite ${invitation.email}:`, error);
                // Continue to next user even if one fails
            }
        }
    }

    // accept invitation
    async acceptInvite(userId: string, token: string): Promise<void> {
        // 1. Try to find a direct email invitation first
        const invite = await this.workspaceRepository.getInviteByToken(token);
        
        if (invite) {
            if (invite.accepted) throw ApiError.badRequest("Invitation has already been accepted");
            if (new Date() > new Date(invite.expiresAt)) {
                throw ApiError.badRequest("Invitation has expired");
            }

            const user = await this.userRepository.findById(userId);
            if (!user) throw ApiError.unauthorized("User not found");

            // Only the person invited can accept this specific invite
            if (user.email !== invite.email) {
                throw ApiError.forbidden("This invitation was sent to another email address");
            }

            // Check if already a member 
            const isMember = await this.workspaceRepository.isMember(invite.workspaceId, user.id);
            if (!isMember) {
                await this.workspaceRepository.addMember(invite.workspaceId, user.id, invite.role);
            }

            await this.workspaceRepository.updateInvite(invite.id, { accepted: true });
            return;
        }

        // check if it's a general workspace invite code
        const workspace = await this.workspaceRepository.findByInviteCode(token);
        if (!workspace) {
            throw ApiError.notFound("Invalid invitation token or invite code");
        }

        // For general links, we check if access is not Private
        if (workspace.visibility === "private") {
            throw ApiError.forbidden("This workspace is restricted. Only invited members can join.");
        }

        // For general links, any logged-in user can join (Team or Public)
        const isMember = await this.workspaceRepository.isMember(workspace.id, userId);
        if (isMember) {
            return; // Already a member, just succeed
        }

        // Join with the workspace's configured linkRole
        await this.workspaceRepository.addMember(workspace.id, userId, workspace.linkRole as any);
    }
    // get user workspaces
    async getUserWorkspaces(userId: string): Promise<TWorkspace[]> {
        return await this.workspaceRepository.findByUser(userId);
    }

    // get workspace by id
    async getWorkspaceById(userId: string, workspaceId: string): Promise<IWorkspaceResponse> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw ApiError.notFound("Workspace not found");
        }

      // rules of access:
      // if private access only to member
      // if team or public access to all
      // if team or public user
        if (workspace.visibility === "private") {
            const isMember = await this.workspaceRepository.isMember(workspaceId, userId);
            if (!isMember) {
                throw ApiError.forbidden("You do not have access to this restricted workspace");
            }
        }
        

        const members = await this.workspaceRepository.getMembers(workspaceId);
        const userRole = await this.workspaceRepository.getMemberRole(workspaceId, userId);

        return {
            ...workspace,
            userRole,
            members
        };
    }

    // update workspace
    async updateWorkspace(userId: string, workspaceId: string, dto: IUpdateWorkspaceDto): Promise<TWorkspace> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw ApiError.notFound("Workspace not found");
        }

        const requesterRole = await this.workspaceRepository.getMemberRole(workspaceId, userId);
        if (requesterRole !== "owner" && requesterRole !== "admin") {
            throw ApiError.forbidden("Only the owner or admins can update the workspace");
        }

        await this.workspaceRepository.update(workspaceId, {
            name: dto.name,
            logo: dto.logo,
            logoType: dto.logoType,
            visibility: dto.visibility
        });

        // Re-fetch workspace 
        const updatedWorkspaces = await this.workspaceRepository.findByUser(userId);
        const updated = updatedWorkspaces.find(ws => ws.id === workspaceId);
        
        if (!updated) throw ApiError.notFound("Workspace not found after update");
        
        return updated;
    }

    // update member role
    async updateMemberRole(userId: string, workspaceId: string, targetUserId: string, newRole: "admin" | "editor" | "viewer"): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) throw ApiError.notFound("Workspace not found");

        // Permission check
        const inviterRole = await this.workspaceRepository.getMemberRole(workspaceId, userId);
        if (inviterRole !== "owner" && inviterRole !== "admin") {
            throw ApiError.forbidden("Only workspace owners or admins can change roles");
        }

        // Cannot change owner's role
        if (workspace.ownerId === targetUserId) {
            throw ApiError.forbidden("Cannot change the role of the workspace owner");
        }

        await this.workspaceRepository.addMember(workspaceId, targetUserId, newRole);
    }

    // remove member
    async removeMember(userId: string, workspaceId: string, targetUserId: string): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) throw ApiError.notFound("Workspace not found");

        const requesterRole = await this.workspaceRepository.getMemberRole(workspaceId, userId);
        
        if (userId === targetUserId) {
            throw ApiError.badRequest("You cannot remove yourself from the workspace here.");
        }

        // Removal by others
        if (requesterRole !== "owner" && requesterRole !== "admin") {
            throw ApiError.forbidden("Only workspace owners or admins can remove members");
        }

        if (workspace.ownerId === targetUserId) {
            throw ApiError.forbidden("Cannot remove the workspace owner");
        }

        await this.workspaceRepository.removeMember(workspaceId, targetUserId);
    }

    // delete workspace
    async deleteWorkspace(userId: string, workspaceId: string): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw ApiError.notFound("Workspace not found");
        }

        if (workspace.ownerId !== userId) {
            throw ApiError.forbidden("Only the owner can delete the workspace");
        }

        // Cannot delete personal/default workspace
        if (workspace.isPersonal) {
            throw ApiError.badRequest("Cannot delete the default personal workspace.");
        }

        // Cannot delete if it's the only workspace
        const userWorkspaces = await this.workspaceRepository.findByUser(userId);
        if (userWorkspaces.length <= 1) {
            throw ApiError.badRequest("You must have at least one workspace.");
        }

        await this.workspaceRepository.delete(workspaceId);
    }
}
