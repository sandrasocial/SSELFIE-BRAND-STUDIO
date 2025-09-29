/**
 * Global type definitions for server-side TypeScript compilation
 * Addresses missing module declarations and node global types
 */

// Node.js global types
declare global {
  var process: {
    env: Record<string, string | undefined>;
  };
  
  var Buffer: {
    from(data: any, encoding?: string): any;
    alloc(size: number): any;
    isBuffer(obj: any): boolean;
  };
  
  var console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  };

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
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
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
    run(model: string, options: { input: any }): Promise<any>;
    predictions: {
      create: (options: { version: string; input: any }) => Promise<any>;
      get: (id: string) => Promise<any>;
    };
  }
}

// Drizzle ORM module declarations
declare module 'drizzle-orm/neon-http' {
  export function drizzle(client: any, config?: any): any;
  export * from 'drizzle-orm';
}

declare module '@neondatabase/serverless' {
  export function neon(connectionString: string): any;
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    fields: any[];
  }
}

declare module 'drizzle-orm' {
  export function eq(column: any, value: any): any;
  export function and(...conditions: any[]): any;
  export function desc(column: any): any;
  export function asc(column: any): any;
  export function gte(column: any, value: any): any;
  export function lte(column: any, value: any): any;
  export function sql(template: TemplateStringsArray, ...values: any[]): any;
  export function relations(table: any, callback: (helpers: any) => any): any;
}

declare module 'drizzle-orm/pg-core' {
  export function pgTable(name: string, columns: any): any;
  export function text(name?: string): any;
  export function varchar(name: string, config?: { length: number }): any;
  export function timestamp(name: string, config?: any): any;
  export function jsonb(name: string): any;
  export function integer(name: string): any;
  export function boolean(name: string): any;
  export function uuid(name: string): any;
  export function serial(name: string): any;
  export function index(name: string): any;
  export function primaryKey(...columns: any[]): any;
  export function unique(...columns: any[]): any;
  export function decimal(name: string): any;
}

declare module 'drizzle-zod' {
  export function createInsertSchema(table: any, refinements?: any): any;
  export function createSelectSchema(table: any, refinements?: any): any;
}

declare module 'zod' {
  export const z: any;
  export type ZodSchema<T = any> = any;
  export type ZodObject<T = any> = any;
  export type ZodType<T = any> = any;
}

declare module 'ulid' {
  export function ulid(): string;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(algorithm: string): any;
  export function createHmac(algorithm: string, key: string): any;
}

declare module 'dotenv' {
  export function config(options?: any): any;
  const dotenv: {
    config: (options?: any) => any;
  };
  export default dotenv;
}

// Vercel and serverless environment types
declare module '@vercel/node' {
  export interface VercelRequest {
    query: { [key: string]: string | string[] };
    body: any;
    cookies: { [key: string]: string };
    headers: { [key: string]: string };
    method: string;
    url: string;
  }

  export interface VercelResponse {
    status: (code: number) => VercelResponse;
    json: (object: any) => VercelResponse;
    send: (body: any) => VercelResponse;
    setHeader: (name: string, value: string) => VercelResponse;
    end: () => void;
  }
}

declare module 'jose' {
  export interface JWTPayload {
    [key: string]: any;
  }

  export interface JWTVerifyResult {
    payload: JWTPayload;
    protectedHeader: any;
  }

  export function jwtVerify(token: string, secret: any): Promise<JWTVerifyResult>;
  export function createRemoteJWKSet(url: URL): any;
}

declare module 'node-fetch' {
  export interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  export default function fetch(url: string, init?: any): Promise<Response>;
}

export {};