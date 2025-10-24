/**
 * Vercel Serverless Function - /api/profile
 * Pattern 1: Entry point with withAuth middleware wrapper
 * 
 * Get public profile information for the authenticated user.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';
import handler from '../server/api/profile.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
  memory: 3008
};

export default async function profileHandler(req: VercelRequest, res: VercelResponse) {
  // Wrap handler with authentication middleware
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    return handler(req, res);
  });
}

