import * as React from 'react';
import { useState } from 'react';
import { SignIn } from '@stackframe/react';

/**
 * ✅ FIXED: SignInPage with error handling and error display
 * Displays authentication errors to users so they understand why sign-in failed
 */
export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);

  // Handle authentication errors
  const handleAuthError = (errorMessage: string) => {
    console.error('❌ Authentication error:', errorMessage);
    setError(errorMessage);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ✅ Error display banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-50 border-b border-red-200 p-4 z-50">
          <div className="max-w-md mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stack Auth SignIn component */}
      <SignIn
        fullPage={true}
        automaticRedirect={true}
        firstTab="password"
        onError={(error) => {
          // Handle Stack Auth errors
          const errorMessage = error?.message || 'An authentication error occurred. Please try again.';
          handleAuthError(errorMessage);
        }}
        extraInfo={
          <>
            When signing in, you agree to our{' '}
            <a href="/legal/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </>
        }
      />
    </div>
  );
}