import type { 
  ComponentType, 
  ReactNode, 
  ReactElement, 
  ErrorInfo, 
  WeakValidationMap, 
  ValidationMap,
  ComponentPropsWithRef,
  PropsWithChildren
} from 'react';

// Basic Component Interface
export interface ComponentInterface<P = {}, S = {}> {
  props: Readonly<P>;
  state: Readonly<S>;
  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
    callback?: () => void
  ): void;
  forceUpdate(callback?: () => void): void;
  render(): ReactNode;
  context: any;
  refs: {
    [key: string]: ReactElement | Element | null | undefined;
  };
}

// React 19 Function Component Types
declare module 'react' {
  interface FunctionComponent<P = {}> {
    (props: PropsWithChildren<P>, context?: any): ReactElement | Promise<ReactElement> | null;
    propTypes?: WeakValidationMap<P> | undefined;
    contextTypes?: ValidationMap<any> | undefined;
    defaultProps?: Partial<P> | undefined;
    displayName?: string | undefined;
  }

  type FC<P = {}> = FunctionComponent<P>;

  // Lazy Component Types
  interface LazyExoticComponent<T extends ComponentType<any>> {
    (props: ComponentPropsWithRef<T>): ReactElement | Promise<ReactElement> | null;
    readonly _payload: { _status: -1 | 0 | 1 | 2; _result: T };
    readonly _init: () => T;
  }
}

// Error Boundary Types
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export type ComponentWithError<P = {}, S = {}> = ComponentInterface<P, S> & {
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
  static getDerivedStateFromError?(error: Error): Partial<S>;
};

export type ExtendedComponentType<P = {}> = ComponentType<P> & {
  defaultProps?: Partial<P>;
  displayName?: string;
};