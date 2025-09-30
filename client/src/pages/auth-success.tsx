import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { apiFetch } from '../lib/api.js';

export default function AuthSuccess() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Prevent infinite loops by limiting attempts
    if (attempts >= 3) {
      console.error('❌ Too many authentication attempts. Stopping retries.');
      setError('Authentication failed after multiple attempts. Please refresh or try again later.');
      return;
    }

    // Wait for auth hook to load before making API calls
    if (isLoading) {
      console.log('🔍 Auth hook is loading, waiting...');
      return;
    }

    (async () => {
      try {
        console.log('🔍 Auth success page: attempting /api/me call, attempt:', attempts + 1);
        console.log('🔍 Auth state:', { isAuthenticated, isLoading });

        setAttempts(prev => prev + 1);
        const result = await apiFetch('/me');

        console.log('✅ /api/me success:', result);
        setLocation('/app');
      } catch (e) {
        console.error('❌ Bootstrap /me failed:', e);
        setError(e instanceof Error ? e.message : 'Authentication failed');

        // If this is the first few attempts and we have auth issues, retry
        if (attempts < 2) {
          console.log('🔄 Retrying authentication in 2 seconds...');
          setTimeout(() => {
            setError(null);
          }, 2000);
        }
        // After 3 attempts, stop retrying and show error (no redirect)
      }
    })();
  }, [setLocation, isAuthenticated, isLoading, attempts]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        
        <p className="text-gray-600 mb-2">
          {isAuthenticated ? 'Signing you in…' : 'Completing authentication…'}
        </p>
        
        {attempts > 0 && (
          <p className="text-sm text-gray-500">
            Attempt {attempts}/3
          </p>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            {attempts < 3 && (
              <p className="text-xs text-red-500 mt-1">Retrying...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}