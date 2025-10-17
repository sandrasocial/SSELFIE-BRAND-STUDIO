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
  const [isPublic, setIsPublic] = useState<boolean>(() => {
    // ✅ CRITICAL FIX: Initialize isPublic immediately (synchronous)
    // isPublicRoute() is a fast synchronous function, no need to wait
    const path = location || window.location.pathname;
    return isPublicRoute(path);
  });

  // Update isPublic when location changes
  useEffect(() => {
    try {
      const path = location || window.location.pathname;
      console.log(`🔀 RootWrapper: Route changed to: ${path}`);

      const publicRoute = isPublicRoute(path);
      setIsPublic(publicRoute);

      console.log(`🔀 RootWrapper: Route is ${publicRoute ? 'public' : 'protected'}`);
    } catch (error) {
      console.error('❌ RootWrapper: Error detecting route:', error);
      // Default to public route on error to allow app to load
      setIsPublic(true);
    }
  }, [location]);

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