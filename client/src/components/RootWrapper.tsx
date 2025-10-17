import React, { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "./ErrorBoundary";
import { getQueryClient } from "../lib/queryClient";
import PageLoader from './PageLoader';

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
  // ✅ CRITICAL FIX: ALWAYS include StackAuthProvider - never unmount it
  // This prevents Suspense re-triggering when route changes
  // StackAuthProvider handles auth for ALL routes (public and protected)

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}