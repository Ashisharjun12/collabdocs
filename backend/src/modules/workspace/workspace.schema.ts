import { boolean, pgTable, text, uuid, varchar , timestamp, pgEnum, uniqueIndex   } from "drizzle-orm/pg-core";
import { users } from "../user/user.schema.js";


// workspace visibility enum
export const visibilityEnum = pgEnum("workspace_visibility", ["private", "team", "public"]);
// member role enum
export const memberRoleEnum = pgEnum("member_role",["owner" , "admin" ,"editor" ,"viewer"])



export const workspaces = pgTable("workspaces",{
    id:uuid("id").primaryKey().defaultRandom(),
    name:varchar("name",{length:255}).notNull(),
    slug:varchar("slug",{length:255}).notNull().unique(),
    ownerId:uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logo: text("logo"),
    logoType: varchar("logo_type", { length: 20 }).notNull().default("generated"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    inviteCode: varchar("invite_code", { length: 255 }).notNull().unique(),
    linkRole: memberRoleEnum("link_role").notNull().default("viewer"),
    isPersonal: boolean("is_personal").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type TWorkspace = typeof workspaces.$inferSelect;
export type TCreateWorkspace = typeof workspaces.$inferInsert;



//workspace members

export const workspaceMembers = pgTable("workspace_members",{
    id:uuid("id").primaryKey().defaultRandom(),
    workspaceId:uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    userId:uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role:memberRoleEnum("role").notNull().default("owner"),
    joinedAt:timestamp("joined_at").defaultNow().notNull(),

},(t)=>{
    return [uniqueIndex("workspace_user_unique").on(t.workspaceId, t.userId)]
})

//types
export type TWorkspaceMember = typeof workspaceMembers.$inferSelect;
export type TCreateWorkspaceMember = typeof workspaceMembers.$inferInsert;


// workspace Invites
export const workspaceInvites = pgTable("workspace_invites", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    role: memberRoleEnum("role").notNull().default("editor"),
    invitedBy: uuid("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    accepted: boolean("accepted").notNull().default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type TWorkspaceInvite = typeof workspaceInvites.$inferSelect;
export type TCreateWorkspaceInvite = typeof workspaceInvites.$inferInsert;
