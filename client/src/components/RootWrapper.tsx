import React, { Suspense, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "./ErrorBoundary";
import { getQueryClient } from "../lib/queryClient";
import PageLoader from './PageLoader';
import { isPublicRoute } from '../constants/routes';
import { useLocation } from 'wouter';

// Lazy load providers
const LazyTooltipProvider = React.lazy(() => import('./ui/tooltip').then(mod => ({ default: mod.TooltipProvider })));
const LazyToaster = React.lazy(() => import('./ui/toaster').then(mod => ({ default: mod.Toaster })));
const StackAuthProvider = React.lazy(() => import('./providers/StackAuthProvider').then(mod => ({ default: mod.default })));

interface RootWrapperProps {
  children: React.ReactNode;
}

export default function RootWrapper({ children }: RootWrapperProps) {
  const [location] = useLocation();
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Detect if current route is public and update when route changes
  useEffect(() => {
    const path = location || window.location.pathname;
    const publicRoute = isPublicRoute(path);
    setIsPublic(publicRoute);

    // Mark as ready after first route detection
    setIsReady(true);

    console.log(`🔀 Route changed to: ${path} (public: ${publicRoute})`);
  }, [location]);

  // Show loading state while determining route type
  if (!isReady) {
    return (
      <React.StrictMode>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <PageLoader />
          </Suspense>
        </ErrorBoundary>
      </React.StrictMode>
    );
  }

  // For public routes, skip Stack Auth initialization
  if (isPublic) {
    return (
      <React.StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={getQueryClient()}>
            <Suspense fallback={<PageLoader />}>
              <LazyTooltipProvider>
                <ErrorBoundary>
                  {children}
                  <LazyToaster />
                </ErrorBoundary>
              </LazyTooltipProvider>
            </Suspense>
          </QueryClientProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  }

  // For protected/auth routes, include Stack Auth
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={getQueryClient()}>
          <Suspense fallback={<PageLoader />}>
            <StackAuthProvider>
              <Suspense fallback={<PageLoader />}>
                <LazyTooltipProvider>
                  <ErrorBoundary>
                    {children}
                    <LazyToaster />
                  </ErrorBoundary>
                </LazyTooltipProvider>
              </Suspense>
            </StackAuthProvider>
          </Suspense>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}