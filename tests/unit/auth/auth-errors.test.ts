/**
 * Tests for authentication error handling utilities
 */

import {
  createNetworkAuthError,
  createValidationAuthError,
  createSessionAuthError,
  createUnknownAuthError,
  convertErrorToAuthError,
  formatAuthErrorMessage,
  getErrorRecoveryAction,
} from '../../../client/src/lib/auth-errors.js';

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Auth Error Utilities', () => {
  describe('Error Factory Functions', () => {
    describe('createNetworkAuthError', () => {
      it('should create a network auth error with all properties', () => {
        const error = createNetworkAuthError('Network failed', 500, true);
        
        expect(error.code).toBe('NETWORK_ERROR');
        expect(error.message).toBe('Network failed');
        expect(error.statusCode).toBe(500);
        expect(error.retryable).toBe(true);
        expect(typeof error.timestamp).toBe('number');
      });

      it('should create a network auth error with default retryable=true', () => {
        const error = createNetworkAuthError('Network failed', 500);
        
        expect(error.retryable).toBe(true);
      });

      it('should create a network auth error without status code', () => {
        const error = createNetworkAuthError('Network failed');
        
        expect(error.statusCode).toBeUndefined();
        expect(error.retryable).toBe(true);
      });
    });

    describe('createValidationAuthError', () => {
      it('should create a validation auth error with field', () => {
        const error = createValidationAuthError('Invalid email', 'email', false);
        
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toBe('Invalid email');
        expect(error.field).toBe('email');
        expect(error.retryable).toBe(false);
        expect(typeof error.timestamp).toBe('number');
      });

      it('should create a validation auth error with default retryable=false', () => {
        const error = createValidationAuthError('Invalid input');
        
        expect(error.retryable).toBe(false);
        expect(error.field).toBeUndefined();
      });
    });

    describe('createSessionAuthError', () => {
      it('should create a session expired error', () => {
        const error = createSessionAuthError('SESSION_EXPIRED', 'Session expired');
        
        expect(error.code).toBe('SESSION_EXPIRED');
        expect(error.message).toBe('Session expired');
        expect(error.retryable).toBe(false);
        expect(typeof error.timestamp).toBe('number');
      });

      it('should create a session invalid error', () => {
        const error = createSessionAuthError('SESSION_INVALID', 'Session invalid', true);
        
        expect(error.code).toBe('SESSION_INVALID');
        expect(error.retryable).toBe(true);
      });
    });

    describe('createUnknownAuthError', () => {
      it('should create an unknown auth error with original error', () => {
        const originalError = new Error('Original error');
        const error = createUnknownAuthError('Something went wrong', originalError, true);
        
        expect(error.code).toBe('UNKNOWN_ERROR');
        expect(error.message).toBe('Something went wrong');
        expect(error.originalError).toBe(originalError);
        expect(error.retryable).toBe(true);
        expect(typeof error.timestamp).toBe('number');
      });

      it('should create an unknown auth error with default retryable=false', () => {
        const error = createUnknownAuthError('Something went wrong');
        
        expect(error.retryable).toBe(false);
        expect(error.originalError).toBeUndefined();
      });
    });
  });

  describe('convertErrorToAuthError', () => {
    it('should convert network Error to NetworkAuthError', () => {
      const networkError = new Error('fetch failed');
      const authError = convertErrorToAuthError(networkError);
      
      expect(authError.code).toBe('NETWORK_ERROR');
      expect(authError.message).toBe('fetch failed');
      expect(authError.retryable).toBe(true);
    });

    it('should convert session Error to SessionAuthError', () => {
      const sessionError = new Error('session expired');
      const authError = convertErrorToAuthError(sessionError);
      
      expect(authError.code).toBe('SESSION_EXPIRED');
      expect(authError.message).toBe('session expired');
      expect(authError.retryable).toBe(false);
    });

    it('should convert validation Error to ValidationAuthError', () => {
      const validationError = new Error('validation failed');
      const authError = convertErrorToAuthError(validationError);
      
      expect(authError.code).toBe('VALIDATION_ERROR');
      expect(authError.message).toBe('validation failed');
      expect(authError.retryable).toBe(false);
    });

    it('should convert generic Error to UnknownAuthError', () => {
      const genericError = new Error('Generic error');
      const authError = convertErrorToAuthError(genericError);
      
      expect(authError.code).toBe('UNKNOWN_ERROR');
      expect(authError.message).toBe('Generic error');
      expect(authError.retryable).toBe(false);
    });

    it('should convert string to UnknownAuthError', () => {
      const authError = convertErrorToAuthError('String error');
      
      expect(authError.code).toBe('UNKNOWN_ERROR');
      expect(authError.message).toBe('String error');
      expect(authError.retryable).toBe(false);
    });

    it('should convert unknown type to UnknownAuthError', () => {
      const authError = convertErrorToAuthError({ unknown: 'object' });
      
      expect(authError.code).toBe('UNKNOWN_ERROR');
      expect(authError.message).toBe('An unknown error occurred');
      expect(authError.retryable).toBe(false);
    });
  });

  describe('formatAuthErrorMessage', () => {
    it('should format network error with status code', () => {
      const error = createNetworkAuthError('Network failed', 500);
      const message = formatAuthErrorMessage(error);
      
      expect(message).toBe('Network error: Network failed (500)');
    });

    it('should format network error without status code', () => {
      const error = createNetworkAuthError('Network failed');
      const message = formatAuthErrorMessage(error);
      
      expect(message).toBe('Network error: Network failed');
    });

    it('should format validation error with field', () => {
      const error = createValidationAuthError('Invalid email', 'email');
      const message = formatAuthErrorMessage(error);
      
      expect(message).toBe('Validation error: Invalid email (email)');
    });

    it('should format validation error without field', () => {
      const error = createValidationAuthError('Invalid input');
      const message = formatAuthErrorMessage(error);
      
      expect(message).toBe('Validation error: Invalid input');
    });

    it('should format session expired error', () => {
      const error = createSessionAuthError('SESSION_EXPIRED', 'Session expired');
      const message = formatAuthErrorMessage(error);
      
      expect(message).toBe('Your session has expired. Please sign in again.');
    });

    it('should format session invalid error', () => {
      const error = createSessionAuthError('SESSION_INVALID', 'Session invalid');
      const message = formatAuthErrorMessage(error);
      
      expect(message).toBe('Your session is invalid. Please sign in again.');
    });

    it('should format unknown error', () => {
      const error = createUnknownAuthError('Something went wrong');
      const message = formatAuthErrorMessage(error);
      
      expect(message).toBe('An unexpected error occurred: Something went wrong');
    });
  });

  describe('getErrorRecoveryAction', () => {
    it('should return retry suggestion for retryable network error', () => {
      const error = createNetworkAuthError('Network failed', 500, true);
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBe('Please check your connection and try again.');
    });

    it('should return null for non-retryable network error', () => {
      const error = createNetworkAuthError('Network failed', 500, false);
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBeNull();
    });

    it('should return sign in suggestion for session expired error', () => {
      const error = createSessionAuthError('SESSION_EXPIRED', 'Session expired');
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBe('Please sign in again.');
    });

    it('should return sign in suggestion for session invalid error', () => {
      const error = createSessionAuthError('SESSION_INVALID', 'Session invalid');
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBe('Please sign in again.');
    });

    it('should return field check suggestion for validation error with field', () => {
      const error = createValidationAuthError('Invalid email', 'email');
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBe('Please check the email field.');
    });

    it('should return generic check suggestion for validation error without field', () => {
      const error = createValidationAuthError('Invalid input');
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBe('Please check your input.');
    });

    it('should return retry suggestion for retryable unknown error', () => {
      const error = createUnknownAuthError('Something went wrong', undefined, true);
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBe('Please try again.');
    });

    it('should return null for non-retryable unknown error', () => {
      const error = createUnknownAuthError('Something went wrong', undefined, false);
      const action = getErrorRecoveryAction(error);
      
      expect(action).toBeNull();
    });
  });
});