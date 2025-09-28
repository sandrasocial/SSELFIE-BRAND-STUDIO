/**
 * Type-safe session storage management
 * Handles authentication session persistence and validation
 */

import type { AuthSession, SessionStorage } from '../types/auth.js';
import { createSessionAuthError } from './auth-errors.js';

const SESSION_STORAGE_KEY = 'sselfie_auth_session';
const SESSION_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

// Session validation utilities
const isValidSessionData = (data: unknown): data is AuthSession => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'isValid' in data &&
    typeof (data as any).isValid === 'boolean'
  );
};

const isSessionExpired = (session: AuthSession): boolean => {
  if (!session.expiresAt) {
    return false; // No expiry set, assume valid
  }
  
  return Date.now() >= (session.expiresAt - SESSION_EXPIRY_BUFFER);
};

// Type-safe session storage implementation
export const createSessionStorage = (): SessionStorage => {
  const getSession = (): AuthSession | null => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        return null;
      }
      
      const parsed = JSON.parse(stored);
      if (!isValidSessionData(parsed)) {
        // Clear invalid session data
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      
      if (isSessionExpired(parsed)) {
        // Clear expired session
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch (error) {
      // Clear corrupted session data
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  };
  
  const setSession = (session: AuthSession): void => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  };
  
  const clearSession = (): void => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };
  
  const isSessionValid = (): boolean => {
    const session = getSession();
    return session?.isValid === true && !isSessionExpired(session);
  };
  
  return {
    getSession,
    setSession,
    clearSession,
    isSessionValid,
  };
};

// Default session storage instance
export const sessionStorage = createSessionStorage();

// Session utilities
export const createAuthSession = (
  accessToken?: string,
  refreshToken?: string,
  expiresIn?: number
): AuthSession => {
  const expiresAt = expiresIn ? Date.now() + (expiresIn * 1000) : undefined;
  
  return {
    isValid: true,
    accessToken,
    refreshToken,
    expiresAt,
  };
};

export const invalidateSession = (): AuthSession => ({
  isValid: false,
});

// Session refresh logic
export const shouldRefreshSession = (session: AuthSession | null): boolean => {
  if (!session || !session.isValid || !session.expiresAt) {
    return false;
  }
  
  // Refresh if session expires within 10 minutes
  const refreshThreshold = 10 * 60 * 1000;
  return Date.now() >= (session.expiresAt - refreshThreshold);
};

// Session error handling
export const handleSessionError = (error: unknown) => {
  sessionStorage.clearSession();
  
  if (error instanceof Error && error.message.includes('401')) {
    return createSessionAuthError('SESSION_EXPIRED', 'Authentication session has expired');
  }
  
  return createSessionAuthError('SESSION_INVALID', 'Authentication session is invalid');
};