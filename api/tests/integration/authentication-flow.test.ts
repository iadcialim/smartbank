import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app';

describe('Authentication Flow Integration Tests', () => {
  let testEmail: string;
  let testPhone: string;
  let testPassword: string;
  let registrationToken: string;
  let accessToken: string;
  let refreshToken: string;

  beforeEach(() => {
    testEmail = `test.${Date.now()}@example.com.au`;
    testPhone = '+61412345678';
    testPassword = 'SecurePass123!';
  });

  afterEach(async () => {
    // Cleanup test data
  });

  describe('Complete Authentication Journey', () => {
    it('should complete full registration to login flow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.requiresVerification).toBe(true);
      registrationToken = registerResponse.body.data.token;

      // Step 2: Verify email (simulated)
      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: registrationToken,
          code: '123456'
        });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);

      // Step 3: Login with verified account
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.accessToken).toBeDefined();
      expect(loginResponse.body.data.refreshToken).toBeDefined();
      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;

      // Step 4: Access protected resource
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.email).toBe(testEmail);
    });

    it('should handle registration with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      // Attempt duplicate registration
      const duplicateResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'DifferentPass123!',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+61412345679',
          dateOfBirth: '1991-01-01',
          acceptedTerms: true
        });

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should prevent login with unverified account', async () => {
      // Register but don't verify
      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      // Attempt login without verification
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(loginResponse.status).toBe(403);
      expect(loginResponse.body.success).toBe(false);
      expect(loginResponse.body.error.code).toBe('ACCOUNT_NOT_VERIFIED');
    });
  });

  describe('Token Management Flow', () => {
    beforeEach(async () => {
      // Setup verified user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: registerResponse.body.data.token,
          code: '123456'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data.accessToken).toBeDefined();
      expect(refreshResponse.body.data.accessToken).not.toBe(accessToken);
    });

    it('should reject invalid refresh token', async () => {
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        });

      expect(refreshResponse.status).toBe(401);
      expect(refreshResponse.body.success).toBe(false);
      expect(refreshResponse.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should logout and invalidate tokens', async () => {
      // Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refreshToken: refreshToken
        });

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // Verify token is invalidated
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(profileResponse.status).toBe(401);
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(async () => {
      // Setup verified user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: registerResponse.body.data.token,
          code: '123456'
        });
    });

    it('should complete password reset flow', async () => {
      // Request password reset
      const resetRequestResponse = await request(app)
        .post('/api/auth/password-reset/request')
        .send({
          email: testEmail
        });

      expect(resetRequestResponse.status).toBe(200);
      expect(resetRequestResponse.body.success).toBe(true);

      // Verify reset token (simulated)
      const verifyTokenResponse = await request(app)
        .post('/api/auth/password-reset/verify')
        .send({
          email: testEmail,
          token: 'reset-token-123',
          code: '123456'
        });

      expect(verifyTokenResponse.status).toBe(200);
      expect(verifyTokenResponse.body.success).toBe(true);

      // Reset password
      const newPassword = 'NewSecurePass123!';
      const resetPasswordResponse = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({
          email: testEmail,
          token: 'reset-token-123',
          newPassword: newPassword
        });

      expect(resetPasswordResponse.status).toBe(200);
      expect(resetPasswordResponse.body.success).toBe(true);

      // Login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: newPassword
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
    });

    it('should reject password reset for non-existent email', async () => {
      const resetRequestResponse = await request(app)
        .post('/api/auth/password-reset/request')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(resetRequestResponse.status).toBe(404);
      expect(resetRequestResponse.body.success).toBe(false);
      expect(resetRequestResponse.body.error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('Security and Rate Limiting', () => {
    it('should enforce rate limiting on login attempts', async () => {
      // Setup user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      // Multiple failed login attempts
      const promises = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: testEmail,
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(promises);
      
      // First 5 should be 401, 6th should be 429 (rate limited)
      expect(responses[4]?.status).toBe(401);
      expect(responses[5]?.status).toBe(429);
      expect(responses[5]?.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should detect and prevent concurrent login attempts', async () => {
      // Setup verified user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: registerResponse.body.data.token,
          code: '123456'
        });

      // Concurrent login attempts
      const promises = Array(3).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: testEmail,
            password: testPassword
          })
      );

      const responses = await Promise.all(promises);
      
      // Only one should succeed
      const successCount = responses.filter((r: any) => r.status === 200).length;
      expect(successCount).toBe(1);
    });

    it('should validate session integrity', async () => {
      // Setup authenticated user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: registerResponse.body.data.token,
          code: '123456'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      accessToken = loginResponse.body.data.accessToken;

      // Tamper with token
      const tamperedToken = accessToken.slice(0, -5) + 'XXXXX';

      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(profileResponse.status).toBe(401);
      expect(profileResponse.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Multi-Device Authentication', () => {
    it('should handle multiple active sessions', async () => {
      // Setup verified user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: registerResponse.body.data.token,
          code: '123456'
        });

      // Login from multiple devices
      const device1Login = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
          deviceInfo: {
            deviceId: 'device-1',
            platform: 'ios',
            version: '15.0'
          }
        });

      const device2Login = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
          deviceInfo: {
            deviceId: 'device-2',
            platform: 'android',
            version: '12.0'
          }
        });

      expect(device1Login.status).toBe(200);
      expect(device2Login.status).toBe(200);

      // Both sessions should be valid
      const profile1Response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${device1Login.body.data.accessToken}`);

      const profile2Response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${device2Login.body.data.accessToken}`);

      expect(profile1Response.status).toBe(200);
      expect(profile2Response.status).toBe(200);
    });

    it('should revoke all sessions on security event', async () => {
      // Setup user with multiple sessions
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'John',
          lastName: 'Smith',
          phone: testPhone,
          dateOfBirth: '1990-01-01',
          acceptedTerms: true
        });

      await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: registerResponse.body.data.token,
          code: '123456'
        });

      const session1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      const session2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      // Trigger security event (password change)
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${session1.body.data.accessToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: 'NewSecurePass123!'
        });

      // All sessions should be invalidated
      const profile1Response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${session1.body.data.accessToken}`);

      const profile2Response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${session2.body.data.accessToken}`);

      expect(profile1Response.status).toBe(401);
      expect(profile2Response.status).toBe(401);
    });
  });
});