/**
 * Tests for authentication type guards and utilities
 */

import {
  isAuthError,
  isNetworkAuthError,
  isValidationAuthError,
  isSessionAuthError,
  isUserPlan,
  isUserRole,
  type AuthErrorType,
  type NetworkAuthError,
  type ValidationAuthError,
  type SessionAuthError,
  type UnknownAuthError,
} from '../../../client/src/types/auth.js';

describe('Auth Types', () => {
  describe('isAuthError', () => {
    it('should return true for valid auth error objects', () => {
      const validError: AuthErrorType = {
        code: 'NETWORK_ERROR',
        message: 'Network failed',
        timestamp: Date.now(),
        retryable: true,
      };

      expect(isAuthError(validError)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isAuthError(null)).toBe(false);
      expect(isAuthError(undefined)).toBe(false);
      expect(isAuthError({})).toBe(false);
      expect(isAuthError({ code: 'TEST' })).toBe(false);
      expect(isAuthError('string')).toBe(false);
      expect(isAuthError(123)).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      expect(isAuthError({ code: 'NETWORK_ERROR' })).toBe(false);
      expect(isAuthError({ message: 'Error' })).toBe(false);
      expect(isAuthError({ code: 'TEST', message: 'Error' })).toBe(false);
    });
  });

  describe('isNetworkAuthError', () => {
    it('should return true for network auth errors', () => {
      const networkError: NetworkAuthError = {
        code: 'NETWORK_ERROR',
        message: 'Network failed',
        timestamp: Date.now(),
        retryable: true,
        statusCode: 500,
      };

      expect(isNetworkAuthError(networkError)).toBe(true);
    });

    it('should return false for other error types', () => {
      const validationError: ValidationAuthError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        timestamp: Date.now(),
        retryable: false,
      };

      expect(isNetworkAuthError(validationError)).toBe(false);
    });
  });

  describe('isValidationAuthError', () => {
    it('should return true for validation auth errors', () => {
      const validationError: ValidationAuthError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        timestamp: Date.now(),
        retryable: false,
        field: 'email',
      };

      expect(isValidationAuthError(validationError)).toBe(true);
    });

    it('should return false for other error types', () => {
      const networkError: NetworkAuthError = {
        code: 'NETWORK_ERROR',
        message: 'Network failed',
        timestamp: Date.now(),
        retryable: true,
      };

      expect(isValidationAuthError(networkError)).toBe(false);
    });
  });

  describe('isSessionAuthError', () => {
    it('should return true for session expired errors', () => {
      const sessionError: SessionAuthError = {
        code: 'SESSION_EXPIRED',
        message: 'Session expired',
        timestamp: Date.now(),
        retryable: false,
      };

      expect(isSessionAuthError(sessionError)).toBe(true);
    });

    it('should return true for session invalid errors', () => {
      const sessionError: SessionAuthError = {
        code: 'SESSION_INVALID',
        message: 'Session invalid',
        timestamp: Date.now(),
        retryable: false,
      };

      expect(isSessionAuthError(sessionError)).toBe(true);
    });

    it('should return false for other error types', () => {
      const networkError: NetworkAuthError = {
        code: 'NETWORK_ERROR',
        message: 'Network failed',
        timestamp: Date.now(),
        retryable: true,
      };

      expect(isSessionAuthError(networkError)).toBe(false);
    });
  });

  describe('isUserPlan', () => {
    it('should return true for valid user plans', () => {
      expect(isUserPlan('sselfie-studio')).toBe(true);
    });

    it('should return false for invalid user plans', () => {
      expect(isUserPlan('invalid-plan')).toBe(false);
      expect(isUserPlan('')).toBe(false);
      expect(isUserPlan('premium')).toBe(false);
    });
  });

  describe('isUserRole', () => {
    it('should return true for valid user roles', () => {
      expect(isUserRole('user')).toBe(true);
      expect(isUserRole('admin')).toBe(true);
    });

    it('should return false for invalid user roles', () => {
      expect(isUserRole('invalid-role')).toBe(false);
      expect(isUserRole('')).toBe(false);
      expect(isUserRole('moderator')).toBe(false);
    });
  });
});