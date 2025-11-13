/**
 * SmartBank API - Main Entry Point
 * Australian Mobile Banking App Clone
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const handler = (event: APIGatewayProxyEvent, context: Context): APIGatewayProxyResult => {
  // eslint-disable-next-line no-console
  console.log('SmartBank API Handler invoked');
  // eslint-disable-next-line no-console
  console.log('Event:', JSON.stringify(event, null, 2));
  // eslint-disable-next-line no-console
  console.log('Context:', JSON.stringify(context, null, 2));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify({
      message: 'SmartBank API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
  };
};
