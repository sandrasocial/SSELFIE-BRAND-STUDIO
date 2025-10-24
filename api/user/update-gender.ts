/**
 * Vercel Serverless Function - /api/user/update-gender
 * Pattern 1: Entry point with withAuth middleware wrapper
 * 
 * Update the gender field for the authenticated user.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth.js';
import type { AuthenticatedRequest } from '../_shared/auth-types.js';
import handler from '../../server/api/user/update-gender.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
  memory: 3008
};

export default async function updateGenderHandler(req: VercelRequest, res: VercelResponse) {
  // Wrap handler with authentication middleware
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    return handler(req, res);
  });
}

