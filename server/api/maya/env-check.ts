/**
 * GET /api/maya/env-check - Pure Serverless
 *
 * ✅ PATTERN 1: Accepts middleware-attached user from withAuth wrapper
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

      const anthropicKeySet = !!process.env['ANTHROPIC_API_KEY'];
      const replicateTokenSet = !!process.env['REPLICATE_API_TOKEN'];
      
      setNoCacheHeaders(res);
      return res.status(200).json({
        anthropic: anthropicKeySet,
        replicate: replicateTokenSet,
        status: (anthropicKeySet && replicateTokenSet) ? 'ready' : 'incomplete'
      });

    } catch (error) {
      console.error('[ERROR] /api/maya/env-check:', error);
      return res.status(500).json({ error: 'Failed to check environment' });
    }
  });
}
