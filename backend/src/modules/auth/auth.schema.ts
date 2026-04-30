import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "../user/user.schema.js"; 
import z from "zod";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  hashedToken: varchar("hashed_token", { length: 255 }).notNull(),
  deviceInfo: text("device_info"),
  ipAddress: varchar("ip_address", { length: 45 }),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//interfaces
export type TRefreshToken = typeof refreshTokens.$inferSelect;
export type TCreateRefreshToken = typeof refreshTokens.$inferInsert;


//zod 
const createSessionSchema = z.object({
    userId: z.string().uuid(),
    token: z.string().min(1),
    deviceInfo: z.string().optional(),
    ipAddress: z.string().optional(),
    expiresAt: z.coerce.date()
})



//exporting the zod schema
export type TCreateSessionDto = z.infer<typeof createSessionSchema>;