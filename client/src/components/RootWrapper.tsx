import React, { Suspense, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "./ErrorBoundary";
import { getQueryClient } from "../lib/queryClient";
import PageLoader from './PageLoader';
import { isPublicRoute } from '../constants/routes';
import { useLocation } from 'wouter';

// Lazy load providers - wrap in proper component structure
const LazyTooltipProvider = React.lazy(() =>
  import('./ui/tooltip').then(mod => {
    console.log('✅ Tooltip module loaded:', Object.keys(mod));
    // Ensure we have the TooltipProvider component
    if (!mod.TooltipProvider) {
      console.error('❌ TooltipProvider not found in tooltip module. Available exports:', Object.keys(mod));
      throw new Error('TooltipProvider export missing');
    }
    return { default: mod.TooltipProvider };
  }).catch(err => {
    console.error('❌ Failed to load tooltip module:', err);
    throw err;
  })
);

const LazyToaster = React.lazy(() =>
  import('./ui/toaster').then(mod => {
    console.log('✅ Toaster module loaded:', Object.keys(mod));
    // Ensure we have the Toaster component
    if (!mod.Toaster) {
      console.error('❌ Toaster not found in toaster module. Available exports:', Object.keys(mod));
      throw new Error('Toaster export missing');
    }
    return { default: mod.Toaster };
  }).catch(err => {
    console.error('❌ Failed to load toaster module:', err);
    throw err;
  })
);

const StackAuthProvider = React.lazy(() =>
  import('./providers/StackAuthProvider').then(mod => {
    console.log('✅ StackAuthProvider module loaded:', Object.keys(mod));
    // Ensure we have the default export
    if (!mod.default) {
      console.error('❌ StackAuthProvider default export not found. Available exports:', Object.keys(mod));
      throw new Error('StackAuthProvider default export missing');
    }
    return { default: mod.default };
  }).catch(err => {
    console.error('❌ Failed to load StackAuthProvider module:', err);
    throw err;
  })
);

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

  // ✅ FIX #7: For public routes, skip Stack Auth initialization
  // Flatten Suspense hierarchy - single Suspense boundary at top level
  if (isPublic) {
    return (
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
    );
  }

  // ✅ FIX #8: For protected/auth routes, include Stack Auth
  // Flatten Suspense hierarchy - remove nested Suspense boundaries
  return (
    <ErrorBoundary>
      <QueryClientProvider client={getQueryClient()}>
        <Suspense fallback={<PageLoader />}>
          <StackAuthProvider>
            <LazyTooltipProvider>
              <ErrorBoundary>
                {children}
                <LazyToaster />
              </ErrorBoundary>
            </LazyTooltipProvider>
          </StackAuthProvider>
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}