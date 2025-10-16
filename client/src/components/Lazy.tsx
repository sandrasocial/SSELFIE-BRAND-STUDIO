import * as React from 'react';
import type { FC, ReactNode, ComponentProps } from 'react';
import { Suspense } from '../lib/react-hooks';
import { PageLoader } from './loaders';

const DefaultFallback = React.memo(function DefaultFallback() {
  return React.createElement(PageLoader);
});

interface LazyProps extends ComponentProps<'div'> {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * A reusable component that wraps lazy-loaded components with Suspense boundary
 * and provides consistent loading fallback using PageLoader.
 */
const Lazy: FC<LazyProps> = React.memo(function Lazy({ children, fallback, ...props }: LazyProps) {
  const fallbackElement = React.useMemo(() => fallback ?? React.createElement(DefaultFallback), [fallback]);
  
  return (
    <div {...props}>
      <Suspense fallback={fallbackElement}>
        {children}
      </Suspense>
    </div>
  );
});

Lazy.displayName = 'Lazy';

export { Lazy };
export default Lazy;