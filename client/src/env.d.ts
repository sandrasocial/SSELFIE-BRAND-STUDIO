/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string | boolean | undefined>> {
  readonly VITE_STACK_PROJECT_ID: string;
  readonly VITE_STACK_PUBLISHABLE_CLIENT_KEY: string;
  readonly VITE_NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_BASE?: string;
}
