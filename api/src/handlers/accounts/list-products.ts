import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// TDD: This handler is intentionally incomplete to make tests fail
export const handler = async (
  _event: APIGatewayProxyEvent,
  _context: Context,
  _callback: any
): Promise<APIGatewayProxyResult> => {
  // TODO: Implement list products logic
  throw new Error('List products handler not implemented yet');
};