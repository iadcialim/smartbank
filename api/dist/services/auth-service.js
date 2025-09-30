"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const user_service_1 = require("./user-service");
const crypto_1 = require("crypto");
class AuthService {
    constructor() {
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: process.env['AWS_REGION'] || 'ap-southeast-2' });
        this.userPoolId = process.env['USER_POOL_ID'];
        this.clientId = process.env['USER_POOL_CLIENT_ID'];
        console.log('Environment variables:', {
            USER_POOL_ID: process.env['USER_POOL_ID'],
            USER_POOL_CLIENT_ID: process.env['USER_POOL_CLIENT_ID'],
            REGION: process.env['REGION']
        });
        this.userService = new user_service_1.UserService();
    }
    async register(request) {
        const userId = (0, crypto_1.randomUUID)();
        // Create user in Cognito
        await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminCreateUserCommand({
            UserPoolId: this.userPoolId,
            Username: request.email,
            UserAttributes: [
                { Name: 'email', Value: request.email },
                { Name: 'given_name', Value: request.firstName },
                { Name: 'family_name', Value: request.lastName }
            ],
            TemporaryPassword: request.password,
            MessageAction: 'SUPPRESS'
        }));
        // Set permanent password
        await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminSetUserPasswordCommand({
            UserPoolId: this.userPoolId,
            Username: request.email,
            Password: request.password,
            Permanent: true
        }));
        // Create user in DynamoDB
        const user = await this.userService.createUser({
            userId,
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            ...(request.phoneNumber && { phoneNumber: request.phoneNumber })
        });
        // Login to get tokens
        const tokens = await this.login({ email: request.email, password: request.password });
        return {
            user,
            tokens: tokens.tokens
        };
    }
    async login(request) {
        const authResult = await this.cognitoClient.send(new client_cognito_identity_provider_1.InitiateAuthCommand({
            ClientId: this.clientId,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: request.email,
                PASSWORD: request.password
            }
        }));
        if (!authResult.AuthenticationResult) {
            throw new Error('Authentication failed');
        }
        const user = await this.userService.getUserByEmail(request.email);
        if (!user) {
            throw new Error('User not found');
        }
        await this.userService.updateLastLogin(user.userId);
        const tokens = {
            accessToken: authResult.AuthenticationResult.AccessToken,
            refreshToken: authResult.AuthenticationResult.RefreshToken,
            expiresIn: authResult.AuthenticationResult.ExpiresIn
        };
        return { user, tokens };
    }
    async refreshToken(refreshToken) {
        const authResult = await this.cognitoClient.send(new client_cognito_identity_provider_1.InitiateAuthCommand({
            ClientId: this.clientId,
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            AuthParameters: {
                REFRESH_TOKEN: refreshToken
            }
        }));
        if (!authResult.AuthenticationResult) {
            throw new Error('Token refresh failed');
        }
        return {
            accessToken: authResult.AuthenticationResult.AccessToken,
            refreshToken: refreshToken,
            expiresIn: authResult.AuthenticationResult.ExpiresIn
        };
    }
    async resetPassword(request) {
        await this.cognitoClient.send(new client_cognito_identity_provider_1.ForgotPasswordCommand({
            ClientId: this.clientId,
            Username: request.email
        }));
    }
}
exports.AuthService = AuthService;
