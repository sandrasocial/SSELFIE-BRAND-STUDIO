/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="@vercel/node" />

interface ImportMetaEnv {
  readonly VITE_STACK_PROJECT_ID: string;
  readonly VITE_STACK_PUBLISHABLE_CLIENT_KEY: string;
  readonly VITE_APP_BASE_URL: string;
  readonly LEVELPARTNER_API_KEY: string;
  readonly LEVELPARTNER_API_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  // Add other env vars as needed
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept: (callback?: () => void) => void;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_STACK_PROJECT_ID: string;
    VITE_STACK_PUBLISHABLE_CLIENT_KEY: string;
    LEVELPARTNER_API_KEY: string;
    LEVELPARTNER_API_URL: string;
    // Add other env vars as needed
    [key: string]: string | undefined;
  }
}