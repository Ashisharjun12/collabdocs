import { Queue } from 'bullmq';
import { bullmqConnection } from "../connection.js";

export const docsQueue = new Queue('docs-conversion', {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

export const addConversionJob = async (data: { fileKey: string; docId: string; userId: string }) => {
  return await docsQueue.add('convert-file', data);
};