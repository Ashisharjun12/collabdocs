import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { IUserService } from "./user.interface.js";
import { BloomFilterService } from "../../shared/services/BloomFilterService.js";
import { TokenFactory } from "../auth/token.factory.js";
import { _config } from "../../config/config.js";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  // get user profile
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;
    const user = await this.userService.findById(id);
    if (!user) throw ApiError.notFound("User not found");

    res.status(200).json({
      status: "success",
      data: { user },
    });
  });

  // update user profile
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { name, avatarUrl, version } = req.body;
    const { id } = req.user as any;

    const updatedUser = await this.userService.update(id, {
      name,
      avatarUrl,
      version: parseInt(version),
    });

    // Generate new access token with updated info
    const accessToken = TokenFactory.generateAccessToken({
        sub: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
    });

    // Update cookie
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: _config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.status(200).json({
      status: "success",
      data: { user: updatedUser, accessToken },
    });
  });


  // change user role
  changeRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId, role, version } = req.body;

    const updatedUser = await this.userService.updateRole(userId, {
      role,
      version: parseInt(version),
    });

    res.status(200).json({
      status: "success",
      message: "User role updated successfully",
      data: { user: updatedUser },
    });
  });

 // soft delete user
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;
    await this.userService.softDelete(id);

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  });

  // search users by name or email
  searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      throw ApiError.badRequest("Query parameter is required");
    }

    // Optimization: If it looks like an email, check Bloom Filter first
    if (query.includes('@')) {
      const mightExist = BloomFilterService.getInstance().mightExist(query);
      if (!mightExist) {
        return res.status(200).json({
          status: "success",
          data: { users: [] }
        });
      }
    }

    const users = await this.userService.search(query);

    res.status(200).json({
      status: "success",
      data: {
        users: users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }))
      }
    });
  });
}


