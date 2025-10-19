import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../../hooks/use-auth.js';
import PageLoader from '../../../components/ui/page-loader.js';
import { ROUTES, PUBLIC_ROUTES, isPublicRoute, isAuthRoute } from '../../../constants/routes.js';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  // Fast-path: on public/auth routes, do not invoke useAuth at all
  const allowlisted = isPublicRoute(location) || isAuthRoute(location) || PUBLIC_ROUTES.includes(location as any);
  if (allowlisted) {
    return <>{children}</>;
  }

  // Only protected routes use auth checks
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLocation(ROUTES.BUSINESS_LANDING);
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

