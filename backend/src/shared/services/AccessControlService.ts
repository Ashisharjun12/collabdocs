import { eq, and, or } from "drizzle-orm";
import { db } from "../../infrastructure/postgres/postgres-client.js";
import { documents, documentMembers, shareLinks } from "../../modules/docs/docs.schema.js";
import { workspaceMembers, workspaces } from "../../modules/workspace/workspace.schema.js";

export type TPermissionRole = 'viewer' | 'commenter' | 'editor' | 'owner';
export type TWorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export class AccessControlService {
    /**
     * WORKSPACE PERMISSIONS
     */
    static async getWorkspaceRole(userId: string, workspaceId: string): Promise<TWorkspaceRole | null> {
        const member = await db.query.workspaceMembers.findFirst({
            where: and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, userId)
            )
        });
        return (member?.role as TWorkspaceRole) || null;
    }

    static async hasWorkspaceAccess(userId: string, workspaceId: string, requiredRole: TWorkspaceRole): Promise<boolean> {
        const role = await this.getWorkspaceRole(userId, workspaceId);
        if (!role) return false;

        const roleWeights: Record<TWorkspaceRole, number> = {
            'viewer': 1,
            'editor': 2,
            'admin': 3,
            'owner': 4
        };

        return roleWeights[role] >= roleWeights[requiredRole];
    }

    /**
     * DOCUMENT PERMISSIONS
     */
    static async getDocumentRole(userId: string | null, docId: string, shareToken?: string): Promise<TPermissionRole | null> {
        // 1. Fetch document 
        const doc = await db.query.documents.findFirst({
            where: eq(documents.id, docId)
        });

        if (!doc) return null;

        // 2. PRIORITY: Check for a valid Share Token first (e.g. Guest with link)
        if (shareToken) {
            // Check if it matches the document's primary shareToken
            if (doc.shareToken && doc.shareToken === shareToken) {
                return 'viewer'; // Document-level public token grants viewer access
            }

            // Also check for explicit share links (legacy/advanced)
            const link = await db.query.shareLinks.findFirst({
                where: and(
                    eq(shareLinks.documentId, docId),
                    eq(shareLinks.token, shareToken)
                )
            });

            if (link) {
                // Check expiration
                if (!link.expiresAt || new Date() < new Date(link.expiresAt)) {
                    return link.role as TPermissionRole;
                }
            }
        }


        // If no user ID provided (and token failed), return null
        if (!userId) {
            // Public documents allow viewing even without a token/user
            return doc.visibility === 'public' ? 'viewer' : null;
        }

        // 3. Check if user is the Document Owner
        if (doc.ownerId === userId) return 'owner';

        // 4. Check Workspace-level role
        const wsRole = await this.getWorkspaceRole(userId, doc.workspaceId);

        // Workspace Admins/Owners get Owner rights on all docs
        if (wsRole === 'owner' || wsRole === 'admin') return 'owner';

        // 5. Check Document-level explicit members (Overrides)
        const docMember = await db.query.documentMembers.findFirst({
            where: and(
                eq(documentMembers.documentId, docId),
                eq(documentMembers.userId, userId)
            )
        });

        const explicitRole = docMember?.role as TPermissionRole;

        // 6. Handle Visibility Inheritance
        if (doc.visibility === 'workspace' && wsRole) {
            const inheritedRole = this.mapWorkspaceToDocRole(wsRole);
            return this.getHigherRole(inheritedRole, explicitRole);
        }

        if (doc.visibility === 'public') {
            return this.getHigherRole('viewer', explicitRole);
        }

        return explicitRole || null;
    }

    static async hasAccess(userId: string | null, docId: string, requiredRole: TPermissionRole, shareToken?: string): Promise<boolean> {
        const role = await this.getDocumentRole(userId, docId, shareToken);
        if (!role) return false;

        const roleWeights: Record<TPermissionRole, number> = {
            'viewer': 1,
            'commenter': 2,
            'editor': 3,
            'owner': 4
        };

        return roleWeights[role] >= roleWeights[requiredRole];
    }

    private static mapWorkspaceToDocRole(wsRole: string): TPermissionRole {
        switch (wsRole) {
            case 'owner':
            case 'admin': return 'owner';
            case 'editor': return 'editor';
            default: return 'viewer';
        }
    }

    private static getHigherRole(roleA: TPermissionRole | undefined, roleB: TPermissionRole | undefined): TPermissionRole {
        const roleWeights: Record<TPermissionRole, number> = {
            'viewer': 1,
            'commenter': 2,
            'editor': 3,
            'owner': 4
        };

        const weightA = roleA ? roleWeights[roleA] : 0;
        const weightB = roleB ? roleWeights[roleB] : 0;

        return weightA >= weightB ? (roleA as TPermissionRole) : (roleB as TPermissionRole);
    }
}
