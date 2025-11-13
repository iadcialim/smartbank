import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AuthService } from '../../services/auth-service';
import { RefreshTokenRequest } from '../../models/user';

export const handler = async (event: APIGatewayProxyEvent, _context: Context, _callback: any): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const request: RefreshTokenRequest = JSON.parse(event.body);
    
    if (!request.refreshToken) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Refresh token is required' })
      };
    }

    const authService = new AuthService();
    const tokens = await authService.refreshToken(request.refreshToken);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens)
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Token refresh failed' })
    };
  }
};