import React, { Suspense } from 'react';
import { PageLoader } from './PageLoader';

interface LazyProps {
  children: React.ReactNode;
}

/**
 * A reusable component that wraps lazy-loaded components with Suspense boundary
 * and provides consistent loading fallback using PageLoader.
 */
export function Lazy({ children }: LazyProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}