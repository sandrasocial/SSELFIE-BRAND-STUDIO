import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { pool } from '../src/db';
import { register, login, logout, resetPassword, verifyEmail } from '../src/auth';

describe('Authentication Flow Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  };

  beforeEach(async () => {
    // Clean up test database before each test
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  afterEach(async () => {
    // Clean up after tests
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const result = await register(testUser);
      expect(result.success).toBe(true);
      expect(result.user.email).toBe(testUser.email);
    });

    it('should not allow duplicate email registration', async () => {
      await register(testUser);
      const duplicateResult = await register(testUser);
      expect(duplicateResult.success).toBe(false);
      expect(duplicateResult.error).toContain('already exists');
    });

    it('should validate password requirements', async () => {
      const weakPassword = { ...testUser, password: '123' };
      const result = await register(weakPassword);
      expect(result.success).toBe(false);
      expect(result.error).toContain('password requirements');
    });
  });

  describe('Login/Logout Flow', () => {
    beforeEach(async () => {
      await register(testUser);
    });

    it('should successfully login with correct credentials', async () => {
      const result = await login(testUser.email, testUser.password);
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
      const result = await login(testUser.email, 'wrongpassword');
      expect(result.success).toBe(false);
    });

    it('should successfully logout user', async () => {
      const loginResult = await login(testUser.email, testUser.password);
      const logoutResult = await logout(loginResult.token);
      expect(logoutResult.success).toBe(true);
    });
  });

  describe('Password Reset', () => {
    beforeEach(async () => {
      await register(testUser);
    });

    it('should generate password reset token', async () => {
      const result = await resetPassword.requestReset(testUser.email);
      expect(result.success).toBe(true);
      expect(result.resetToken).toBeDefined();
    });

    it('should successfully reset password with valid token', async () => {
      const resetRequest = await resetPassword.requestReset(testUser.email);
      const result = await resetPassword.confirmReset(
        resetRequest.resetToken,
        'NewPassword123!'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Email Verification', () => {
    it('should generate verification token upon registration', async () => {
      const result = await register(testUser);
      expect(result.verificationToken).toBeDefined();
    });

    it('should successfully verify email with valid token', async () => {
      const registration = await register(testUser);
      const result = await verifyEmail(registration.verificationToken);
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
    });

    it('should fail verification with invalid token', async () => {
      const result = await verifyEmail('invalid-token');
      expect(result.success).toBe(false);
    });
  });
});