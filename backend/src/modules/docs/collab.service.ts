import { hocuspocusServer } from "../../gateway/hocuspocus.js";
import { PresenceService } from "./presence.service.js";
import { logger } from "../../utils/logger.js";

//  bridge between rest apis and websocket server
export class CollabService {
    // evict all users from document
    static async evictAll(documentId: string): Promise<void> {
        try {
            logger.info({ documentId }, "Evicting all users from document WebSocket");
            
            // 1. Tell Hocuspocus to close connections for this document
            const server = hocuspocusServer as any;
            
            // Try the direct method first (if it exists in the runtime version)
            if (typeof server.closeConnections === 'function') {
                server.closeConnections(documentId);
            } 
            // Fallback to manually iterating the documents map
            else if (server.documents) {
                const doc = server.documents.get(documentId);
                if (doc && doc.connections) {
                    doc.connections.forEach((conn: any) => {
                        if (conn.connection && typeof conn.connection.close === 'function') {
                            conn.connection.close();
                        }
                    });
                }
            }
            
            // 2. Clear the presence tracking in Redis
            await PresenceService.clearDocument(documentId);
            
        } catch (error) {
            logger.error({ err: error, documentId }, "Failed to evict users from document");
        }
    }

    // evict specific user from document
    static evictUser(documentId: string, userId: string): void {
        try {
            const server = hocuspocusServer as any;
            if (server.documents) {
                const doc = server.documents.get(documentId);
                if (doc && doc.connections) {
                    doc.connections.forEach((conn: any) => {
                        if (conn.context?.user?.id === userId && conn.connection && typeof conn.connection.close === 'function') {
                            conn.connection.close();
                            logger.info({ documentId, userId }, "Evicted specific user from WebSocket");
                        }
                    });
                }
            }
        } catch (error) {
            logger.error({ err: error, documentId, userId }, "Failed to evict specific user");
        }
    }
}
