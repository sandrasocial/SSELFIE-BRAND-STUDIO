/**
 * GET /api/maya/status - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { sendMethodNotAllowed, sendUnauthorized, sendError, setNoCacheHeaders } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    if (req.method !== 'GET') {
      return sendMethodNotAllowed(res, ['GET']);
    }

    try {
      const user = req.user;
      if (!user) return sendUnauthorized(res);

    // 🔥 FIX: Use stackAuthId for database queries to fix user ID mismatch
    // When existing users sign in with Stack Auth, their primary ID may differ from stackAuthId
    // We use stackAuthId for queries to ensure we get the correct user data
    const queryUserId = user.stackAuthId || user.id;
    const userModel = await storage.getUserModelByUserId(queryUserId);
    const dbUser = user; // getUserFromRequest already returns database user
    
    if (!userModel) {
      setNoCacheHeaders(res);
      return res.status(200).json({
        ready: false,
        message: 'Training required',
        trainingStatus: 'not_started',
        needsTraining: true
      });
    }
    
    const isReady = userModel.trainingStatus === 'completed';
    const canGenerate = isReady && (dbUser?.monthlyGenerationLimit === -1 || (dbUser?.monthlyGenerationLimit || 0) > 0);
    
    setNoCacheHeaders(res);
    return res.status(200).json({
      ready: isReady,
      canGenerate,
      trainingStatus: userModel.trainingStatus,
      modelVersionId: userModel.replicateVersionId,
      generationsRemaining: dbUser?.monthlyGenerationLimit || 0,
      message: isReady ? 'Maya AI is ready!' : 'Training in progress...'
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/status:', error);
    return sendError(res, 'Failed to check Maya status', 500);
  }
  });
}
