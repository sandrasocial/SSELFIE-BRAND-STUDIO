/**
 * GET /api/training-progress/:userId - Pure Serverless Implementation
 * 
 * Returns training progress for specific user (auth user only).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendSuccess, sendUnauthorized, sendForbidden, sendMethodNotAllowed, sendError } from '../../_utils/response-helpers.js';
import { extractUserIdFromPath } from '../../_utils/request-helpers.js';
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

    const targetUserId = extractUserIdFromPath(req.url || '');
    if (!targetUserId) {
      return sendError(res, 'User ID required', 400);
    }

    // Ensure user can only access their own progress
    if (user.id !== targetUserId) {
      return sendForbidden(res, 'You can only access your own training progress');
    }

    const model = await storage.getUserModelByUserId(targetUserId);
    const progress = model?.trainingProgress || (model?.trainingStatus === 'completed' ? 100 : 0);

    return sendSuccess(res, { progress });

  } catch (error) {
    console.error('❌ Error in /api/training-progress:', error);
    return sendError(res, 'Failed to retrieve training progress', 500);
  }
}
