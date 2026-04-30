import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { db } from '../../postgres/postgres-client.js';
import { documents } from '../../../modules/docs/docs.schema.js';
import { eq } from 'drizzle-orm';
import { bullmqConnection } from '../connection.js';
import { _config } from '../../../config/config.js';
import { logger } from '../../../utils/logger.js';

export const docsWorker = new Worker(
  'docs-conversion',
  async (job: Job) => {
    const { fileKey, docId } = job.data;
    logger.info({ docId, fileKey }, '[Worker] Starting conversion');

    try {
      // 1. Call Python Converter Service
      const response = await axios.post(`${_config.CONVERTER_SERVICE_URL}/convert`, {
        file_key: fileKey,
      });

      if (response.data.status !== 'success') {
        throw new Error(`Python conversion failed: ${response.data.detail || 'Unknown error'}`);
      }

      const { blocks } = response.data;
      logger.info({ count: blocks?.length || 0, docId }, '[Worker] Blocks received from Python');

      // 2. Map Python blocks → BlockNote block format
      // BlockNote block format: { id, type, props, content: [{type:'text', text:'...', styles:{}}], children:[] }
      const bnBlocks = blocks
        .filter((block: any) => block.type !== 'page-break') // editor CSS handles page layout
        .map((block: any, i: number) => {
        const id = `import-${i}-${Math.random().toString(36).substr(2, 5)}`;

        if (block.type === 'heading') {
          return {
            id,
            type: 'heading',
            props: {
              level: block.props?.level || 1,
              textColor: 'default',
              backgroundColor: 'default',
              textAlignment: 'left',
            },
            content: block.content ? [{ type: 'text', text: block.content, styles: {} }] : [],
            children: [],
          };
        }

        // Default: paragraph
        return {
          id,
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: block.content ? [{ type: 'text', text: block.content, styles: {} }] : [],
          children: [],
        };
      });

      logger.info({ count: bnBlocks.length, docId }, '[Worker] BlockNote blocks mapped');

      // 3. Save blocks as JSON + mark as active
      // The frontend will use BlockNote's own blocksToYXmlFragment to load these into the editor
      await db.update(documents)
        .set({
          importedBlocks: JSON.stringify(bnBlocks),
          importStatus: 'active',
          updatedAt: new Date(),
        })
        .where(eq(documents.id, docId));

      // 4. Signal Hocuspocus to reload (evict empty in-memory state)
      await bullmqConnection.publish('hocuspocus:reload', JSON.stringify({ documentName: docId }));

      logger.info({ docId, blocks: bnBlocks.length }, '[Worker] Import complete');
      return { success: true, blocksCount: bnBlocks.length };

    } catch (error: any) {
      // Mark as failed so UI doesn't hang
      await db.update(documents)
        .set({ importStatus: 'failed', updatedAt: new Date() })
        .where(eq(documents.id, docId));

      logger.error({ docId, error: error.message }, '[Worker] Conversion failed');
      throw error;
    }
  },
  {
    connection: bullmqConnection,
    concurrency: 5,
  }
);
