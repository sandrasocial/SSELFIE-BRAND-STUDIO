import React, { ComponentType, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { PageLoader } from './PageLoader.js';

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
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're done loading AND user is not authenticated
    if (!isLoading && !isAuthenticated) {
      setLocation(fallbackPath);
    }
  }, [isAuthenticated, isLoading, setLocation, fallbackPath]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <PageLoader />; // Show loader while redirecting
  }

  return <Component {...props} />;
}