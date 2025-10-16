import type { ReactElement, ReactNode } from 'react';

declare module 'react' {
  // Core React 19 Types
  export type Component<P = {}, S = {}> = {
    (props: P & { children?: ReactNode }, context?: any): ReactElement | Promise<ReactElement> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  };

  // Forward Ref Types
  export interface ForwardRefRenderFunction<T, P = {}> {
    (props: P, ref: React.Ref<T>): ReactElement | Promise<ReactElement> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }

  // Specific React 19 Component Types
  export type FunctionComponent<P = {}> = {
    (props: P & { children?: ReactNode }, context?: any): ReactElement | Promise<ReactElement> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  };

  export type FC<P = {}> = FunctionComponent<P>;

  // Lazy Loading Types
  export interface LazyExoticComponent<T extends React.ComponentType<any>> {
    (props: React.ComponentProps<T>): ReactElement | Promise<ReactElement> | null;
    _payload: { _status: -1 | 0 | 1 | 2; _result: T };
    _init: () => T;
  }

  // Suspense Types
  export interface SuspenseProps {
    children?: ReactNode;
    fallback: ReactNode | null;
  }
}

// Patch missing Event Types
declare global {
  namespace JSX {
    interface DOMAttributes<T> {
      onClick?: (event: React.MouseEvent<T, MouseEvent>) => void;
      onMouseEnter?: (event: React.MouseEvent<T, MouseEvent>) => void;
      onMouseLeave?: (event: React.MouseEvent<T, MouseEvent>) => void;
    }
  }
}