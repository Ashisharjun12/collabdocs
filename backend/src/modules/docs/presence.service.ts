import { bullmqConnection } from "../../infrastructure/bullmq/connection.js";
import { logger } from "../../utils/logger.js";

// manages presence of users in a document
export class PresenceService {
   // add user to presence
    static async addUser(documentId: string, userId: string): Promise<void> {
        try {
            const key = `doc:${documentId}:presence`;
            await bullmqConnection.sadd(key, userId);
            
           // set expiry of 2 hours on the whole set just to be safe against ghost data
            await bullmqConnection.expire(key, 7200);
            
            logger.debug({ documentId, userId }, "User added to document presence");
        } catch (error) {
            logger.error({ err: error, documentId, userId }, "Failed to add user to presence");
        }
    }

  // remove user from presence
    static async removeUser(documentId: string, userId: string): Promise<void> {
        try {
            const key = `doc:${documentId}:presence`;
            await bullmqConnection.srem(key, userId);
            logger.debug({ documentId, userId }, "User removed from document presence");
        } catch (error) {
            logger.error({ err: error, documentId, userId }, "Failed to remove user from presence");
        }
    }

  // get active users 
    static async getActiveUsers(documentId: string): Promise<string[]> {
        try {
            const key = `doc:${documentId}:presence`;
            return await bullmqConnection.smembers(key);
        } catch (error) {
            logger.error({ err: error, documentId }, "Failed to get active users");
            return [];
        }
    }

   // clear document presence
    static async clearDocument(documentId: string): Promise<void> {
        try {
            const key = `doc:${documentId}:presence`;
            await bullmqConnection.del(key);
        } catch (error) {
            logger.error({ err: error, documentId }, "Failed to clear document presence");
        }
    }
}
