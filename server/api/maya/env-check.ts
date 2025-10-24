/**
 * GET /api/maya/env-check - Pure Serverless
 *
 * ✅ PATTERN 1: Accepts middleware-attached user from withAuth wrapper
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export const config = { runtime: 'nodejs', maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    // ✅ PATTERN 1: User already attached by withAuth middleware
    // Fallback to getUserFromRequest for legacy compatibility
    let user = (req as any).user;

    if (!user) {
      console.log('⚠️ No user attached to request, attempting getUserFromRequest fallback');
      user = await getUserFromRequest(req);
    }

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
}
