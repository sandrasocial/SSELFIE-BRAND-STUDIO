/**
 * GET /api/training/status - Pure Serverless Implementation
 * 
 * Returns current user's training status and progress.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendSuccess, sendUnauthorized, sendMethodNotAllowed, sendError, setNoCacheHeaders } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 25 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendUnauthorized(res);
    }

    // 🔥 CRITICAL FIX: Use user.id for database queries
    // - For OLD users (pre-Stack Auth): id is the original numeric ID where data was created
    // - For NEW users (Stack Auth): id is already the Stack Auth ID
    // - stackAuthId is only used for linking old users to Stack Auth, NOT for queries
    const queryUserId = user.id;

    const model = await storage.getUserModelByUserId(queryUserId);
    const status = model?.trainingStatus || 'not_started';
    const progress = model?.trainingProgress || (status === 'completed' ? 100 : 0);

    const trackers = await storage.getUserGenerationTrackers(queryUserId);
    const predictionId = trackers?.[0]?.predictionId || null;

    setNoCacheHeaders(res);
    return sendSuccess(res, { status, progress, predictionId, model });

  } catch (error) {
    console.error('❌ Error in /api/training/status:', error);
    return sendError(res, 'Failed to retrieve training status', 500);
  }
}
