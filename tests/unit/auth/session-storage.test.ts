/**
 * Tests for session storage utilities
 */

import {
  createSessionStorage,
  createAuthSession,
  invalidateSession,
  shouldRefreshSession,
  handleSessionError,
} from '../../../client/src/lib/session-storage.js';
import type { AuthSession } from '../../../client/src/types/auth.js';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
});

afterAll(() => {
  console.error = originalConsoleError;
});

beforeEach(() => {
  mockLocalStorage.clear();
  jest.clearAllMocks();
});

describe('Session Storage Utilities', () => {
  describe('createSessionStorage', () => {
    let sessionStorage: ReturnType<typeof createSessionStorage>;

    beforeEach(() => {
      sessionStorage = createSessionStorage();
    });

    describe('getSession', () => {
      it('should return null when no session is stored', () => {
        const session = sessionStorage.getSession();
        expect(session).toBeNull();
      });

      it('should return a valid session when stored', () => {
        const validSession: AuthSession = {
          isValid: true,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() + 3600000, // 1 hour from now
        };

        mockLocalStorage.setItem('sselfie_auth_session', JSON.stringify(validSession));
        
        const session = sessionStorage.getSession();
        expect(session).toEqual(validSession);
      });

      it('should return null and clear invalid session data', () => {
        mockLocalStorage.setItem('sselfie_auth_session', JSON.stringify({ invalid: 'data' }));
        
        const session = sessionStorage.getSession();
        expect(session).toBeNull();
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sselfie_auth_session');
      });

      it('should return null and clear expired session', () => {
        const expiredSession: AuthSession = {
          isValid: true,
          expiresAt: Date.now() - 1000, // 1 second ago
        };

        mockLocalStorage.setItem('sselfie_auth_session', JSON.stringify(expiredSession));
        
        const session = sessionStorage.getSession();
        expect(session).toBeNull();
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sselfie_auth_session');
      });

      it('should return null and clear corrupted session data', () => {
        mockLocalStorage.setItem('sselfie_auth_session', '{ invalid json }');
        
        const session = sessionStorage.getSession();
        expect(session).toBeNull();
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sselfie_auth_session');
      });
    });

    describe('setSession', () => {
      it('should store a session successfully', () => {
        const session: AuthSession = {
          isValid: true,
          accessToken: 'access-token',
        };

        sessionStorage.setSession(session);
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'sselfie_auth_session',
          JSON.stringify(session)
        );
      });

      it('should handle storage errors gracefully', () => {
        const session: AuthSession = { isValid: true };
        mockLocalStorage.setItem.mockImplementationOnce(() => {
          throw new Error('Storage error');
        });

        // Should not throw
        sessionStorage.setSession(session);
        expect(console.error).toHaveBeenCalledWith('Failed to store session:', expect.any(Error));
      });
    });

    describe('clearSession', () => {
      it('should remove session from storage', () => {
        sessionStorage.clearSession();
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sselfie_auth_session');
      });

      it('should handle storage errors gracefully', () => {
        mockLocalStorage.removeItem.mockImplementationOnce(() => {
          throw new Error('Storage error');
        });

        // Should not throw
        sessionStorage.clearSession();
        expect(console.error).toHaveBeenCalledWith('Failed to clear session:', expect.any(Error));
      });
    });

    describe('isSessionValid', () => {
      it('should return true for valid non-expired session', () => {
        const validSession: AuthSession = {
          isValid: true,
          expiresAt: Date.now() + 3600000, // 1 hour from now
        };

        mockLocalStorage.setItem('sselfie_auth_session', JSON.stringify(validSession));
        
        expect(sessionStorage.isSessionValid()).toBe(true);
      });

      it('should return false for invalid session', () => {
        const invalidSession: AuthSession = {
          isValid: false,
        };

        mockLocalStorage.setItem('sselfie_auth_session', JSON.stringify(invalidSession));
        
        expect(sessionStorage.isSessionValid()).toBe(false);
      });

      it('should return false for expired session', () => {
        const expiredSession: AuthSession = {
          isValid: true,
          expiresAt: Date.now() - 1000, // 1 second ago
        };

        mockLocalStorage.setItem('sselfie_auth_session', JSON.stringify(expiredSession));
        
        expect(sessionStorage.isSessionValid()).toBe(false);
      });

      it('should return false when no session exists', () => {
        expect(sessionStorage.isSessionValid()).toBe(false);
      });
    });
  });

  describe('createAuthSession', () => {
    it('should create a session with all tokens and expiry', () => {
      const session = createAuthSession('access-token', 'refresh-token', 3600);
      
      expect(session.isValid).toBe(true);
      expect(session.accessToken).toBe('access-token');
      expect(session.refreshToken).toBe('refresh-token');
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should create a session without tokens', () => {
      const session = createAuthSession();
      
      expect(session.isValid).toBe(true);
      expect(session.accessToken).toBeUndefined();
      expect(session.refreshToken).toBeUndefined();
      expect(session.expiresAt).toBeUndefined();
    });

    it('should calculate correct expiry time', () => {
      const expiresIn = 3600; // 1 hour
      const beforeCall = Date.now();
      const session = createAuthSession('token', 'refresh', expiresIn);
      const afterCall = Date.now();
      
      expect(session.expiresAt).toBeGreaterThanOrEqual(beforeCall + (expiresIn * 1000));
      expect(session.expiresAt).toBeLessThanOrEqual(afterCall + (expiresIn * 1000));
    });
  });

  describe('invalidateSession', () => {
    it('should create an invalid session', () => {
      const session = invalidateSession();
      
      expect(session.isValid).toBe(false);
      expect(session.accessToken).toBeUndefined();
      expect(session.refreshToken).toBeUndefined();
      expect(session.expiresAt).toBeUndefined();
    });
  });

  describe('shouldRefreshSession', () => {
    it('should return false for null session', () => {
      expect(shouldRefreshSession(null)).toBe(false);
    });

    it('should return false for invalid session', () => {
      const session: AuthSession = { isValid: false };
      expect(shouldRefreshSession(session)).toBe(false);
    });

    it('should return false for session without expiry', () => {
      const session: AuthSession = { isValid: true };
      expect(shouldRefreshSession(session)).toBe(false);
    });

    it('should return true when session expires within refresh threshold', () => {
      const session: AuthSession = {
        isValid: true,
        expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes from now
      };
      
      expect(shouldRefreshSession(session)).toBe(true);
    });

    it('should return false when session expires beyond refresh threshold', () => {
      const session: AuthSession = {
        isValid: true,
        expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes from now
      };
      
      expect(shouldRefreshSession(session)).toBe(false);
    });
  });

  describe('handleSessionError', () => {
    beforeEach(() => {
      // Mock sessionStorage.clearSession
      const mockSessionStorage = createSessionStorage();
      mockSessionStorage.setSession({ isValid: true });
    });

    it('should create session expired error for 401 errors', () => {
      const error = new Error('401: Unauthorized');
      const authError = handleSessionError(error);
      
      expect(authError.code).toBe('SESSION_EXPIRED');
      expect(authError.message).toBe('Authentication session has expired');
    });

    it('should create session invalid error for other errors', () => {
      const error = new Error('Some other error');
      const authError = handleSessionError(error);
      
      expect(authError.code).toBe('SESSION_INVALID');
      expect(authError.message).toBe('Authentication session is invalid');
    });

    it('should create session invalid error for non-Error objects', () => {
      const authError = handleSessionError('string error');
      
      expect(authError.code).toBe('SESSION_INVALID');
      expect(authError.message).toBe('Authentication session is invalid');
    });
  });
});