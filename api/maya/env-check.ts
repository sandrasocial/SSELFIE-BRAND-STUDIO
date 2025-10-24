/**
 * Vercel Serverless Function - /api/maya/env-check
 * Pattern 1: Entry point with withAuth middleware wrapper
 * 
 * Check Maya environment configuration (API keys, etc.)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth.js';
import type { AuthenticatedRequest } from '../_shared/auth-types.js';
import handler from '../../server/api/maya/env-check.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
  memory: 3008
};

export default async function envCheckHandler(req: VercelRequest, res: VercelResponse) {
  // Wrap handler with authentication middleware
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    return handler(req, res);
  });
}

