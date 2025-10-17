import React, { Suspense, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "./ErrorBoundary";
import { getQueryClient } from "../lib/queryClient";
import PageLoader from './PageLoader';
import { isPublicRoute } from '../constants/routes';
import { useLocation } from 'wouter';

// ✅ CRITICAL FIX: Import StackAuthProvider directly (not lazy)
// This prevents it from being loaded for public routes
import StackAuthProvider from './providers/StackAuthProvider';

// ✅ CRITICAL FIX: Import providers directly (NOT lazy)
// Lazy loading them inside Suspense causes the fallback to show
import { TooltipProvider } from './ui/tooltip';
import { Toaster } from './ui/toaster';

interface RootWrapperProps {
  children: React.ReactNode;
}

export default function RootWrapper({ children }: RootWrapperProps) {
  const [location] = useLocation();
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Detect if current route is public and update when route changes
  useEffect(() => {
    try {
      const path = location || window.location.pathname;
      console.log(`🔀 RootWrapper: Detecting route: ${path}`);

      const publicRoute = isPublicRoute(path);
      setIsPublic(publicRoute);

      // Mark as ready after first route detection
      setIsReady(true);

      console.log(`🔀 RootWrapper: Route detected - ${path} (public: ${publicRoute})`);
    } catch (error) {
      console.error('❌ RootWrapper: Error detecting route:', error);
      // Default to public route on error to allow app to load
      setIsPublic(true);
      setIsReady(true);
    }
  }, [location]);

  // Set a timeout to force ready state after 2 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReady) {
        console.warn('⚠️ RootWrapper: Route detection timeout - forcing ready state');
        setIsReady(true);
        setIsPublic(true); // Default to public route
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isReady]);

  // ✅ FIX #6: Show loading state while determining route type
  if (!isReady) {
    return <PageLoader />;
  }

  // ✅ CRITICAL FIX: Single Suspense boundary at top level
  // This is the ONLY Suspense boundary in the entire app
  // All lazy components use this single boundary
  const content = isPublic ? (
    // Public routes - no authentication
    <ErrorBoundary>
      <QueryClientProvider client={getQueryClient()}>
        <TooltipProvider>
          <ErrorBoundary>
            {children}
            <Toaster />
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  ) : (
    // Protected routes - with authentication
    <ErrorBoundary>
      <QueryClientProvider client={getQueryClient()}>
        <StackAuthProvider>
          <TooltipProvider>
            <ErrorBoundary>
              {children}
              <Toaster />
            </ErrorBoundary>
          </TooltipProvider>
        </StackAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );

  // ✅ SINGLE Suspense boundary wraps everything
  return (
    <Suspense fallback={<PageLoader />}>
      {content}
    </Suspense>
  );
}