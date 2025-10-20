import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../../hooks/use-auth.js';
import PageLoader from '../../../components/ui/page-loader.js';
import { ROUTES, PUBLIC_ROUTES, isPublicRoute, isAuthRoute } from '../../../constants/routes.js';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  // ✅ FIXED: Always call ALL hooks before any conditional logic
  const { isAuthenticated, isLoading } = useAuth();

  // ✅ FIXED: Call useEffect hook ALWAYS, before any returns
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLocation(ROUTES.BUSINESS_LANDING);
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // ✅ FIXED: Move conditional logic AFTER all hooks
  const allowlisted = isPublicRoute(location) || isAuthRoute(location) || PUBLIC_ROUTES.includes(location as any);
  if (allowlisted) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

