import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, InitiateAuthCommand, ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { UserService } from './user-service';
import { CreateUserRequest, LoginRequest, AuthResponse, AuthTokens, PasswordResetRequest } from '../models/user';
import { randomUUID } from 'crypto';

export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;
  private userService: UserService;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({ region: process.env['AWS_REGION'] || 'ap-southeast-2' });
    this.userPoolId = process.env['USER_POOL_ID']!;
    this.clientId = process.env['USER_POOL_CLIENT_ID']!;
    console.log('Environment variables:', {
      USER_POOL_ID: process.env['USER_POOL_ID'],
      USER_POOL_CLIENT_ID: process.env['USER_POOL_CLIENT_ID'],
      REGION: process.env['REGION']
    });
    this.userService = new UserService();
  }

  async register(request: CreateUserRequest): Promise<AuthResponse> {
    const userId = randomUUID();

    // Create user in Cognito
    await this.cognitoClient.send(new AdminCreateUserCommand({
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
    await this.cognitoClient.send(new AdminSetUserPasswordCommand({
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

  async login(request: LoginRequest): Promise<AuthResponse> {
    const authResult = await this.cognitoClient.send(new InitiateAuthCommand({
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

    const tokens: AuthTokens = {
      accessToken: authResult.AuthenticationResult.AccessToken!,
      refreshToken: authResult.AuthenticationResult.RefreshToken!,
      expiresIn: authResult.AuthenticationResult.ExpiresIn!
    };

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const authResult = await this.cognitoClient.send(new InitiateAuthCommand({
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
      accessToken: authResult.AuthenticationResult.AccessToken!,
      refreshToken: refreshToken,
      expiresIn: authResult.AuthenticationResult.ExpiresIn!
    };
  }

  async resetPassword(request: PasswordResetRequest): Promise<void> {
    await this.cognitoClient.send(new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: request.email
    }));
  }
}