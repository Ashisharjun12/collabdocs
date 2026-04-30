import { Worker, Job } from "bullmq";
import { _config } from "../../../config/config.js";
import { MAIL_QUEUE_NAME } from "./mail.queue.js";
import { resendService } from "../../mail/resend.service.js";
import { logger } from "../../../utils/logger.js";
import { bullmqConnection } from "../connection.js";

export const mailWorker = new Worker(
    MAIL_QUEUE_NAME,
    async (job: Job) => {
        const { to, subject, template, data } = job.data;
        logger.info(`Processing mail job ${job.id} for ${to}`);

        try {
            await resendService.sendEmail(to, subject, template, data);
            logger.info(`Successfully sent email to ${to}`);
        } catch (error) {
            logger.error(error, `Failed to send email to ${to} in job ${job.id}`);
            throw error;
        }
    },
    { connection: bullmqConnection }
);

mailWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} has completed!`);
});

mailWorker.on("failed", (job, err) => {
    logger.error(`${job?.id} has failed with ${err.message}`);
});
