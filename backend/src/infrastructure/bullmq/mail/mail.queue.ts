import { Queue } from "bullmq";
import { bullmqConnection } from "../connection.js";

export const MAIL_QUEUE_NAME = "mail-queue";

export const mailQueue = new Queue(MAIL_QUEUE_NAME, {
    connection: bullmqConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    }
});

// add mail to queue
export const addMailToQueue = async (to: string, subject: string, template: string, data: any) => {
    await mailQueue.add("send-email", { to, subject, template, data });
};
