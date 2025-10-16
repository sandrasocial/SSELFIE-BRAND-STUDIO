import * as React from 'react';
import type { Router } from 'express';

declare module 'react' {
  export interface SuspenseProps {
    children?: React.ReactNode;
    fallback: React.ReactNode;
  }

  export interface ComponentProps<T> {
    children?: React.ReactNode;
    [key: string]: any;
  }

  export type ForwardRefRenderFunction<T, P = {}> = {
    (props: P, ref: React.Ref<T>): React.ReactElement | null;
    displayName?: string;
    defaultProps?: never;
    propTypes?: never;
  }

  export interface ForwardRefExoticComponent<P> {
    (props: P): React.ReactElement | null;
    displayName?: string;
    defaultProps?: never;
    propTypes?: never;
  }
}

declare module '@stackframe/react' {
  export interface StackClientApp {
    setUserId(id: string): void;
    getUserId(): string | null;
    clearUserId(): void;
    [key: string]: any;
  }
}

declare module '@vitejs/plugin-react' {
  const plugin: () => any;
  export default plugin;
}

declare module 'tailwindcss' {
  const plugin: () => any;
  export default plugin;
}

declare module 'autoprefixer' {
  const plugin: () => any;
  export default plugin;
}

declare global {
  interface Error {
    code?: string;
    statusCode?: number;
    response?: any;
  }

  namespace Express {
    interface Router extends Router {}
  }
}

export {};