import type { ComponentType, ReactNode, ReactElement, ErrorInfo } from 'react';

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