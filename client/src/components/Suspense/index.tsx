import React, {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  type PropsWithChildren,
  type FunctionComponent,
  lazy
} from 'react';

// React 19 compatible types
type SuspenseProps = {
  children?: ReactNode;
  fallback: NonNullable<ReactNode>;
};

type Component<P> = {
  (props: P): ReactElement | null;
  displayName?: string;
};

// ✅ CRITICAL FIX: createLazyComponent should NOT wrap in Suspense
// Suspense wrapping happens at the route level in App.tsx
// This prevents duplicate loading screens
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  displayName?: string
): FunctionComponent<P> => {
  // Create the lazy component
  const LazyComponent = lazy(importFn);

  // Return the lazy component directly WITHOUT Suspense wrapper
  // The route will handle Suspense wrapping
  const WrappedComponent: FunctionComponent<P> = React.memo((props: P) => {
    return React.createElement(LazyComponent, props);
  });

  // Set display name
  WrappedComponent.displayName = displayName || 'LazyComponent';

  return WrappedComponent;
};