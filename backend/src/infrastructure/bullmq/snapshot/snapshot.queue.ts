import { Queue } from "bullmq";
import { bullmqConnection } from "../connection.js";

// Queue for handling Yjs Snapshot generation and R2 uploads
export const snapshotQueue = new Queue("snapshot-queue", {
    connection: bullmqConnection,
});

export const addSnapshotJob = async (
    documentId: string, 
    userId: string | null, 
    name: string | null, 
    stateBuffer: Buffer, 
    isAutoSaved: boolean
) => {
    return await snapshotQueue.add("create-snapshot", {
        documentId,
        userId,
        name,
        // Buffers are automatically serialized by BullMQ, but to be safe we can pass it as a base64 string or let BullMQ handle the buffer directly.
        // BullMQ uses ioredis which uses JSON.stringify, so Buffers become { type: 'Buffer', data: [...] }
        stateBuffer: stateBuffer.toString('base64'),
        isAutoSaved
    }, {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
    });
};
