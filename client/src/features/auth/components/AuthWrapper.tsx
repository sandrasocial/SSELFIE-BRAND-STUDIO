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
    
    // ✅ FIXED: Don't redirect if user is trying to authenticate
    // Allow Stack Auth components to render and handle authentication
    if (!isAuthenticated) {
      // Only redirect to business landing if we're on a protected route
      // Don't redirect if user is in the middle of authentication flow
      const isOnSignInFlow = location.includes('sign-in') || 
                            location.includes('auth') || 
                            location.includes('login') ||
                            location === '/'; // Allow root page for Stack Auth
      
      if (!isOnSignInFlow && !isPublicRoute(location) && !isAuthRoute(location)) {
        setLocation(ROUTES.BUSINESS_LANDING);
      }
    }
  }, [isAuthenticated, isLoading, setLocation, location]);

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

