/**
 * Authentication helper utilities for Vercel serverless functions
 */

import type { VercelRequest } from '@vercel/node';
import type { StackAuthUser } from '../_shared/auth-types.js';
import { getHeader } from './request-helpers.js';

export function getUserFromRequest(req: VercelRequest): StackAuthUser | null {
  const authHeader = getHeader(req, 'authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // In production, validate the token and extract user info
  // For now, return a placeholder
  return {
    id: 'user-id',
    email: 'user@example.com',
  };
}

export function getAuthToken(req: VercelRequest): string | null {
  const authHeader = getHeader(req, 'authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

export function isAuthenticated(req: VercelRequest): boolean {
  return !!getAuthToken(req);
}

