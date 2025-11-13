import { User } from '../models/user';
export declare class UserRepository {
    private client;
    private tableName;
    constructor();
    createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
    getUserById(userId: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUser(userId: string, updates: Partial<User>): Promise<User>;
}
//# sourceMappingURL=user-repository.d.ts.map