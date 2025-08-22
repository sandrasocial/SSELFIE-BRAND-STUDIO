import { describe, it, expect } from 'jest';
import { verifyToken, generateToken } from '../src/auth/token';
import jwt from 'jsonwebtoken';

describe('Token Security Validation', () => {
  describe('Token Generation', () => {
    it('should generate tokens with proper claims', () => {
      const userData = {
        id: '123',
        email: 'test@example.com',
        role: 'user'
      };
      
      const token = generateToken(userData);
      const decoded = jwt.decode(token);
      
      expect(decoded).toHaveProperty('id', userData.id);
      expect(decoded).toHaveProperty('email', userData.email);
      expect(decoded).toHaveProperty('role', userData.role);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    it('should set appropriate token expiration', () => {
      const token = generateToken({ id: '123' });
      const decoded = jwt.decode(token);
      const now = Math.floor(Date.now() / 1000);
      
      expect(decoded.exp - now).toBeLessThanOrEqual(24 * 60 * 60); // 24 hours
    });
  });

  describe('Token Validation', () => {
    it('should reject expired tokens', () => {
      const expiredToken = jwt.sign(
        { id: '123', iat: Math.floor(Date.now() / 1000) - 86400 },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );
      
      expect(() => verifyToken(expiredToken)).toThrow('Token expired');
    });

    it('should reject tokens with invalid signatures', () => {
      const token = generateToken({ id: '123' });
      const tamperedToken = token.slice(0, -1) + '.';
      
      expect(() => verifyToken(tamperedToken)).toThrow('Invalid signature');
    });

    it('should reject tokens with missing required claims', () => {
      const token = jwt.sign(
        { email: 'test@example.com' }, // Missing required 'id' claim
        process.env.JWT_SECRET
      );
      
      expect(() => verifyToken(token)).toThrow('Missing required claims');
    });
  });

  describe('Token Refresh', () => {
    it('should validate refresh token requirements', () => {
      const refreshToken = generateToken({ id: '123', type: 'refresh' });
      const decoded = jwt.decode(refreshToken);
      
      expect(decoded).toHaveProperty('type', 'refresh');
      expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60); // 7 days
    });

    it('should reject refresh tokens used as access tokens', () => {
      const refreshToken = generateToken({ id: '123', type: 'refresh' });
      
      expect(() => verifyToken(refreshToken, { type: 'access' }))
        .toThrow('Invalid token type');
    });
  });
});