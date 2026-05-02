import { Queue } from "bullmq";
import { bullmqConnection } from "../connection.js";

// queue for handling snapshot generation and r2 uploads
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
        stateBuffer: stateBuffer.toString('base64'),
        isAutoSaved
    }, {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
    });
};
