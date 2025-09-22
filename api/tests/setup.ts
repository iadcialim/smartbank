// Jest setup file for backend tests
import { jest } from '@jest/globals';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-cognito-identity-provider');
jest.mock('@aws-sdk/client-kms');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DYNAMODB_TABLE_NAME = 'test-smartbank-table';
process.env.COGNITO_USER_POOL_ID = 'test-user-pool';
process.env.COGNITO_CLIENT_ID = 'test-client-id';
process.env.AWS_REGION = 'ap-southeast-2';