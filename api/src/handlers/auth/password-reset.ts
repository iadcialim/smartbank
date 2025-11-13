import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AuthService } from '../../services/auth-service';
import { PasswordResetRequest } from '../../models/user';

export const handler = async (event: APIGatewayProxyEvent, _context: Context, _callback: any): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const request: PasswordResetRequest = JSON.parse(event.body);
    
    if (!request.email) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    const authService = new AuthService();
    await authService.resetPassword(request);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Password reset email sent' })
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Password reset failed' })
    };
  }
};