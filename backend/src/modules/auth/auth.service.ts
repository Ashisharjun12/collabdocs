import bcrypt from "bcryptjs";
import { IAuthService, ILoginDto, ISignupDto, IAuthResponse, IAuthRepository } from "./auth.interface.js";
import { IUserService, IUserResponse } from "../user/user.interface.js";
import { IWorkspaceService } from "../workspace/workspace.interface.js";
import { TUser } from "../user/user.schema.js";
import { TokenFactory } from "./token.factory.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { _config } from "../../config/config.js";
import { TRefreshToken } from "./auth.schema.js";
import { addMailToQueue } from "../../infrastructure/bullmq/mail/mail.queue.js";

export class AuthService implements IAuthService {
  constructor(
    private authRepository: IAuthRepository,
    private userService: IUserService,
    private workspaceService: IWorkspaceService
  ) { }

  // signup 
  async signup(dto: ISignupDto, deviceInfo?: string, ipAddress?: string): Promise<IAuthResponse> {
    // 1. Check if user already exists
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw ApiError.badRequest("An account with this email already exists");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password!, 12);

    // 3. Create user
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    // 4. Create default workspace
    await this.workspaceService.createWorkspace(user.id, {
      name: `${user.name} Workspace`,
      visibility: "private",
      isPersonal: true,
    });

    // 5. Send Welcome Email via Queue with Verification Link
    const verificationToken = TokenFactory.generateVerificationToken(user.id);
    const verificationUrl = `${_config.APP_URL}/api/v1/auth/verify?token=${verificationToken}`;

    await addMailToQueue(
      user.email,
      "Welcome to collabdocs!",
      "verification-mail",
      { name: user.name, url: verificationUrl }
    );

    // 6. Generate tokens and session
    return this.generateAuthResponse(user, deviceInfo, ipAddress);
  }

  // verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      const { sub: userId } = TokenFactory.verifyVerificationToken(token);
      await this.userService.verifyEmail(userId);
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired verification token");
    }
  }

  // forgot password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    const resetToken = TokenFactory.generateResetToken(user.id);
    const resetUrl = `${_config.CLIENT_URL}/reset-password?token=${resetToken}`;

    await addMailToQueue(
      user.email,
      "Reset your password",
      "reset-password",
      { name: user.name, url: resetUrl }
    );
  }

  // reset password
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const { sub: userId } = TokenFactory.verifyResetToken(token);
      const hashedPassword = await bcrypt.hash(password, 12);
      await this.userService.updatePassword(userId, hashedPassword);
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired reset token");
    }
  }

  // login
  async login(dto: ILoginDto, deviceInfo?: string, ipAddress?: string): Promise<IAuthResponse> {
    // 1. Find user
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(dto.password!, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // 3. Generate tokens and session
    return this.generateAuthResponse(user, deviceInfo, ipAddress);
  }

  // google login
  async googleLogin(profile: any, deviceInfo?: string, ipAddress?: string): Promise<IAuthResponse> {
    const { id, name, email, avatar } = profile;

    let user = await this.userService.findByGoogleId(id);

    if (!user) {
      user = await this.userService.findByEmail(email);

      if (user) {
        // Link existing account with Google ID
        user = await this.userService.update(user.id, {
          name: user.name,
          google_id: id,
          // Only use Google avatar if they don't have one
          avatarUrl: user.avatarUrl || avatar || null,
          version: user.version,
        });

      } else {
        // Create new user via social login
        user = await this.userService.create({
          name: name,
          email: email,
          google_id: id,
          avatarUrl: avatar,
        });

        // Social login emails are pre-verified
        await this.userService.verifyEmail(user.id);
        user.email_verified = true;

        // Create default workspace for new social user
        await this.workspaceService.createWorkspace(user.id, {
          name: `${user.name} Workspace`,
          visibility: "private",
          isPersonal: true,
        });
      }
    } else {
        // User exists by Google ID - we could potentially update their name/avatar if they are missing
        // but for now we just return them to preserve their settings.
        // We could add a sync here if needed.
    }

    return this.generateAuthResponse(user, deviceInfo, ipAddress);
  }



  // refresh access token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.authRepository.findSessionByToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await this.userService.findById(session.userId);
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    await this.authRepository.revokeSession(session.id);

    const newRefreshToken = TokenFactory.generateRefreshToken();
    const refreshExpiry = _config.REFRESH_TOKEN_EXPIRY ? parseInt(_config.REFRESH_TOKEN_EXPIRY) : 7 * 24 * 60 * 60 * 1000;

    await this.authRepository.createSession({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + refreshExpiry),
    });

    const accessToken = TokenFactory.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatarUrl: user.avatarUrl,


    });

    return { accessToken, refreshToken: newRefreshToken };
  }


  // revoke refresh token
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const session = await this.authRepository.findSessionByToken(refreshToken);
    if (session) {
      await this.authRepository.revokeSession(session.id);
      await this.authRepository.blacklistToken(refreshToken, 7 * 24 * 60 * 60);
    }
  }

  // revoke all sessions
  async revokeAllSessions(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserSessions(userId);
  }

  // get all user sessions
  async getUserSessions(userId: string): Promise<TRefreshToken[]> {
    return this.authRepository.findUserSessions(userId);
  }

  // revoke specific session
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    // Optional: verify that the session belongs to the user
    await this.authRepository.revokeSession(sessionId);
  }

  // get user by id
  async getUserById(userId: string): Promise<IUserResponse> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  // generate auth response
  private async generateAuthResponse(user: TUser, deviceInfo?: string, ipAddress?: string): Promise<IAuthResponse> {
    const accessToken = TokenFactory.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatarUrl: user.avatarUrl,


    });

    const refreshToken = TokenFactory.generateRefreshToken();
    const refreshExpiry = _config.REFRESH_TOKEN_EXPIRY ? parseInt(_config.REFRESH_TOKEN_EXPIRY) : 7 * 24 * 60 * 60 * 1000;

    await this.authRepository.createSession({
      userId: user.id,
      token: refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + refreshExpiry),
    });

    const { password, deletedAt, version, ...sanitizedUser } = user;

    return {
      user: sanitizedUser as any,
      accessToken,
      refreshToken,
    };
  }
}