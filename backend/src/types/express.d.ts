import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: "admin" | "user" | "super_admin";
    }
    interface Request {
      user?: User;
    }
  }
}