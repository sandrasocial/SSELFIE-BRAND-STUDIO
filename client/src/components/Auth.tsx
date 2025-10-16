import * as React from 'react';
import { useAuth } from '../hooks/use-auth.js';
import { useLocation } from 'wouter';
import { ErrorBoundary } from './ErrorBoundary.js';

interface AuthProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const Auth: React.FC<AuthProps> = ({ 
  children, 
  fallbackPath = '/handler/sign-in' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Premium loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-stone-50 flex items-center justify-center">
        <div className="relative">
          {/* Premium loading spinner with luxury styling */}
          <div className="w-20 h-20 border-2 border-stone-300 rounded-full animate-spin relative">
            <div className="absolute top-1 left-1 w-3 h-3 bg-stone-600 rounded-full animate-pulse" />
          </div>
          {/* Loading text */}
          <p className="mt-4 text-center text-stone-600 font-light tracking-wider text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Auth check with luxury styling
  if (!isAuthenticated) {
    setLocation(fallbackPath);
    return null;
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};