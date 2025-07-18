import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

export default function AuthExplainer() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If user is already authenticated, redirect to workspace
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to workspace');
      setLocation('/workspace');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleContinue = () => {
    window.location.href = "/api/login";
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't show login explainer if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-4xl font-light text-black mb-8">
          SSELFIE STUDIO
        </h1>
        
        <div className="mb-8 space-y-4 text-gray-700">
          <p>
            Quick heads up: You'll see a secure login screen that mentions technical platform details.
          </p>
          <p>
            Don't worry - you're still creating your SSELFIE Studio account. It's just the secure gateway.
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="bg-black text-white px-8 py-3 text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors mb-4"
        >
          Continue to Login
        </button>
        
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
}