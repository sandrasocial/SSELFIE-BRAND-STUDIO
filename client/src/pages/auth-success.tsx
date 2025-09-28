import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { apiFetch } from '../lib/api.js';
import { AuthErrorBoundary } from '../components/AuthErrorBoundary.js';
import { createNetworkAuthError, logAuthError } from '../lib/auth-errors.js';

function AuthSuccessComponent(): JSX.Element {
  const { isAuthenticated, authState } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    (async () => {
      try {
        // Verify authentication by calling /me endpoint
        await apiFetch('/me');
        setLocation('/app');
      } catch (error) {
        console.error('Bootstrap /me failed:', error);
        const authError = createNetworkAuthError(
          'Failed to complete authentication setup. Please try signing in again.',
          undefined,
          true
        );
        logAuthError(authError, 'Auth success bootstrap');
        setLocation('/handler/sign-in');
      }
    })();
  }, [setLocation]);

  const getStatusMessage = (): string => {
    switch (authState) {
      case 'authenticated':
        return 'Signing you in…';
      case 'authenticating':
        return 'Completing authentication…';
      case 'session_expired':
        return 'Session expired, redirecting…';
      case 'error':
        return 'Authentication error, redirecting…';
      default:
        return 'Preparing your account…';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {getStatusMessage()}
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccess(): JSX.Element {
  return (
    <AuthErrorBoundary>
      <AuthSuccessComponent />
    </AuthErrorBoundary>
  );
}