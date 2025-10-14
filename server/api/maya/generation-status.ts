/**
 * GET /api/maya/generation-status - Check generation status by prediction ID
 * Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    const { predictionId } = req.query;

    if (!predictionId || typeof predictionId !== 'string') {
      return sendError(res, 'predictionId query parameter is required', 400);
    }

    const { mayaService } = await import('../../services/maya-service.js');

    const status = await mayaService.getGenerationStatus(user.id, predictionId);

    setNoCacheHeaders(res);
    return res.status(200).json(status);

  } catch (error) {
    console.error('[ERROR] /api/maya/generation-status:', error);
    return sendError(res, 'Failed to check generation status', 500);
  }
}