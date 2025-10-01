import React, { ComponentType, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { PageLoader } from './PageLoader.js';
import { Auth } from './Auth.js';

// Enhanced ProtectedRoute with proper Stack Auth integration
export function ProtectedRoute({ 
  component: Component, 
  fallbackPath = '/handler/sign-in',
  ...props 
}: { 
  component: ComponentType<any>;
  fallbackPath?: string;
  [key: string]: any;
}) {
  const { isAuthenticated, isLoading, hasStackAuthUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // For OAuth flows, hasStackAuthUser might be true even if DB user isn't loaded yet
    if (!isLoading && !isAuthenticated && !hasStackAuthUser) {
      setLocation(fallbackPath);
    }
  }, [isLoading, isAuthenticated, hasStackAuthUser, setLocation, fallbackPath]);

  // Show loading while authentication state is being determined
  if (isLoading) {
    return <PageLoader />;
  }

  // For OAuth callbacks, allow rendering if Stack Auth user exists
  // even if DB user isn't loaded yet
  if (!isAuthenticated && !hasStackAuthUser) {
    return <PageLoader />;
  }

  // Use Auth wrapper for consistent authentication experience
  return (
    <Auth fallbackPath={fallbackPath}>
      <Component {...props} />
    </Auth>
  );
}