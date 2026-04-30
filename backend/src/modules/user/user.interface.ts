import { TUser, TUserRole } from "./user.schema.js";

// dto for creating a new user
export interface ICreateUserDto {
  name: string;
  email: string;
  password?: string;
  google_id?: string;
  avatarUrl?: string | null;

}

// dto for updating a user profile
export interface IUpdateUserDto {
  name?: string;
  google_id?: string;
  avatarUrl?: string | null;

  version: number;
}

// dto for updating user role (Admin only)
export interface IUpdateRoleDto {
  role: TUserRole;
  version: number;
}

export type IUserResponse = Omit<TUser, "password" | "deletedAt" | "version">;

// Interface for User Repository
export interface IUserRepository {
  findById(id: string): Promise<TUser | null>;
  findByEmail(email: string): Promise<TUser | null>;
  findByGoogleId(googleId: string): Promise<TUser | null>;
  create(data: ICreateUserDto): Promise<TUser>;
  update(id: string, data: IUpdateUserDto): Promise<TUser>;
  updateRole(id: string, data: IUpdateRoleDto): Promise<TUser>;
  verifyEmail(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  search(query: string, limit?: number): Promise<TUser[]>;

}

// Interface for user service
export interface IUserService {
  findById(id: string): Promise<TUser | null>;
  findByEmail(email: string): Promise<TUser | null>;
  findByGoogleId(googleId: string): Promise<TUser | null>;
  create(data: ICreateUserDto): Promise<TUser>;
  update(id: string, data: IUpdateUserDto): Promise<TUser>;
  updateRole(id: string, data: IUpdateRoleDto): Promise<TUser>;
  verifyEmail(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  search(query: string, limit?: number): Promise<TUser[]>;

}