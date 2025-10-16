import { 
  ComponentType, 
  PropsWithChildren,
  ReactElement,
  ReactNode,
  LazyExoticComponent
} from 'react';

declare module 'react' {
  interface ReactPortal {
    children?: ReactNode;
    $$typeof: symbol | number;
  }

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: PropsWithChildren<P>;
    key: string | number | null;
    $$typeof: symbol | number;
  }

  interface LazyExoticComponent<T extends ComponentType<any>> {
    (props: ComponentPropsWithRef<T>): ReactElement | null;
    $$typeof: symbol | number;
  }

  interface SuspenseProps {
    children?: ReactNode;
    fallback?: ReactNode;
    $$typeof: symbol | number;
  }

  // Patch types for React 19
  namespace JSX {
    interface Element extends ReactElement<any, any> { 
      $$typeof: symbol | number;
    }
  }
}

// Utility types for components
export type AsyncComponent<P = {}> = React.ComponentType<PropsWithChildren<P>>;
export type LazyComponent<P = {}> = LazyExoticComponent<ComponentType<P>>;

// Type helper for component factory
export type ComponentFactory = <P>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  name?: string
) => AsyncComponent<P>;