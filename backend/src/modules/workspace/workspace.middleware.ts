import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/errors/ApiError.js";
import { WorkspaceRepository } from "./workspace.repository.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";

const workspaceRepository = new WorkspaceRepository();

export const workspaceRoles = {
    OWNER: "owner",
    ADMIN: "admin",
    EDITOR: "editor",
    VIEWER: "viewer",
} as const;

export const checkWorkspaceRole = (roles: (typeof workspaceRoles[keyof typeof workspaceRoles])[]) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req.user as any)?.id;
        const workspaceId = req.params.workspaceId || req.params.id;

        if (!userId || !workspaceId) {
            throw ApiError.unauthorized("Authentication required or workspace ID missing");
        }

        const userRole = await workspaceRepository.getMemberRole(workspaceId as string, userId);

        if (!userRole) {
            throw ApiError.forbidden("You are not a member of this workspace");
        }

        if (!roles.includes(userRole)) {
            throw ApiError.forbidden(`Required role: ${roles.join(" or ")}. Your role: ${userRole}`);
        }

        next();
    });
};
