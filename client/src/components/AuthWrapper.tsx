import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import PageLoader from './PageLoader.js';
import { ROUTES } from '../constants/routes.js';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location !== ROUTES.BUSINESS_LANDING) {
      setLocation(ROUTES.BUSINESS_LANDING);
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

