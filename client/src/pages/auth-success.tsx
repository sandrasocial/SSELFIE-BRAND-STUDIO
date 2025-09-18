import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { apiFetch } from '../lib/api';

export default function AuthSuccess() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    (async () => {
      try {
        await apiFetch('/me');
        setLocation('/app');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Bootstrap /me failed:', e);
        setLocation('/handler/sign-in');
      }
    })();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isAuthenticated ? 'Signing you in…' : 'Completing authentication…'}
        </p>
      </div>
    </div>
  );
}