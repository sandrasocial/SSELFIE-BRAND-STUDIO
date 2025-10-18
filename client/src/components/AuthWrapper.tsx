import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import PageLoader from './PageLoader.js';
import { ROUTES, PUBLIC_ROUTES, isPublicRoute, isAuthRoute } from '../constants/routes.js';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Allow all public and auth-related paths without forcing auth
    const allowlisted = isPublicRoute(location) || isAuthRoute(location) || PUBLIC_ROUTES.includes(location as any);

    if (!isAuthenticated && !allowlisted) {
      setLocation(ROUTES.BUSINESS_LANDING);
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

