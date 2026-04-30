import jwt from "jsonwebtoken";
import { _config } from "../../config/config.js";
import { IJwtPayload } from "./auth.interface.js";
import { v4 as uuidv4 } from "uuid";

export class TokenFactory {
 // generate access token
  static generateAccessToken(payload: IJwtPayload): string {
    const expiry = _config.ACCESS_TOKEN_EXPIRY;
    const expiresIn = expiry && !isNaN(Number(expiry)) ? Number(expiry) : (expiry || "15m");
    
    return jwt.sign(payload, _config.JWT_SECRET!, {
      expiresIn: expiresIn as any,
    });
  }

// generate refresh token
  static generateRefreshToken(): string {
    return uuidv4();
  }

  // verify access token
  static verifyAccessToken(token: string): IJwtPayload {
    return jwt.verify(token, _config.JWT_SECRET!) as IJwtPayload;
  }

  // generate verification token (expires in 24h)
  static generateVerificationToken(userId: string): string {
    return jwt.sign({ sub: userId, type: "verification" }, _config.JWT_SECRET!, { expiresIn: "24h" });
  }

  // verify verification token
  static verifyVerificationToken(token: string): { sub: string } {
    const payload = jwt.verify(token, _config.JWT_SECRET!) as any;
    if (payload.type !== "verification") throw new Error("Invalid token type");
    return payload;
  }

  // generate reset token (expires in 1h)
  static generateResetToken(userId: string): string {
    return jwt.sign({ sub: userId, type: "reset" }, _config.JWT_SECRET!, { expiresIn: "1h" });
  }

  // verify reset token
  static verifyResetToken(token: string): { sub: string } {
    const payload = jwt.verify(token, _config.JWT_SECRET!) as any;
    if (payload.type !== "reset") throw new Error("Invalid token type");
    return payload;
  }
}
