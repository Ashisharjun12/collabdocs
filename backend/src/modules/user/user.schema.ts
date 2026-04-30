import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const userRoleEnum = pgEnum("user_role", ["admin", "user", "super_admin"])


export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    email_verified: boolean("email_verified").notNull().default(false),
    password: varchar("password", { length: 255 }),
    google_id: varchar("google_id", { length: 255 }).unique(),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("user"),
    version: integer("version").notNull().default(1),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

// interfaces
export type TUser = typeof users.$inferSelect;
export type TCreateUser = typeof users.$inferInsert;
export type TUserRole = (typeof userRoleEnum.enumValues)[number];