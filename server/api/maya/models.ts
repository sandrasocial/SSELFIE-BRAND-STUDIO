/**
 * GET /api/maya/models - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export const config = { runtime: 'nodejs', maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    if (req.method !== 'GET') {
      return sendMethodNotAllowed(res, ['GET']);
    }

    try {
      const user = req.user;
      if (!user) return sendUnauthorized(res);

    setNoCacheHeaders(res);
    return res.status(200).json({
      models: ['flux-dev', 'flux-schnell'],
      default: 'flux-dev'
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/models:', error);
    return res.status(500).json({ error: 'Failed to fetch models' });
  }
  });
}
