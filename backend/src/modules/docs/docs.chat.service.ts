import { docsChatRepository } from "./docs.chat.repository.js";
import { logger } from "../../utils/logger.js";
import crypto from 'node:crypto';
import { SocketHandler } from "../../gateway/socket-handler.js";
import { db } from "../../infrastructure/postgres/postgres-client.js";
import { users } from "../user/user.schema.js";
import { eq } from "drizzle-orm";


export class DocsChatService {
  // send doc chat message

  async sendMessage(docId: string, userId: string, content: string, userProfile: any) {
    try {
      const messageId = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      // The message object as the frontend expects it
      let finalAvatar = userProfile.avatar || userProfile.avatarUrl || userProfile.avatar_url;
      let finalName = userProfile.name || userProfile.username;

      // FALLBACK: If profile data is missing (e.g., old JWT), fetch from DB once
      if (!finalAvatar || !finalName) {
        try {
          const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          if (dbUser) {
            finalAvatar = dbUser.avatarUrl || finalAvatar;
            finalName = dbUser.name || finalName;
          }
        } catch (dbErr) {
          logger.error({ err: dbErr, userId }, 'Fallback profile fetch failed');
        }
      }

      const broadcastPayload = {
        id: messageId,
        content: content,
        type: 'text',
        createdAt: createdAt,
        user: {
          id: userId,
          name: finalName,
          avatarUrl: finalAvatar,
          color: userProfile.color || '#1D9E75'
        }
      };

      // 1. INSTANT BROADCAST (Zero latency via Socket.io)
      try {
        SocketHandler.emitToRoom(docId, "chat_message", broadcastPayload);
        logger.info({ docId, messageId }, 'Broadcasting chat message via Socket.io');
      } catch (broadcastError) {
        logger.error({ err: broadcastError, docId }, 'Socket broadcast failed');
      }

      // 2. BACKGROUND SAVE (Async)
      // We return the payload immediately, DB happens in parallel
      docsChatRepository.saveMessage({
        id: messageId,
        documentId: docId,
        userId: userId,
        content: content,
        type: 'text',
        createdAt: new Date(createdAt)
      }).catch(err => {
        logger.error({ err, docId, userId }, 'Background chat save failed');
      });

      return broadcastPayload;
    } catch (error) {
      logger.error({ err: error, docId, userId }, 'Failed to send chat message');
      throw error;
    }
  }

  // get history  of doc chat
  async getHistory(docId: string, limit: number = 50, cursor?: string) {
    return await docsChatRepository.getChatHistory(docId, limit, cursor);
  }
}

export const docsChatService = new DocsChatService();
