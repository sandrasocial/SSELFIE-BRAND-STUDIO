/**
 * Type definitions for authentication middleware
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthenticatedUser } from './auth-types.js';

/** Request with authenticated user */
export type AuthenticatedRequest = VercelRequest & {
  user: AuthenticatedUser;
  cookies: Record<string, string>;
  query: { [key: string]: string | string[] };
  body: any;
}

/** Request handler that requires authentication */
export type AuthenticatedHandler<T> = (req: AuthenticatedRequest, res: VercelResponse) => Promise<T>;

/** Request handler that may optionally have authentication */
export type OptionalAuthHandler<T> = (req: VercelRequest & { user?: AuthenticatedUser }, res: VercelResponse) => Promise<T>;

/** Options for authentication middleware */
export interface AuthOptions {
  /** Whether to allow requests without authentication */
  optional?: boolean;
  /** Whether to bypass authentication (for cron jobs etc) */
  bypass?: boolean;
}

/** Authenticated response data shape */
export interface AuthResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}