import type { Router } from 'express';

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