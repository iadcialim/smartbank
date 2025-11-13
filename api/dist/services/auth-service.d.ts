import { CreateUserRequest, LoginRequest, AuthResponse, AuthTokens, PasswordResetRequest } from '../models/user';
export declare class AuthService {
    private cognitoClient;
    private userPoolId;
    private clientId;
    private userService;
    constructor();
    register(request: CreateUserRequest): Promise<AuthResponse>;
    login(request: LoginRequest): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    resetPassword(request: PasswordResetRequest): Promise<void>;
}
//# sourceMappingURL=auth-service.d.ts.map