 import { PostgresClient } from "../postgres/postgres-client.js";
 import { RedisClient } from "../redis/redis-client.js";
import { logger } from "../../utils/logger.js";

 export const initDatabases = async (): Promise<void> => {
    try{
    await PostgresClient.connect();
    logger.info("Postgres connected successfully");
    await RedisClient.connect();
    logger.info("Redis connected successfully");
    logger.info("All databases connected successfully");
 }catch(err){
    logger.error(err, "Database connection failed");
    process.exit(1);
 }
 }