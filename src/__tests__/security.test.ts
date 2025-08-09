import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { login, validateToken, checkRateLimit } from '../src/auth';
import { Request, Response } from 'express';

describe('Security Tests', () => {
  const testUser = {
    email: 'security@test.com',
    password: 'SecurePass123!'
  };

  describe('Token Validation', () => {
    let validToken: string;

    beforeEach(async () => {
      const loginResult = await login(testUser.email, testUser.password);
      validToken = loginResult.token;
    });

    it('should validate legitimate tokens', async () => {
      const result = await validateToken(validToken);
      expect(result.valid).toBe(true);
      expect(result.userId).toBeDefined();
    });

    it('should reject expired tokens', async () => {
      const expiredToken = 'expired.test.token';
      const result = await validateToken(expiredToken);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should reject malformed tokens', async () => {
      const malformedToken = 'not-a-real-token';
      const result = await validateToken(malformedToken);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid format');
    });
  });

  describe('Rate Limiting', () => {
    const mockRequest = (ip: string): Partial<Request> => ({
      ip,
      headers: {},
      method: 'POST',
      path: '/api/auth/login'
    });

    const mockResponse = (): Partial<Response> => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    });

    it('should allow requests within rate limit', async () => {
      const req = mockRequest('127.0.0.1');
      const res = mockResponse();
      
      const result = await checkRateLimit(req as Request, res as Response);
      expect(result.allowed).toBe(true);
    });

    it('should block excessive requests', async () => {
      const req = mockRequest('127.0.0.1');
      const res = mockResponse();

      // Make multiple requests
      for (let i = 0; i < 100; i++) {
        await checkRateLimit(req as Request, res as Response);
      }

      const result = await checkRateLimit(req as Request, res as Response);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('rate limit exceeded');
    });

    it('should track limits per IP address', async () => {
      const req1 = mockRequest('127.0.0.1');
      const req2 = mockRequest('127.0.0.2');
      const res = mockResponse();

      // Max out first IP
      for (let i = 0; i < 100; i++) {
        await checkRateLimit(req1 as Request, res as Response);
      }

      // Second IP should still be allowed
      const result = await checkRateLimit(req2 as Request, res as Response);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Auth Endpoint Security', () => {
    it('should require HTTPS', async () => {
      const req = {
        protocol: 'http',
        secure: false,
        headers: {}
      };

      const result = await validateSecureConnection(req);
      expect(result.secure).toBe(false);
      expect(result.error).toContain('HTTPS required');
    });

    it('should validate CORS headers', async () => {
      const req = {
        headers: {
          origin: 'https://trusted-domain.com'
        }
      };

      const result = await validateCORS(req);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid CORS origins', async () => {
      const req = {
        headers: {
          origin: 'https://malicious-site.com'
        }
      };

      const result = await validateCORS(req);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('unauthorized origin');
    });

    it('should enforce secure headers', async () => {
      const res = {
        headers: {}
      };

      await setSecurityHeaders(res);
      expect(res.headers['strict-transport-security']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['content-security-policy']).toBeDefined();
    });
  });
});