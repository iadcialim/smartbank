"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user-repository");
const user_1 = require("../models/user");
class UserService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    async createUser(userData) {
        const existingUser = await this.userRepository.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const user = await this.userRepository.createUser({
            ...userData,
            isEmailVerified: false,
            isPhoneVerified: false,
            status: user_1.UserStatus.PENDING_VERIFICATION
        });
        return user;
    }
    async getUserById(userId) {
        return this.userRepository.getUserById(userId);
    }
    async getUserByEmail(email) {
        return this.userRepository.getUserByEmail(email);
    }
    async updateUser(userId, updates) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return this.userRepository.updateUser(userId, updates);
    }
    async verifyEmail(userId) {
        return this.userRepository.updateUser(userId, {
            isEmailVerified: true,
            status: user_1.UserStatus.ACTIVE
        });
    }
    async updateLastLogin(userId) {
        return this.userRepository.updateUser(userId, {
            lastLoginAt: new Date().toISOString()
        });
    }
}
exports.UserService = UserService;
