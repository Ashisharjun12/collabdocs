import type { RequestHandler } from 'express';
import { ApiError } from '../shared/errors/ApiError.js';
import { TUserRole } from "../modules/user/user.schema.js";


export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  SUPER_ADMIN: "super_admin"
} as const;

// custom role
export const customRole = (...roles: TUserRole[]): RequestHandler =>
  (req, _res, next) => {
    // 1. Ensure user is authenticated
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // 2. Check if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: [${roles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };