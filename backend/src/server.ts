import { createServer } from "http";
import { App } from "./app.js";
import { _config } from "./config/config.js";
import { logger } from "./utils/logger.js";
import { initDatabases } from "./infrastructure/db/index.js";
import "./infrastructure/bullmq/mail/mail.worker.js"; 
import "./infrastructure/bullmq/snapshot/snapshot.worker.js"; 
import "./infrastructure/bullmq/docs/docs.worker.js"; 
import { Gateway } from "./gateway/index.js";
import { BloomFilterService } from "./shared/services/BloomFilterService.js";
const AppInstance = new App();
const app = AppInstance.getApp();
const httpServer = createServer(app);

const start = async () => {
    try {
        await initDatabases();

        logger.info("BullMQ Worker initialized");

         // 1. Initialize Bloom Filter for fast lookups
       await BloomFilterService.getInstance().initialize();

        // Initialize Gateway Websocket & Services
        await Gateway.setupWebsocket(httpServer);

        httpServer.listen(_config.PORT, () => {
            logger.info(`Server is running on port ${_config.PORT}`);
        }).on("error", (error) => {
            logger.fatal(error, "Server failed to start");
            process.exit(1);
        });
    } catch (error) {
        logger.fatal(error, "Failed to initialize server");
        process.exit(1);
    }
};

void start();

