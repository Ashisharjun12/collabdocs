import { Server } from '@hocuspocus/server';
import { Redis } from '@hocuspocus/extension-redis';
import { Database } from '@hocuspocus/extension-database';
import { _config } from '../config/config.js';
import jwt from 'jsonwebtoken';
import * as Y from 'yjs';
import { db } from '../infrastructure/postgres/postgres-client.js';
import { documents } from '../modules/docs/docs.schema.js';
import { eq } from 'drizzle-orm';
import { AccessControlService } from '../shared/services/AccessControlService.js';
import { logger } from '../utils/logger.js';
import { bullmqConnection } from '../infrastructure/bullmq/connection.js';
import { addSnapshotJob } from '../infrastructure/bullmq/snapshot/snapshot.queue.js';
import { PresenceService } from '../modules/docs/presence.service.js';
import { R2StorageService } from '../infrastructure/storage/r2.service.js';

const r2 = new R2StorageService();

// Rate-limit tracker 
const lastAutoSaveTracker = new Map<string, number>();
const AUTO_SAVE_INTERVAL_MS = _config.AUTO_SAVE_INTERVAL_MS!;

// R2 live document state
const docStateKey = (docId: string) => `documents/${docId}/state.bin`;

const parseCookies = (cookieString: string) => {
  if (!cookieString) return {};
  return cookieString.split(';').reduce((res, c) => {
    const parts = c.trim().split('=');
    if (parts.length === 2) res[parts[0]] = parts[1];
    return res;
  }, {} as Record<string, string>);
};

// Sentinel: 
const createSentinelState = (): Uint8Array => {
  const sentinel = new Y.Doc();
  return Y.encodeStateAsUpdate(sentinel);
};

export const hocuspocusServer = new Server({
  name: _config.COLLAB_SERVICE_NAME!,
  port: Number(_config.COLLAB_SERVICE_PORT!),
  debounce: 500,


  extensions: [
    ...(bullmqConnection ? [new Redis({ redis: bullmqConnection })] : []),
    new Database({
      fetch: async ({ documentName }) => {
        try {
          const doc = await db.query.documents.findFirst({
            where: eq(documents.id, documentName),
            columns: { contentR2Key: true, importStatus: true },
          });

          if (doc?.importStatus === 'importing') {
            logger.info({ documentName }, '[Hocuspocus] Doc importing — returning sentinel');
            return createSentinelState();
          }

          const key = doc?.contentR2Key ?? docStateKey(documentName);
          const buffer = await r2.downloadBuffer(key);

          if (!buffer) {
            logger.info({ documentName }, '[Hocuspocus] No state in R2 — new document');
            return null;
          }

          logger.info({ documentName, key, bytes: buffer.length }, '[Hocuspocus] State loaded from R2');
          return new Uint8Array(buffer);

        } catch (err) {
          logger.error({ err, documentName }, '[Hocuspocus] fetch failed');
          return null;
        }
      },


      store: async ({ documentName, state }) => {
        try {
          const doc = await db.query.documents.findFirst({
            where: eq(documents.id, documentName),
            columns: { importStatus: true, ownerId: true, contentR2Key: true },
          });

          if (doc?.importStatus === 'importing') {
            logger.info({ documentName }, '[Hocuspocus] Store SKIPPED — doc IMPORTING');
            return;
          }

          // Extract title from Yjs shared text
          const tempYdoc = new Y.Doc();
          Y.applyUpdate(tempYdoc, state);
          const title = tempYdoc.getText('title').toString();

          const stateBuffer = Buffer.from(state);
          const key = doc?.contentR2Key ?? docStateKey(documentName);

          // 1. Upload Yjs binary to R2
          await r2.uploadBuffer(key, stateBuffer);
          logger.info({ documentName, key, bytes: stateBuffer.length }, '[Hocuspocus] State saved to R2');

          
          await db.update(documents)
            .set({
              contentR2Key: key,
              importedBlocks: null, 
              title: title || undefined,
              updatedAt: new Date(),
            })
            .where(eq(documents.id, documentName));


          // 3. Rate-limited R2 snapshot (version history)
          const lastSave = lastAutoSaveTracker.get(documentName) || 0;
          const now = Date.now();
          if (now - lastSave >= AUTO_SAVE_INTERVAL_MS) {
            await addSnapshotJob(documentName, doc?.ownerId ?? null, null, stateBuffer, true);
            lastAutoSaveTracker.set(documentName, now);
            logger.info({ documentName }, '[Hocuspocus] Triggered R2 auto-save snapshot');
          }

        } catch (error) {
          logger.error({ error, documentName }, '[Hocuspocus] Failed to store document');
        }
      },
    }),


  ],


  async onAuthenticate({ request, documentName, token: connectionToken }) {
    const cookieHeader = (request.headers as any).cookie;

    const cookies = parseCookies(cookieHeader || '');
    const token = connectionToken || cookies['access_token'];

    if (!token) {
      // Fallback for Public Documents
      const role = await AccessControlService.getDocumentRole(null, documentName);
      if (role === 'viewer') {
        logger.info({ documentName }, '[Hocuspocus] Guest access granted (Public doc)');

        return {
          user: { id: 'guest', name: 'Guest Viewer', email: 'guest@flow.io' },
          role: 'viewer',
        };
      }
      
      logger.warn({ documentName }, '[Hocuspocus] Auth failed: no token and not public');
      throw new Error('Not authenticated');
    }


    try {
      const payload = jwt.verify(token, _config.JWT_SECRET!) as any;
      const userId = payload.sub;
      const role = await AccessControlService.getDocumentRole(userId, documentName);
      if (!role) throw new Error('Forbidden');

      return {
        user: { id: userId, name: payload.name || 'Anonymous', email: payload.email },
        role,
      };
    } catch {
      throw new Error('Invalid token');
    }
  },

  async onConnect({ documentName, context }) {
    if (context?.user?.id) {
      await PresenceService.addUser(documentName, context.user.id);
    }
  },

  async onDisconnect({ documentName, context }) {
    if (context?.user?.id) {
      await PresenceService.removeUser(documentName, context.user.id);
    }
  },
});

if (bullmqConnection) {
  const sub = bullmqConnection.duplicate();
  sub.subscribe('hocuspocus:reload').catch((err) => {
    logger.error(err, '[Hocuspocus] Failed to subscribe to reload channel');
  });


  sub.on('message', async (channel, message) => {
    if (channel !== 'hocuspocus:reload') return;

    const { documentName } = JSON.parse(message);
    logger.info({ documentName }, '[Hocuspocus] Reload signal — evicting from memory');

    lastAutoSaveTracker.delete(documentName);

    const internalDoc = (hocuspocusServer as any).documents?.get(documentName);
    if (internalDoc) {
      internalDoc.connections?.forEach((conn: any) => {
        try { conn.connection?.close(); } catch {}
      });
      (hocuspocusServer as any).documents?.delete(documentName);
    }
  });
}
