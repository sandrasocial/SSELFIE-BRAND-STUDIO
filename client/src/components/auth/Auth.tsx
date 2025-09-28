/**
 * Auth Component - Maya-Only Architecture
 * Main authentication wrapper component
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth.js';
import { MemberNavigation } from '../member-navigation.js';
import { GlobalFooter } from '../global-footer.js';
import { Loader2 } from 'lucide-react';
import type { AuthGuardProps } from '../../../shared/types/auth.js';

interface AuthProps extends Omit<AuthGuardProps, 'children'> {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export function Auth({ 
  children, 
  fallback, 
  requireVerification = false,
  redirectTo = '/business',
  showNavigation = true,
  showFooter = true
}: AuthProps) {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();

  // Handle authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && redirectTo) {
        setLocation(redirectTo);
        return;
      }

      if (isAuthenticated && requireVerification && user && !user.emailVerified) {
        setLocation('/auth/verify-email');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireVerification, redirectTo, setLocation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Authentication error
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 text-2xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900">Authentication Error</h2>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated - show fallback or redirect
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
          <button
            onClick={() => setLocation('/auth/signin')}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Email verification required
  if (requireVerification && user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-2xl">📧</div>
          <h2 className="text-xl font-semibold text-gray-900">Email Verification Required</h2>
          <p className="text-gray-600">
            Please check your email and click the verification link to continue.
          </p>
          <button
            onClick={() => setLocation('/auth/verify-email')}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Resend Verification
          </button>
        </div>
      </div>
    );
  }

  // Authenticated - render children with optional navigation and footer
  return (
    <div className="min-h-screen bg-white">
      {showNavigation && <MemberNavigation />}
      
      <main className={showNavigation ? 'pt-16' : ''}>
        {children}
      </main>
      
      {showFooter && <GlobalFooter />}
    </div>
  );
}

// Helper component for protecting routes
export function AuthGuard({ children, ...props }: AuthGuardProps) {
  return (
    <Auth {...props} showNavigation={false} showFooter={false}>
      {children}
    </Auth>
  );
}