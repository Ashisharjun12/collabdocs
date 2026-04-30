import { db } from "../../infrastructure/postgres/postgres-client.js";
import { users, TUser } from "./user.schema.js";
import { IUserRepository, ICreateUserDto, IUpdateUserDto, IUpdateRoleDto } from "./user.interface.js";
import { eq, and, isNull, sql } from "drizzle-orm";

import { ApiError } from "../../shared/errors/ApiError.js";

export class UserRepository implements IUserRepository {
  // get user by id
  async findById(id: string): Promise<TUser | null> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    return result[0] || null;
  }

  // get user by email
  async findByEmail(email: string): Promise<TUser | null> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    return result[0] || null;
  }

  // get user by google id
  async findByGoogleId(googleId: string): Promise<TUser | null> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.google_id, googleId), isNull(users.deletedAt)))
      .limit(1);
    return result[0] || null;
  }

  // create user
  async create(data: ICreateUserDto): Promise<TUser> {
    const result = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: data.password,
      google_id: data.google_id,
      avatarUrl: data.avatarUrl,
    }).returning();

    return result[0];
  }

  // update user
  async update(id: string, data: IUpdateUserDto): Promise<TUser> {
    const result = await db
      .update(users)
      .set({
        name: data.name,
        avatarUrl: data.avatarUrl,
        version: data.version + 1,

        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.version, data.version)))
      .returning();

    if (result.length === 0) {
      throw ApiError.conflict("Update failed: User not found or version mismatch");
    }
    return result[0];
  }

  // update user role (Optimistic Locking)
  async updateRole(id: string, data: IUpdateRoleDto): Promise<TUser> {
    const result = await db
      .update(users)
      .set({
        role: data.role,
        version: data.version + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.version, data.version)))
      .returning();

    if (result.length === 0) {
      throw ApiError.conflict("Role update failed: User not found or version mismatch");
    }
    return result[0];
  }

  // verify email
  async verifyEmail(id: string): Promise<void> {
    await db
      .update(users)
      .set({ email_verified: true, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // update password
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // search users by name or email
  async search(query: string, limit: number = 10): Promise<TUser[]> {
    const pattern = `%${query}%`;
    return await db
      .select()
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          db.execute(sql`(${users.name} ILIKE ${pattern} OR ${users.email} ILIKE ${pattern})`) as any
        )
      )
      .limit(limit);
  }


  // soft delete user
  async softDelete(id: string): Promise<void> {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));
  }
}
