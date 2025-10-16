import React, { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "./ErrorBoundary";
import { queryClient } from "../lib/queryClient";
import PageLoader from './PageLoader';

// Lazy load providers
const LazyTooltipProvider = React.lazy(() => import('./ui/tooltip').then(mod => ({ default: mod.TooltipProvider })));
const LazyToaster = React.lazy(() => import('./ui/toaster').then(mod => ({ default: mod.Toaster })));
const StackAuthProvider = React.lazy(() => import('./providers/StackAuthProvider').then(mod => ({ default: mod.default })));

interface RootWrapperProps {
  children: React.ReactNode;
}

export default function RootWrapper({ children }: RootWrapperProps) {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
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