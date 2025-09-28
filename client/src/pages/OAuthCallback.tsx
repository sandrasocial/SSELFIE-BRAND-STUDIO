import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useStackApp } from '@stackframe/react';
import { PageLoader } from '../components/PageLoader.js';
import { AuthErrorBoundary } from '../components/AuthErrorBoundary.js';
import type { OAuthCallbackState } from '../types/auth.js';
import { createNetworkAuthError, logAuthError } from '../lib/auth-errors.js';

function hasCallbackParams(): boolean {
  const p = new URLSearchParams(window.location.search);
  return p.has('code') && p.has('state');
}

function OAuthCallbackComponent(): JSX.Element {
  const app = useStackApp();
  const [, setLocation] = useLocation();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<OAuthCallbackState>('idle');

  useEffect(() => {
    if (ranRef.current) return;
    if (!hasCallbackParams()) {
      setLocation('/handler/sign-in');
      return;
    }
    ranRef.current = true;

    (async () => {
      try {
        setStatus('processing');
        const hasRedirected = await app.callOAuthCallback();
        setStatus('success');
        if (!hasRedirected) setLocation('/auth-success');
      } catch (err) {
        console.error('OAuth callback failed:', err);
        const authError = createNetworkAuthError(
          'OAuth authentication failed. Please try signing in again.',
          undefined,
          true
        );
        logAuthError(authError, 'OAuth callback');
        setStatus('error');
        setLocation('/handler/sign-in');
      }
    })();
  }, [app, setLocation]);

  const getStatusMessage = (): string => {
    switch (status) {
      case 'processing':
        return 'Completing authentication…';
      case 'success':
        return 'Authentication successful…';
      case 'error':
        return 'Authentication failed…';
      default:
        return 'Preparing authentication…';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <PageLoader />
        <p className="text-gray-600 mt-4">
          {getStatusMessage()}
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallback(): JSX.Element {
  return (
    <AuthErrorBoundary>
      <OAuthCallbackComponent />
    </AuthErrorBoundary>
  );
}



