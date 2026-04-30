import { db } from "../../infrastructure/postgres/postgres-client.js";
import { documentChats, TDocumentChat, TCreateDocumentChat } from "./docs.schema.js";
import { eq, desc, and, lt } from "drizzle-orm";
import { users } from "../user/user.schema.js";

export class DocsChatRepository {
 // save message
  async saveMessage(data: TCreateDocumentChat): Promise<TDocumentChat> {
    const [message] = await db.insert(documentChats)
      .values(data)
      .returning();
    return message;
  }

  // get chat history 
  async getChatHistory(docId: string, limit: number = 50, cursor?: string) {
    const query = db.select({
      id: documentChats.id,
      content: documentChats.content,
      type: documentChats.type,
      createdAt: documentChats.createdAt,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      }
    })
    .from(documentChats)
    .innerJoin(users, eq(documentChats.userId, users.id))
    .where(
      cursor 
        ? and(eq(documentChats.documentId, docId), lt(documentChats.id, cursor))
        : eq(documentChats.documentId, docId)
    )
    .orderBy(desc(documentChats.createdAt))
    .limit(limit);

    return await query;
  }
}

export const docsChatRepository = new DocsChatRepository();
