import { User } from '../models/user';
export declare class UserService {
    private userRepository;
    constructor();
    createUser(userData: {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }): Promise<User>;
    getUserById(userId: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUser(userId: string, updates: Partial<User>): Promise<User>;
    verifyEmail(userId: string): Promise<User>;
    updateLastLogin(userId: string): Promise<User>;
}
//# sourceMappingURL=user-service.d.ts.map