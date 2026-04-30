import { db } from "../../infrastructure/postgres/postgres-client.js";
import { IWorkspaceRepository } from "./workspace.interface.js";
import { workspaces, workspaceMembers, workspaceInvites, TWorkspace, TWorkspaceMember, TCreateWorkspace } from "./workspace.schema.js";
import { users } from "../user/user.schema.js";
import { eq, and, ne } from "drizzle-orm";

export class WorkspaceRepository implements IWorkspaceRepository {
    // remove a member
    async removeMember(workspaceId: string, userId: string): Promise<void> {
        await db.delete(workspaceMembers)
            .where(
                and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, userId),
                    ne(workspaceMembers.role, "owner")
                )
            );
    }

    // create a new workspace
    async create(data: TCreateWorkspace): Promise<TWorkspace> {
        const result = await db.insert(workspaces).values(data).returning();
        return result[0];
    }

    // add a member to workspace
    async addMember(workspaceId: string, userId: string, role: "owner" | "admin" | "editor" | "viewer"): Promise<TWorkspaceMember> {
        const result = await db.insert(workspaceMembers).values({
            workspaceId,
            userId,
            role
        })
        .onConflictDoUpdate({
            target: [workspaceMembers.workspaceId, workspaceMembers.userId],
            set: { role }
        })
        .returning();
        return result[0];
    }

    // find workspace by id
    async findById(id: string): Promise<TWorkspace | null> {
        const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
        return result[0] || null;
    }

    // find workspace by slug
    async findBySlug(slug: string): Promise<TWorkspace | null> {
        const result = await db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1);
        return result[0] || null;
    }

    // find workspace by invite code
    async findByInviteCode(inviteCode: string): Promise<TWorkspace | null> {
        const result = await db.select().from(workspaces).where(eq(workspaces.inviteCode, inviteCode)).limit(1);
        return result[0] || null;
    }

    // find workspace by user
    async findByUser(userId: string): Promise<any[]> {
        const result = await db
            .select({
                id: workspaces.id,
                name: workspaces.name,
                slug: workspaces.slug,
                ownerId: workspaces.ownerId,
                logo: workspaces.logo,
                logoType: workspaces.logoType,
                visibility: workspaces.visibility,
                inviteCode: workspaces.inviteCode,
                linkRole: workspaces.linkRole,
                isPersonal: workspaces.isPersonal,
                createdAt: workspaces.createdAt,
                updatedAt: workspaces.updatedAt,
                userRole: workspaceMembers.role,
            })
            .from(workspaces)
            .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
            .where(eq(workspaceMembers.userId, userId));
        return result;
    }

    //update workspace
    async update(id: string, data: Partial<TWorkspace>): Promise<TWorkspace> {
        const result = await db
            .update(workspaces)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(workspaces.id, id))
            .returning();
        return result[0];
    }

    // delete workspace
    async delete(id: string): Promise<void> {
        await db.delete(workspaces).where(eq(workspaces.id, id));
    }

    // check if user is a member of workspace
    async isMember(workspaceId: string, userId: string): Promise<boolean> {
        const result = await db
            .select()
            .from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
            .limit(1);
        return result.length > 0;
    }

    // get member role
    async getMemberRole(workspaceId: string, userId: string): Promise<"owner" | "admin" | "editor" | "viewer" | null> {
        const result = await db
            .select({ role: workspaceMembers.role })
            .from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
            .limit(1);
        
        return (result[0]?.role as any) || null;
    }
    async getMembers(workspaceId: string): Promise<any[]> {
        return await db
            .select({
                id: workspaceMembers.id,
                role: workspaceMembers.role,
                joinedAt: workspaceMembers.joinedAt,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    avatarUrl: users.avatarUrl,

                }
            })
            .from(workspaceMembers)
            .innerJoin(users, eq(workspaceMembers.userId, users.id))
            .where(eq(workspaceMembers.workspaceId, workspaceId));
    }

    async createInvite(data: any): Promise<void> {
        await db.insert(workspaceInvites).values(data);
    }

    async getInviteByToken(token: string): Promise<any | null> {
        const result = await db.select().from(workspaceInvites).where(eq(workspaceInvites.token, token)).limit(1);
        return result[0] || null;
    }

    async updateInvite(id: string, data: any): Promise<void> {
        await db.update(workspaceInvites).set(data).where(eq(workspaceInvites.id, id));
    }
}
