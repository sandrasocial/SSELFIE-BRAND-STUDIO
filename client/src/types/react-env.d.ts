/// <reference types="react/experimental" />

declare namespace React {
  // Properly declare experimental async component types
  export interface AsyncComponent<P = {}> {
    (props: P): Promise<ReactElement> | ReactElement;
    displayName?: string;
  }

  // Extend FunctionComponent to support both sync and async
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement | Promise<ReactElement> | null;
    displayName?: string;
  }

  // Update ComponentType for proper alignment
  export type ComponentType<P = any> = FunctionComponent<P> | ComponentClass<P>;

  // Support for experimental Suspense
  export interface SuspenseProps {
    children?: ReactNode;
    fallback?: ReactNode;
  }

  // LazyExoticComponent fixes
  export interface LazyExoticComponent<T extends ComponentType<any>> {
    (props: ComponentProps<T>): ReactElement | Promise<ReactElement>;
    _payload: { _status: number; _result: T };
    _init: () => T;
  }
}

declare module "react" {
  export * from "react/experimental";
}