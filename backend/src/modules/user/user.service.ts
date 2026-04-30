import { IUserService, IUserRepository, ICreateUserDto, IUpdateUserDto, IUpdateRoleDto } from "./user.interface.js";
import { TUser } from "./user.schema.js";
import { BloomFilterService } from "../../shared/services/BloomFilterService.js";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) { }

  // find user by id
  async findById(id: string): Promise<TUser | null> {
    return this.userRepository.findById(id);
  }

  // find user by email
  async findByEmail(email: string): Promise<TUser | null> {
    return this.userRepository.findByEmail(email);
  }

  // find user by google id
  async findByGoogleId(googleId: string): Promise<TUser | null> {
    return this.userRepository.findByGoogleId(googleId);
  }

  // create user
  async create(data: ICreateUserDto): Promise<TUser> {
    const user = await this.userRepository.create(data);
    BloomFilterService.getInstance().add(user.email);
    return user;
  }

  // update user
  async update(id: string, data: IUpdateUserDto): Promise<TUser> {
    return this.userRepository.update(id, data);
  }

  // update user role (Admin only)
  async updateRole(id: string, data: IUpdateRoleDto): Promise<TUser> {
    return this.userRepository.updateRole(id, data);
  }

  // verify email
  async verifyEmail(id: string): Promise<void> {
    return this.userRepository.verifyEmail(id);
  }

  // update password
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    return this.userRepository.updatePassword(id, passwordHash);
  }

  // soft delete user
  async softDelete(id: string): Promise<void> {
    return this.userRepository.softDelete(id);
  }
  // search users
  async search(query: string, limit: number = 10): Promise<TUser[]> {
    return this.userRepository.search(query, limit);
  }
}

