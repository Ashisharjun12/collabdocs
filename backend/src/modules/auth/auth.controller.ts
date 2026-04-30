import { Request, Response, NextFunction } from "express";
import { _config } from "../../config/config.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { IAuthService } from "./auth.interface.js";
import { ApiError } from "../../shared/errors/ApiError.js";


export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  // signup controller
  signup = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const deviceInfo = req.headers["user-agent"];
    const ipAddress = req.ip;
    const { accessToken, refreshToken, user } = await this.authService.signup({ name, email, password }, deviceInfo, ipAddress);

    this.setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      status: "success",
      data: { user, accessToken },
    });
  });

 
  // login controller
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const deviceInfo = req.headers["user-agent"];
    const ipAddress = req.ip;
    const { accessToken, refreshToken, user } = await this.authService.login({ email, password }, deviceInfo, ipAddress);

    this.setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      status: "success",
      data: { user, accessToken },
    });
  });

 
  // google callback controller
  googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const googleUser = req.user as any;
    const deviceInfo = req.headers["user-agent"];
    const ipAddress = req.ip;
    const { accessToken, refreshToken } = await this.authService.googleLogin(googleUser, deviceInfo, ipAddress);

    this.setTokenCookies(res, accessToken, refreshToken);

    // After social login
    res.redirect(`${_config.CLIENT_URL}/dashboard`);
  });

 
  // refresh access token controller
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies["refresh_token"];
    if (!oldRefreshToken) {
      throw ApiError.unauthorized("Refresh token missing");
    }
    const { accessToken, refreshToken } = await this.authService.refreshAccessToken(oldRefreshToken);
    this.setTokenCookies(res, accessToken, refreshToken);
    res.status(200).json({ status: "success" });
  });

 
  // logout controller
  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies["refresh_token"];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  });

 
  // get current user
  me = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const user = await this.authService.getUserById(userId);
    const accessToken = req.cookies["access_token"];

    res.status(200).json({
      status: "success",
      data: { user, accessToken },
    });
  });

  // get all active sessions
  getSessions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const sessions = await this.authService.getUserSessions(userId);
    
    // Identify current session
    const currentRefreshToken = req.cookies["refresh_token"];
    const currentSession = sessions.find(s => s.hashedToken === currentRefreshToken);

    res.status(200).json({
      status: "success",
      data: { 
        sessions: sessions.map(s => {
          const { hashedToken, ...rest } = s;
          return rest;
        }),
        currentSessionId: currentSession?.id 
      },
    });
  });

  // revoke specific session
  revokeSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { sessionId } = req.params;
    await this.authService.revokeSession(userId, sessionId as string);
    res.status(200).json({
      status: "success",
      message: "Session revoked successfully",
    });
  });

  // verify email controller
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token) throw new Error("Verification token missing");

    await this.authService.verifyEmail(token as string);

    // After verification, redirect to login with a success message or just to login
    res.redirect(`${_config.CLIENT_URL}/login?verified=true`);
  });

  // forgot password controller
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    await this.authService.forgotPassword(email);

    res.status(200).json({
      status: "success",
      message: "If an account with that email exists, we have sent a reset link.",
    });
  });

  // reset password controller
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token || !password) throw new Error("Token and password are required");

    await this.authService.resetPassword(token, password);

    res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now login with your new password.",
    });
  });

 
  // helper to set secure cookies
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: _config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: _config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
