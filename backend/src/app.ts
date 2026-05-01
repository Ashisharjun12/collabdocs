import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { httpLogger } from "./shared/middlewares/logger.middleware.js";
import { errorHandler } from "./gateway/error-handler.js";
import { Gateway } from "./gateway/index.js";
import { corsOption } from "./gateway/cors.js";
import passport from "passport";
import { initGoogleStrategy } from "./modules/auth/google.strategy.js";
import { initJwtStrategy } from "./modules/auth/jwt.strategy.js";

export class App {
    private app: Application;

    constructor() {
        this.app = express();
        this.app.set("trust proxy", 1);
        this.setupCoreMiddlewares();
        this.setupGateway();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupCoreMiddlewares() {
        this.app.use(helmet());
        this.app.use(cors(corsOption));
        this.app.use(httpLogger);
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(express.urlencoded({ extended: true }));

        // Passport Initialization
        this.app.use(passport.initialize());
        initGoogleStrategy();
        initJwtStrategy();
    }
 
    
    private setupGateway() {
        Gateway.apply(this.app);
    }
    private setupRoutes() {
        this.app.get("/api/health", (req, res) => {
            res.status(200).json({
                status: "ok",
                message: "server is running.",
                timestamp: new Date().toISOString()
            });
        });
    }
    private setupErrorHandling() {
        this.app.use(errorHandler);
    }

    public getApp() {
        return this.app;
    }
}
