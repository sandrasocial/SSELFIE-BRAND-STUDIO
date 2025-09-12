import React, { ComponentType, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { PageLoader } from './PageLoader'; // Ensure PageLoader is imported

// This is now the single source of truth for protecting routes.
export function ProtectedRoute({ component: Component, ...props }: { component: ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to the Stack Auth sign-in page if not authenticated.
      setLocation('/handler/sign-in');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Show a loading spinner while authentication is in progress.
  if (isLoading || !isAuthenticated) {
    return <PageLoader />;
  }

  // If authenticated, render the requested component.
  return <Component {...props} />;
}