/// <reference types="react" />
import type { Router } from 'express';

// ============================================================================
// GLOBAL MODULE DECLARATIONS
// ============================================================================

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

// ============================================================================
// WINDOW INTERFACE EXTENSIONS
// ============================================================================

interface Window {
  React: typeof import('react');
  ReactDOM: typeof import('react-dom');
  __REACT_INIT_TIME__: number;
  __REACT_INIT_STATUS__: string;
}

// ============================================================================
// HTML ELEMENT EXTENSIONS
// ============================================================================

declare global {
  interface Error {
    code?: string;
    statusCode?: number;
    response?: any;
  }

  interface HTMLElement {
    textContent: string;
    style: CSSStyleDeclaration;
  }

  interface Element {
    textContent: string;
  }

  interface HTMLLinkElement extends HTMLElement {
    rel: string;
    as: string;
    href: string;
  }

  // ============================================================================
  // JSX NAMESPACE EXTENSIONS
  // ============================================================================

  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes extends React.Attributes {}
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  // ============================================================================
  // EXPRESS NAMESPACE EXTENSIONS
  // ============================================================================

  namespace Express {
    interface Router extends Router {}
  }
}

export {};

