import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { apiFetch } from '../lib/api';

export default function AuthSuccess() {
  const { isAuthenticated, stackUser } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        // ✅ DIAGNOSTIC LOG: Auth success component loaded
        console.log('🎯 AuthSuccess component loaded at:', new Date().toISOString());
        console.log('🔍 Auth state:', { isAuthenticated, hasStackUser: !!stackUser });
        
        // Wait a moment for Stack Auth to fully initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔐 About to fetch /api/me to validate database connection...');
        
        const response = await apiFetch('/me');
        
        console.log('✅ /api/me successful, redirecting to /app');
        setStatus('success');
        
        // Small delay to show success state
        setTimeout(() => {
          setLocation('/app');
        }, 500);
        
      } catch (e) {
        console.error('❌ Bootstrap /me failed:', e);
        setStatus('error');
        
        // Enhanced error handling
        if (e instanceof Error) {
          setErrorMessage(e.message);
          console.error('❌ Error details:', {
            message: e.message,
            stack: e.stack
          });
        }
        
        // Wait before redirecting to give user time to see error
        setTimeout(() => {
          console.log('🔄 Redirecting back to sign-in after error');
          setLocation('/handler/sign-in');
        }, 3000);
      }
    })();
  }, [setLocation, isAuthenticated, stackUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isAuthenticated ? 'Loading your studio…' : 'Completing authentication…'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Connecting to your creative studio database...
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-gray-600">
              Welcome to your creative studio!
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="text-gray-600 mb-2">
              We couldn't load your creative studio right now.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to try again...
            </p>
            {process.env.NODE_ENV === 'development' && errorMessage && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto">
                  {errorMessage}
                </pre>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
}