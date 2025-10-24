/**
 * Vercel Serverless Function - /api/user-model
 * Pure serverless endpoint for user model training status
 * ✅ FIXED: Now wrapped with withAuth middleware to properly attach user to request
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../api/_middleware/auth.js';
import type { AuthenticatedRequest } from '../api/_shared/auth-types.js';
import handler from '../server/api/training/user-model.js';

export default async function userModelHandler(req: VercelRequest, res: VercelResponse) {
  // Wrap handler with authentication middleware
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    return handler(req, res);
  });
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};
