import { Application } from "express";
import { logger } from "../utils/logger.js";
import { apiRateLimitMiddleware, authRateLimitMiddleware } from "../infrastructure/redis/rate-limit.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.route.js";
import uploadRoutes from "../modules/upload/upload.route.js";
import workspaceRoutes from "../modules/workspace/workspace.route.js";
import docsRoutes from "../modules/docs/docs.routes.js";
import { Server as HttpServer } from "http";
import { SocketHandler } from "./socket-handler.js";


export class Gateway {
    public static apply(app: Application): void {
        const prefix = "/api/v1";

        logger.info("Initializing Gateway routes...");

        // Apply global API rate limit
        app.use(prefix, apiRateLimitMiddleware);

        // Register module routes
        app.use(`${prefix}/auth`, authRateLimitMiddleware, authRoutes);
        app.use(`${prefix}/users`, userRoutes);
        app.use(`${prefix}/upload`, uploadRoutes);
        app.use(`${prefix}/workspace`, workspaceRoutes);
        app.use(`${prefix}/docs`,docsRoutes)

        logger.info("Gateway routes initialized.");
    }

    // setup websocket
    public static async setupWebsocket(httpServer: HttpServer) {
       // Initialize Socket.io (for Chat & Presence)
       SocketHandler.init(httpServer);
       
       logger.info("Gateway Websocket & Services initialized.");
    }
}
