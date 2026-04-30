import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import { ApiError } from "../shared/errors/ApiError.js";
import { RedisClient } from "../infrastructure/redis/redis-client.js";


// modern authentication guard
export const authGuard = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    // 2. Check Redis Blacklist (for instant logout/revocation)
    const isBlacklisted = await RedisClient.getConnection().get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(ApiError.unauthorized("Token has been revoked"));
    }

    // 3. Verify JWT
    const decoded = jwt.verify(token, _config.JWT_SECRET!) as any;


    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      avatar: decoded.avatar,
    } as any;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized("Token has expired"));
    }
    return next(ApiError.unauthorized("Invalid token"));
  }
};