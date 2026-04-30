import { Redis } from "ioredis";
import { _config } from "../../config/config.js";

// bullmq connection
export const bullmqConnection = new Redis(_config.REDIS_DATABASE_URI!, {
    maxRetriesPerRequest: null,
});
