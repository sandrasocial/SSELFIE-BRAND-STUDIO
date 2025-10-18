import React, { ComponentType, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import PageLoader from './PageLoader.js';

// Simplified ProtectedRoute with single authentication check
export function ProtectedRoute({ 
  component: Component, 
  fallbackPath = '/handler/sign-in',
  ...props 
}: { 
  component: ComponentType<Record<string, unknown>>;
  fallbackPath?: string;
  [key: string]: unknown;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're done loading AND user is not authenticated
    // and we are not already at the fallback to avoid loops
    if (!isLoading && !isAuthenticated && location !== fallbackPath) {
      setLocation(fallbackPath);
    }
  }, [isAuthenticated, isLoading, setLocation, fallbackPath, location]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <PageLoader />; // Show loader while redirecting
  }

  return <Component {...props} />;
}