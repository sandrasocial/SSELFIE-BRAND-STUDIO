/**
 * Vercel Serverless Function - /api/auth/user
 * Pattern 1: Entry point with withAuth middleware wrapper
 * 
 * Get current authenticated user information.
 * Auto-creates user in database if they exist in Stack Auth but not in DB.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth.js';
import type { AuthenticatedRequest } from '../_shared/auth-types.js';
import handler from '../../server/api/auth/user.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
  memory: 3008
};

export default async function userHandler(req: VercelRequest, res: VercelResponse) {
  // Wrap handler with authentication middleware
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    return handler(req, res);
  });
}

