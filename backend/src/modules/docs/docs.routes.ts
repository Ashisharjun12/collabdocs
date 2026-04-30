import { Router } from "express";
import { DocsController } from "./docs.controller.js";
import { DocsService } from "./docs.service.js";
import { DocsRepository } from "./docs.repository.js";
import{authGuard} from "../../gateway/auth-guard.js"


const router = Router();

// Dependency Injection
const docsRepository = new DocsRepository();
const docsService = new DocsService(docsRepository);
const docsController = new DocsController(docsService);

// Public routes 
router.get("/public/:slug", docsController.getPublicDoc);

router.use(authGuard);


// Routes
router.get("/favorites/:workspaceId", docsController.getFavorites);
router.post("/", docsController.createDoc);
router.post("/import", docsController.importDocFromFile);
router.get("/:id", docsController.getDoc);
router.get("/workspace/:workspaceId", docsController.getWorkspaceDocs);
router.patch("/:id", docsController.updateDoc);
router.delete("/:id", docsController.deleteDoc);

// Version History Routes
router.get("/:id/versions", docsController.listVersions);
router.post("/:id/versions", docsController.saveVersion);
router.patch("/:id/versions/:versionId", docsController.renameVersion);

// Favorite Routes
router.get("/:id/favorite", docsController.getFavoriteStatus);
router.post("/:id/favorite", docsController.toggleFavorite);



// Chat Routes
router.get("/:id/chat", docsController.getChatHistory);
router.post("/:id/chat", docsController.sendChatMessage);

// Member Routes
router.get("/:id/members", docsController.listMembers);
router.post("/:id/members", docsController.addMember);
router.delete("/:id/members/:userId", docsController.removeMember);


export default router;

