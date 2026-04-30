import { TCreateWorkspace, TWorkspace, TWorkspaceMember } from "./workspace.schema.js";

// DTOs for workspace
export interface ICreateWorkspaceDto {
    name: string;
    logo?: string;
    logoType?: "generated" | "custom";
    visibility?: "private" | "team" | "public";
    inviteCode?: string;
    isPersonal?: boolean;
}

// DTOs for workspace
export interface IUpdateWorkspaceDto {
    name?: string;
    logo?: string;
    logoType?: "generated" | "custom";
    visibility?: "private" | "team" | "public";
    linkRole?: "admin" | "editor" | "viewer";
}

// Response DTOs for workspace
export interface IWorkspaceResponse extends TWorkspace {
    userRole?: "owner" | "admin" | "editor" | "viewer" | null;
    members?: (TWorkspaceMember & { user: { name: string, email: string, avatarUrl: string | null } })[];
}

// Repository interface for workspace
export interface IWorkspaceRepository {
    create(data: TCreateWorkspace): Promise<TWorkspace>;
    addMember(workspaceId: string, userId: string, role: "owner" | "admin" | "editor" | "viewer"): Promise<TWorkspaceMember>;
    createInvite(data: any): Promise<void>;
    getInviteByToken(token: string): Promise<any | null>;
    updateInvite(id: string, data: any): Promise<void>;
    findById(id: string): Promise<TWorkspace | null>;
    findBySlug(slug: string): Promise<TWorkspace | null>;
    findByInviteCode(inviteCode: string): Promise<TWorkspace | null>;
    findByUser(userId: string): Promise<any[]>;
    update(id: string, data: Partial<TWorkspace>): Promise<TWorkspace>;
    delete(id: string): Promise<void>;
    isMember(workspaceId: string, userId: string): Promise<boolean>;
    getMemberRole(workspaceId: string, userId: string): Promise<"owner" | "admin" | "editor" | "viewer" | null>;
    getMembers(workspaceId: string): Promise<any[]>;
    removeMember(workspaceId: string, userId: string): Promise<void>;
}

// Service interface for workspace
export interface IWorkspaceService {
    createWorkspace(userId: string, dto: ICreateWorkspaceDto): Promise<TWorkspace>;
    getUserWorkspaces(userId: string): Promise<any[]>;
    getWorkspaceById(userId: string, workspaceId: string): Promise<IWorkspaceResponse>;
    updateWorkspace(userId: string, workspaceId: string, dto: IUpdateWorkspaceDto): Promise<any>;
    deleteWorkspace(userId: string, workspaceId: string): Promise<void>;
    inviteUser(userId: string, workspaceId: string, email: string, role: "owner" | "admin" | "editor" | "viewer"): Promise<void>;
    inviteUsers(userId: string, workspaceId: string, invitations: { email: string, role: "owner" | "admin" | "editor" | "viewer" }[]): Promise<void>;
    acceptInvite(userId: string, token: string): Promise<void>;
    updateMemberRole(userId: string, workspaceId: string, targetUserId: string, newRole: "admin" | "editor" | "viewer"): Promise<void>;
    removeMember(userId: string, workspaceId: string, targetUserId: string): Promise<void>;
}
