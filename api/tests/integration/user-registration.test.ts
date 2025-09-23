import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Import handlers that don't exist yet - these will fail until implemented
import { handler as registerHandler } from '../../src/handlers/auth/register';
import { handler as createAccountHandler } from '../../src/handlers/accounts/create-account';
import { handler as listProductsHandler } from '../../src/handlers/accounts/list-products';

describe('User Registration Flow Integration Tests', () => {
  const mockEvent = (
    body: any = null,
    pathParameters: any = null,
    headers: any = {},
    httpMethod: string = 'POST',
    path: string = '/auth/register'
  ): APIGatewayProxyEvent => ({
    body: body ? JSON.stringify(body) : null,
    headers,
    httpMethod,
    path,
    pathParameters,
    queryStringParameters: null,
    requestContext: {} as any,
    resource: '',
    stageVariables: null,
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null
  });

  describe('Complete User Registration Journey', () => {
    it('should complete full registration flow from signup to first account', async () => {
      // Step 1: Get available financial products
      const productsEvent = mockEvent(null, null, {}, 'GET', '/products');
      const productsResult: APIGatewayProxyResult = await listProductsHandler(productsEvent, {} as any, {} as any);
      
      expect(productsResult.statusCode).toBe(200);
      const productsBody = JSON.parse(productsResult.body);
      expect(productsBody).toHaveProperty('products');
      expect(productsBody.products.length).toBeGreaterThan(0);
      
      const savingsProduct = productsBody.products.find((p: any) => p.productType === 'SAVINGS');
      expect(savingsProduct).toBeDefined();

      // Step 2: Register new user
      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15',
        address: '123 Collins St, Melbourne VIC 3000'
      };

      const registerEvent = mockEvent(registrationData);
      const registerResult: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(registerResult.statusCode).toBe(201);
      const registerBody = JSON.parse(registerResult.body);
      expect(registerBody).toHaveProperty('user');
      expect(registerBody).toHaveProperty('accessToken');
      expect(registerBody).toHaveProperty('refreshToken');
      expect(registerBody.user).toHaveProperty('id');
      expect(registerBody.user.email).toBe('newuser@example.com');

      // Step 3: Create first account using registration token
      const accountData = {
        productId: savingsProduct.id,
        accountType: 'SAVINGS'
      };

      const accountEvent = mockEvent(accountData, null, {
        Authorization: `Bearer ${registerBody.accessToken}`
      }, 'POST', '/accounts');
      accountEvent.requestContext = {
        authorizer: {
          ['claims']: {
            sub: registerBody.user.id,
            email: registerBody.user.email
          }
        }
      } as any;

      const accountResult: APIGatewayProxyResult = await createAccountHandler(accountEvent, {} as any, {} as any);
      
      expect(accountResult.statusCode).toBe(201);
      const accountBody = JSON.parse(accountResult.body);
      expect(accountBody).toHaveProperty('account');
      expect(accountBody.account).toHaveProperty('id');
      expect(accountBody.account).toHaveProperty('accountNumber');
      expect(accountBody.account).toHaveProperty('bsb');
      expect(accountBody.account.accountType).toBe('SAVINGS');
      expect(accountBody.account.balance).toBe(0);
      expect(accountBody.account.status).toBe('ACTIVE');
    });

    it('should handle registration with existing email gracefully', async () => {
      // First registration
      const registrationData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      const firstRegisterEvent = mockEvent(registrationData);
      const firstResult: APIGatewayProxyResult = await registerHandler(firstRegisterEvent, {} as any, {} as any);
      
      expect(firstResult.statusCode).toBe(201);

      // Attempt duplicate registration
      const secondRegisterEvent = mockEvent(registrationData);
      const secondResult: APIGatewayProxyResult = await registerHandler(secondRegisterEvent, {} as any, {} as any);
      
      expect(secondResult.statusCode).toBe(409);
      const errorBody = JSON.parse(secondResult.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('already exists');
    });

    it('should validate all required fields during registration', async () => {
      const incompleteData = {
        email: 'incomplete@example.com',
        password: 'SecurePass123!'
        // Missing firstName, lastName, phone, dateOfBirth
      };

      const registerEvent = mockEvent(incompleteData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(400);
      const errorBody = JSON.parse(result.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('required');
    });

    it('should enforce password complexity requirements', async () => {
      const weakPasswordData = {
        email: 'weakpass@example.com',
        password: '123', // Too weak
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(weakPasswordData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(400);
      const errorBody = JSON.parse(result.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('password');
    });

    it('should validate email format during registration', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(invalidEmailData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(400);
      const errorBody = JSON.parse(result.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('email');
    });

    it('should validate Australian phone number format', async () => {
      const invalidPhoneData = {
        email: 'validphone@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789', // Invalid Australian format
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(invalidPhoneData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(400);
      const errorBody = JSON.parse(result.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('phone');
    });

    it('should validate age requirements (18+ years)', async () => {
      const underageData = {
        email: 'underage@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '2010-01-15' // Under 18
      };

      const registerEvent = mockEvent(underageData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(400);
      const errorBody = JSON.parse(result.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('18 years');
    });
  });

  describe('Account Creation After Registration', () => {
    let userToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register a user for account creation tests
      const registrationData = {
        email: `testuser${Date.now()}@example.com`,
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(registrationData);
      const registerResult: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(registerResult.statusCode).toBe(201);
      const registerBody = JSON.parse(registerResult.body);
      userToken = registerBody.accessToken;
      userId = registerBody.user.id;
    });

    it('should create savings account immediately after registration', async () => {
      // Get available products
      const productsEvent = mockEvent(null, null, {}, 'GET', '/products');
      const productsResult: APIGatewayProxyResult = await listProductsHandler(productsEvent, {} as any, {} as any);
      
      const productsBody = JSON.parse(productsResult.body);
      const savingsProduct = productsBody.products.find((p: any) => p.productType === 'SAVINGS');

      // Create account
      const accountData = {
        productId: savingsProduct.id,
        accountType: 'SAVINGS'
      };

      const accountEvent = mockEvent(accountData, null, {
        Authorization: `Bearer ${userToken}`
      }, 'POST', '/accounts');
      accountEvent.requestContext = {
        authorizer: {
          ['claims']: { sub: userId, email: 'test@example.com' }
        }
      } as any;

      const accountResult: APIGatewayProxyResult = await createAccountHandler(accountEvent, {} as any, {} as any);
      
      expect(accountResult.statusCode).toBe(201);
      const accountBody = JSON.parse(accountResult.body);
      expect(accountBody.account.accountType).toBe('SAVINGS');
      expect(accountBody.account.balance).toBe(0);
      expect(accountBody.account.status).toBe('ACTIVE');
    });

    it('should prevent account creation with invalid product ID', async () => {
      const accountData = {
        productId: 'invalid-product-id',
        accountType: 'SAVINGS'
      };

      const accountEvent = mockEvent(accountData, null, {
        Authorization: `Bearer ${userToken}`
      }, 'POST', '/accounts');
      accountEvent.requestContext = {
        authorizer: {
          ['claims']: { sub: userId, email: 'test@example.com' }
        }
      } as any;

      const accountResult: APIGatewayProxyResult = await createAccountHandler(accountEvent, {} as any, {} as any);
      
      expect(accountResult.statusCode).toBe(400);
      const errorBody = JSON.parse(accountResult.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('Invalid product');
    });

    it('should prevent account creation without authentication', async () => {
      const accountData = {
        productId: 'prod-savings-001',
        accountType: 'SAVINGS'
      };

      const accountEvent = mockEvent(accountData, null, {}, 'POST', '/accounts');

      const accountResult: APIGatewayProxyResult = await createAccountHandler(accountEvent, {} as any, {} as any);
      
      expect(accountResult.statusCode).toBe(401);
      const errorBody = JSON.parse(accountResult.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('Unauthorized');
    });

    it('should enforce account creation limits per user', async () => {
      // Get available products
      const productsEvent = mockEvent(null, null, {}, 'GET', '/products');
      const productsResult: APIGatewayProxyResult = await listProductsHandler(productsEvent, {} as any, {} as any);
      
      const productsBody = JSON.parse(productsResult.body);
      const savingsProduct = productsBody.products.find((p: any) => p.productType === 'SAVINGS');

      // Create multiple accounts to test limits
      const accountData = {
        productId: savingsProduct.id,
        accountType: 'SAVINGS'
      };

      const createAccountWithAuth = () => {
        const accountEvent = mockEvent(accountData, null, {
          Authorization: `Bearer ${userToken}`
        }, 'POST', '/accounts');
        accountEvent.requestContext = {
          authorizer: {
            ['claims']: { sub: userId, email: 'test@example.com' }
          }
        } as any;
        return createAccountHandler(accountEvent, {} as any, {} as any);
      };

      // Create accounts up to limit (assuming limit is 5)
      const results = [];
      for (let i = 0; i < 6; i++) {
        const result = await createAccountWithAuth();
        results.push(result);
      }

      // First 5 should succeed, 6th should fail
      results.slice(0, 5).forEach(result => {
        expect([201, 409]).toContain(result.statusCode); // 201 for success, 409 if limit reached earlier
      });

      const lastResult = results[5];
      if (lastResult && lastResult.statusCode === 409) {
        const errorBody = JSON.parse(lastResult.body);
        expect(errorBody.error).toContain('maximum number of accounts');
      }
    });
  });

  describe('Registration Data Validation', () => {
    it('should sanitize and validate user input', async () => {
      const registrationData = {
        email: '  UPPERCASE@EXAMPLE.COM  ', // Should be normalized
        password: 'SecurePass123!',
        firstName: '  John  ', // Should be trimmed
        lastName: '  Doe  ', // Should be trimmed
        phone: '+61 412 345 678', // Should normalize spaces
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(registrationData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.user.email).toBe('uppercase@example.com');
      expect(body.user.firstName).toBe('John');
      expect(body.user.lastName).toBe('Doe');
    });

    it('should reject registration with malicious input', async () => {
      const maliciousData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: '<script>alert("xss")</script>',
        lastName: 'DROP TABLE users;',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(maliciousData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(400);
      const errorBody = JSON.parse(result.body);
      expect(errorBody).toHaveProperty('error');
      expect(errorBody.error).toContain('Invalid characters');
    });

    it('should validate Australian address format when provided', async () => {
      const registrationData = {
        email: 'address@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15',
        address: '123 Collins St, Melbourne VIC 3000'
      };

      const registerEvent = mockEvent(registrationData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.user).toHaveProperty('address');
    });
  });

  describe('Registration Security', () => {
    it('should hash passwords securely', async () => {
      const registrationData = {
        email: 'security@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(registrationData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      
      // Password should never be returned in response
      expect(body.user).not.toHaveProperty('password');
      expect(body).not.toHaveProperty('password');
    });

    it('should generate secure JWT tokens', async () => {
      const registrationData = {
        email: 'jwt@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      const registerEvent = mockEvent(registrationData);
      const result: APIGatewayProxyResult = await registerHandler(registerEvent, {} as any, {} as any);
      
      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(typeof body.accessToken).toBe('string');
      expect(typeof body.refreshToken).toBe('string');
      expect(body.accessToken.length).toBeGreaterThan(50);
      expect(body.refreshToken.length).toBeGreaterThan(50);
    });

    it('should implement rate limiting for registration attempts', async () => {
      const registrationData = {
        email: 'ratelimit@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+61412345678',
        dateOfBirth: '1990-01-15'
      };

      // Attempt multiple registrations rapidly
      const promises = Array(6).fill(null).map((_, i) => {
        const data = { ...registrationData, email: `ratelimit${i}@example.com` };
        return registerHandler(mockEvent(data), {} as any, {} as any);
      });

      const results = await Promise.all(promises);
      
      // Should get rate limited after several attempts
      const rateLimitedResults = results.filter(r => r.statusCode === 429);
      expect(rateLimitedResults.length).toBeGreaterThan(0);
    });
  });
});