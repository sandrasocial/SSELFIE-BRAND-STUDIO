/**
 * Authentication error handling utilities
 * Provides type-safe error creation and handling
 */

import type { AuthErrorType, NetworkAuthError, ValidationAuthError, SessionAuthError, UnknownAuthError } from '../types/auth.js';

// Error factory functions
export const createNetworkAuthError = (
  message: string,
  statusCode?: number,
  retryable: boolean = true
): NetworkAuthError => ({
  code: 'NETWORK_ERROR',
  message,
  statusCode,
  timestamp: Date.now(),
  retryable,
});

export const createValidationAuthError = (
  message: string,
  field?: string,
  retryable: boolean = false
): ValidationAuthError => ({
  code: 'VALIDATION_ERROR',
  message,
  field,
  timestamp: Date.now(),
  retryable,
});

export const createSessionAuthError = (
  code: 'SESSION_EXPIRED' | 'SESSION_INVALID',
  message: string,
  retryable: boolean = false
): SessionAuthError => ({
  code,
  message,
  timestamp: Date.now(),
  retryable,
});

export const createUnknownAuthError = (
  message: string,
  originalError?: Error,
  retryable: boolean = false
): UnknownAuthError => ({
  code: 'UNKNOWN_ERROR',
  message,
  originalError,
  timestamp: Date.now(),
  retryable,
});

// Error conversion utilities
export const convertErrorToAuthError = (error: unknown): AuthErrorType => {
  if (error instanceof Error) {
    // Handle network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      const statusCode = extractStatusCode(error.message);
      return createNetworkAuthError(error.message, statusCode);
    }
    
    // Handle session errors
    if (error.message.includes('session') || error.message.includes('expired')) {
      return createSessionAuthError('SESSION_EXPIRED', error.message);
    }
    
    // Handle validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return createValidationAuthError(error.message);
    }
    
    // Default to unknown error
    return createUnknownAuthError(error.message, error);
  }
  
  if (typeof error === 'string') {
    return createUnknownAuthError(error);
  }
  
  return createUnknownAuthError('An unknown error occurred', undefined);
};

// Error message formatting
export const formatAuthErrorMessage = (error: AuthErrorType): string => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return `Network error: ${error.message}${error.statusCode ? ` (${error.statusCode})` : ''}`;
    case 'VALIDATION_ERROR':
      return `Validation error: ${error.message}${error.field ? ` (${error.field})` : ''}`;
    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please sign in again.';
    case 'SESSION_INVALID':
      return 'Your session is invalid. Please sign in again.';
    case 'UNKNOWN_ERROR':
      return `An unexpected error occurred: ${error.message}`;
    default:
      return 'An unknown error occurred';
  }
};

// Error recovery suggestions
export const getErrorRecoveryAction = (error: AuthErrorType): string | null => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return error.retryable ? 'Please check your connection and try again.' : null;
    case 'SESSION_EXPIRED':
    case 'SESSION_INVALID':
      return 'Please sign in again.';
    case 'VALIDATION_ERROR':
      return error.field ? `Please check the ${error.field} field.` : 'Please check your input.';
    case 'UNKNOWN_ERROR':
      return error.retryable ? 'Please try again.' : null;
    default:
      return null;
  }
};

// Helper function to extract status code from error messages
const extractStatusCode = (message: string): number | undefined => {
  const match = message.match(/(\d{3})/);
  return match ? parseInt(match[1], 10) : undefined;
};

// Error logging utility
export const logAuthError = (error: AuthErrorType, context?: string): void => {
  const logMessage = `[AUTH_ERROR] ${error.code}: ${error.message}`;
  const logContext = context ? ` (Context: ${context})` : '';
  
  console.error(`${logMessage}${logContext}`, {
    error,
    timestamp: new Date(error.timestamp).toISOString(),
    context,
  });
};