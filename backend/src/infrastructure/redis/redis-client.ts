import { createClient, RedisClientType } from "redis";
import { _config } from "../../config/config.js";
import { logger } from "../../utils/logger.js";

export class RedisClient {
    private static connected = false;
    private static client: RedisClientType = createClient({
        url: _config.REDIS_DATABASE_URI!,
        socket: {
            connectTimeout: 5000,
            reconnectStrategy: (retries) => {
                return Math.min(retries * 50, 2000);
            }
        }
    });

    static async connect(): Promise<void> {
        if (RedisClient.connected) return;

        try {
            RedisClient.client.on("error", (err) => {
                logger.error(err, "Redis error");
            });

            await RedisClient.client.connect();
            RedisClient.connected = true;
            logger.info("Successfully connected to the redis database");
        } catch (error) {
            logger.fatal(error, "redis Database connection failed");
            process.exit(1);
        }
    }

    //get connection
    static getConnection(): RedisClientType {
        return RedisClient.client;
    }
}
