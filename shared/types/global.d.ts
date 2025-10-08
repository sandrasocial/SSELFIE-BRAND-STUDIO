/**
 * Global type definitions for server-side TypeScript compilation
 * Addresses missing module declarations and node global types
 */

// Node.js global types
declare global {
  var require: (module: string) => unknown;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      DATABASE_URL?: string;
      STACK_SECRET_SERVER_KEY?: string;
      VITE_STACK_PUBLISHABLE_CLIENT_KEY?: string;
      REPLICATE_API_TOKEN?: string;
      REPLICATE_USERNAME?: string;
      ANTHROPIC_API_KEY?: string;
      GOOGLE_API_KEY?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;
      AWS_S3_BUCKET?: string;
      ADMIN_USER_ID?: string;
      SHANNON_USER_ID?: string;
      FLODESK_API_KEY?: string;
      RESEND_API_KEY?: string;
      INSTAGRAM_BUSINESS_ACCOUNT_ID?: string;
      INSTAGRAM_APP_ID?: string;
      INSTAGRAM_APP_SECRET?: string;
      INSTAGRAM_ACCESS_TOKEN?: string;
      META_BUSINESS_ACCESS_TOKEN?: string;
      FACEBOOK_PAGE_ID?: string;
      FACEBOOK_ACCESS_TOKEN?: string;
      GOOGLE_MERCHANT_ID?: string;
      // GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET removed - Stack Auth handles all OAuth
      GOOGLE_REFRESH_TOKEN?: string;
      SENDGRID_API_KEY?: string;
      STRIPE_SECRET_KEY?: string;
      STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      VEO_API_KEY?: string;
      VEO_PROJECT_ID?: string;
      VEO_REGION?: string;
      VEO3_MODEL?: string;
      VEO_GOOGLE_MODEL?: string;
      STACK_AUTH_PROJECT_ID?: string;
      VITE_STACK_PROJECT_ID?: string;
      LOG_LEVEL?: string;
      npm_package_version?: string;
      MODEL_BASE_PATH?: string;
      TEMP_PATH?: string;
      VERCEL_SKEW_PROTECTION_ENABLED?: string;
      VERCEL_DEPLOYMENT_ID?: string;
    }
  }
}

// Third-party module declarations for AI services
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    getGenerativeModel(config: {
      model: string;
      generationConfig?: {
        maxOutputTokens?: number;
        temperature?: number;
      };
    }): {
      generateContent(prompt: string): Promise<{
        response: Promise<{
          text(): string;
        }>;
      }>;
    };
  }
}

// Replicate API types
declare module 'replicate' {
  export default class Replicate {
    constructor(config: { auth: string });
    run(model: string, options: { input: Record<string, unknown> }): Promise<unknown>;
    predictions: {
      create: (options: { version: string; input: Record<string, unknown> }) => Promise<unknown>;
      get: (id: string) => Promise<unknown>;
    };
  }
}

// ULID types
declare module 'ulid' {
  export function ulid(): string;
}

// Node crypto types
declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(algorithm: string): unknown;
  export function createHmac(algorithm: string, key: string): unknown;
}

// Dotenv types
declare module 'dotenv' {
  export function config(options?: { path?: string; encoding?: string; debug?: boolean; override?: boolean }): { parsed?: Record<string, string>; error?: Error };
  const dotenv: {
    config: (options?: { path?: string; encoding?: string; debug?: boolean; override?: boolean }) => { parsed?: Record<string, string>; error?: Error };
  };
  export default dotenv;
}

// Vercel and serverless environment types
declare module '@vercel/node' {
  export interface VercelRequest {
    query: { [key: string]: string | string[] };
    body: unknown;
    cookies: { [key: string]: string };
    headers: { [key: string]: string };
    method: string;
    url: string;
  }

  export interface VercelResponse {
    status: (code: number) => VercelResponse;
    json: (object: unknown) => VercelResponse;
    send: (body: unknown) => VercelResponse;
    setHeader: (name: string, value: string) => VercelResponse;
    end: () => void;
  }
}

// JOSE types
declare module 'jose' {
  export interface JWTPayload {
    [key: string]: unknown;
  }

  export interface JWTVerifyResult {
    payload: JWTPayload;
    protectedHeader: unknown;
  }

  export function jwtVerify(token: string, secret: unknown): Promise<JWTVerifyResult>;
  export function createRemoteJWKSet(url: URL): unknown;
}

// Node fetch types
declare module 'node-fetch' {
  export interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    json(): Promise<unknown>;
    text(): Promise<string>;
  }

  export default function fetch(url: string, init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  }): Promise<Response>;
}

export {};