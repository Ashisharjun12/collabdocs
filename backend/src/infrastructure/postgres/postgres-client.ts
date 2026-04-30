
import { _config } from '../../config/config.js';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";
import { logger } from '../../utils/logger.js';

export class PostgresClient {
    private static connected = false;
    private static pool = new Pool({
        connectionString: _config.POSTGRES_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    public static db = drizzle(PostgresClient.pool, { schema });

    static async connect(): Promise<void> {
        if (PostgresClient.connected) return;

        try {
            const client = await PostgresClient.pool.connect();
            PostgresClient.connected = true;
            logger.info("Successfully connected to the postgres database");
            client.release();
        } catch (error) {
            logger.fatal(error, "Postgres Database connection failed");
            process.exit(1);
        }
    }

    //get connection
    static getConnection() {
        if (!PostgresClient.connected) {
            throw new Error("postgres not connected");
        }
        return PostgresClient.db;
    }
}
export const db = PostgresClient.db;
