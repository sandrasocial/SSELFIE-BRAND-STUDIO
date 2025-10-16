import React from 'react';
import { PageLoader } from './loaders';
import { type LazyComponent } from '../types/react-types';

/**
 * A type-safe wrapper for lazy loaded components in React 19
 */
export const LazyWrapper = React.memo(function LazyWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <React.Suspense fallback={<PageLoader />}>
      {children}
    </React.Suspense>
  );
});