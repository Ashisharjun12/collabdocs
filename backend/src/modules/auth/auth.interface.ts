import { TCreateSessionDto, TRefreshToken } from "./auth.schema.js";
import { IUserResponse } from "../user/user.interface.js";

// dto for login
export interface ILoginDto {
  email: string;
  password?: string;
}

// dto for signup
export interface ISignupDto {
  name: string;
  email: string;
  password?: string;
}

// dto for jwt payload
export interface IJwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  name: string;
  avatarUrl?: string | null;
}


// dto for auth response
export interface IAuthResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
}

// dto for auth repository
export interface IAuthRepository {
  createSession(data: TCreateSessionDto): Promise<TRefreshToken>;
  findSessionByToken(token: string): Promise<TRefreshToken | null>;
  revokeSession(id: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
  findUserSessions(userId: string): Promise<TRefreshToken[]>;
  isTokenBlacklisted(token: string): Promise<boolean>;
  blacklistToken(token: string, ttl: number): Promise<void>;
}

// interface for auth service
export interface IAuthService {
  signup(dto: ISignupDto, deviceInfo?: string, ipAddress?: string): Promise<IAuthResponse>;
  login(dto: ILoginDto, deviceInfo?: string, ipAddress?: string): Promise<IAuthResponse>;
  googleLogin(profile: any, deviceInfo?: string, ipAddress?: string): Promise<IAuthResponse>;
  refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  revokeRefreshToken(refreshToken: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
  getUserSessions(userId: string): Promise<TRefreshToken[]>;
  revokeSession(userId: string, sessionId: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  getUserById(userId: string): Promise<IUserResponse>;
}