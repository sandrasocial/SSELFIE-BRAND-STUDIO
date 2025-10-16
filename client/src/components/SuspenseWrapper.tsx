import React from 'react';
import { PageLoader } from './loaders';
import type { WithChildren } from '../types/react-types';

/**
 * Type-safe wrapper for lazy-loaded components compatible with React 19
 */
export const SuspenseWrapper = React.memo(function SuspenseWrapper({ children }: WithChildren) {
  return (
    <React.Suspense fallback={React.createElement(PageLoader)}>
      {children}
    </React.Suspense>
  );
});