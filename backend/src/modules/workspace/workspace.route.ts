import { Router } from "express"
import { WorkspaceController } from "./workspace.controller.js";
import { WorkspaceService } from "./workspace.service.js";
import { WorkspaceRepository } from "./workspace.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { authGuard } from "../../gateway/auth-guard.js";
import { checkWorkspaceRole, workspaceRoles } from "./workspace.middleware.js";

const router = Router()

const workspaceRepository = new WorkspaceRepository();
const userRepository = new UserRepository();
const workspaceService = new WorkspaceService(workspaceRepository, userRepository);
const workspaceController = new WorkspaceController(workspaceService);

// All workspace routes are protected
router.use(authGuard);

router.post("/", workspaceController.create);
router.get("/", workspaceController.getAll);
router.post("/accept-invite/:token", workspaceController.acceptInvite);
router.get("/:id", workspaceController.getOne);
router.patch("/:id", checkWorkspaceRole([workspaceRoles.OWNER, workspaceRoles.ADMIN]), workspaceController.update);
router.delete("/:id", checkWorkspaceRole([workspaceRoles.OWNER]), workspaceController.delete);
router.post("/:id/invite", checkWorkspaceRole([workspaceRoles.OWNER, workspaceRoles.ADMIN]), workspaceController.invite);
router.post("/:id/bulk-invite", checkWorkspaceRole([workspaceRoles.OWNER, workspaceRoles.ADMIN]), workspaceController.bulkInvite);
router.patch("/:id/members/:userId", checkWorkspaceRole([workspaceRoles.OWNER, workspaceRoles.ADMIN]), workspaceController.updateMemberRole);
router.delete("/:id/members/:userId", checkWorkspaceRole([workspaceRoles.OWNER, workspaceRoles.ADMIN, workspaceRoles.EDITOR, workspaceRoles.VIEWER]), workspaceController.removeMember);

export default router