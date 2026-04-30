import { Router } from "express";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { authGuard } from "../../gateway/auth-guard.js";
import { customRole, ROLES } from "../../gateway/rbac.js";

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// auth guard
router.use(authGuard);

// profile routes
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.delete("/me", userController.deleteAccount);
router.get("/search", userController.searchUsers);


// admin routes
router.patch(
  "/role", 
  customRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), 
  userController.changeRole
);

export default router;
