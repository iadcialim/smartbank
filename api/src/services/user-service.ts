import { UserRepository } from '../repositories/user-repository';
import { User, UserStatus } from '../models/user';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<User> {
    const existingUser = await this.userRepository.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await this.userRepository.createUser({
      ...userData,
      isEmailVerified: false,
      isPhoneVerified: false,
      status: UserStatus.PENDING_VERIFICATION
    });

    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.getUserById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.getUserByEmail(email);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.userRepository.updateUser(userId, updates);
  }

  async verifyEmail(userId: string): Promise<User> {
    return this.userRepository.updateUser(userId, {
      isEmailVerified: true,
      status: UserStatus.ACTIVE
    });
  }

  async updateLastLogin(userId: string): Promise<User> {
    return this.userRepository.updateUser(userId, {
      lastLoginAt: new Date().toISOString()
    });
  }
}