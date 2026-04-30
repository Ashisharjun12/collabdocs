import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "../user/user.repository.js";
import { UserService } from "../user/user.service.js";
import passport from "passport";
import { _config } from "../../config/config.js";
import { authGuard } from "../../gateway/auth-guard.js";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { WorkspaceService } from "../workspace/workspace.service.js";

const router = Router();

// Initialization
const authRepository = new AuthRepository();
const userRepository = new UserRepository();
const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository , userRepository);
const userService = new UserService(userRepository);
const authService = new AuthService(authRepository, userService, workspaceService);
const authController = new AuthController(authService);

// 1. Standard Auth Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verify", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// google oauth
router.get("/google", passport.authenticate("google", { session: false, scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${_config.CLIENT_URL}/auth/login`,
  }),
  authController.googleCallback
);

// 3. Session Management
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// 4. Status/Profile
router.get("/me", authGuard, authController.me);
router.get("/sessions", authGuard, authController.getSessions);
router.delete("/sessions/:sessionId", authGuard, authController.revokeSession);

export default router;