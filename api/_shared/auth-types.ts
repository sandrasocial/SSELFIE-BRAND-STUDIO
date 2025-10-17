/**
 * Authentication type definitions for Vercel serverless functions
 */

import type { VercelRequest } from '@vercel/node';

export interface StackAuthUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends VercelRequest {
  user?: StackAuthUser;
}

