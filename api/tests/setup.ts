// Jest setup file for backend tests
import { jest } from '@jest/globals';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-cognito-identity-provider');

// Environment variables are loaded from .env file via dotenv-cli
// No need to set them here as they come from the .env file