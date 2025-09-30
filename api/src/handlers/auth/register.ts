import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AuthService } from '../../services/auth-service';
import { CreateUserRequest } from '../../models/user';

export const handler = async (event: APIGatewayProxyEvent, _context: Context, _callback: any): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const request: CreateUserRequest = JSON.parse(event.body);
    
    if (!request.email || !request.password || !request.firstName || !request.lastName) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email, password, firstName, and lastName are required' })
      };
    }

    const authService = new AuthService();
    const result = await authService.register(request);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' })
    };
  }
};