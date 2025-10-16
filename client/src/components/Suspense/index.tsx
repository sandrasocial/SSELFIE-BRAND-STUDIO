import React, { 
  type ComponentType,
  type ReactElement,
  type ReactNode,
  type PropsWithChildren,
  type FunctionComponent,
  lazy
} from 'react';

const PageLoader = React.memo(() => React.createElement('div', null, 'Loading...'));

// React 19 compatible types
type SuspenseProps = {
  children?: ReactNode;
  fallback: NonNullable<ReactNode>;
};

type Component<P> = {
  (props: P): ReactElement | null;
  displayName?: string;
};

// Create a type-safe wrapper for lazy components
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  displayName?: string
): FunctionComponent<P> => {
  // Create the lazy component
  const LazyComponent = lazy(importFn);
  
  // Create the wrapper component
  const WrappedComponent: FunctionComponent<P> = React.memo((props: P) => {
    return React.createElement(
      React.Suspense as unknown as ComponentType<SuspenseProps>,
      { fallback: React.createElement(PageLoader) },
      React.createElement(LazyComponent, props)
    );
  });

  // Set display name
  WrappedComponent.displayName = displayName || 'LazyComponent';
  
  return WrappedComponent;
};