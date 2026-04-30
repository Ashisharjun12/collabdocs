import { db } from "../../infrastructure/postgres/postgres-client.js";
import { IAuthRepository } from "./auth.interface.js";
import { refreshTokens, TRefreshToken, TCreateSessionDto } from "./auth.schema.js";
import { eq, and } from "drizzle-orm";
import { RedisClient } from "../../infrastructure/redis/redis-client.js";

export class AuthRepository implements IAuthRepository {
    // create session 
    async createSession(data: any): Promise<TRefreshToken> {
        // Mapping 'token' from DTO to 'hashedToken' in DB if necessary
        const insertData = {
            userId: data.userId,
            hashedToken: data.token,
            deviceInfo: data.deviceInfo,
            ipAddress: data.ipAddress,
            expiresAt: data.expiresAt
        };
        const session = await db.insert(refreshTokens).values(insertData).returning();
        return session[0];
    }

    // find session by token
    async findSessionByToken(token: string): Promise<TRefreshToken | null> {
        const result = await db
            .select()
            .from(refreshTokens)
            .where(and(eq(refreshTokens.hashedToken, token), eq(refreshTokens.isRevoked, false)))
            .limit(1);
        return result[0] || null;
    }

    // revoke specific session
    async revokeSession(id: string): Promise<void> {
        await db
            .update(refreshTokens)
            .set({ isRevoked: true })
            .where(eq(refreshTokens.id, id));
    }

    // revoke all sessions for a user
    async revokeAllUserSessions(userId: string): Promise<void> {
        await db
            .update(refreshTokens)
            .set({ isRevoked: true })
            .where(eq(refreshTokens.userId, userId));
    }

    // find all active sessions for a user
    async findUserSessions(userId: string): Promise<TRefreshToken[]> {
        return await db
            .select()
            .from(refreshTokens)
            .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.isRevoked, false)));
    }

    // check if access token is blacklisted in Redis
    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await RedisClient.getConnection().get(`blacklist:${token}`);
        return !!result;
    }

    // add access token to Redis blacklist
    async blacklistToken(token: string, ttl: number): Promise<void> {
        await RedisClient.getConnection().set(`blacklist:${token}`, "true", {
            EX: ttl,
        });
    }
}