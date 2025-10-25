/**
 * GET /api/maya/generation-status - Check generation status by prediction ID
 * Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    if (req.method !== 'GET') {
      return sendMethodNotAllowed(res, ['GET']);
    }

    try {
      const user = req.user;
      if (!user) return sendUnauthorized(res);

      const { predictionId } = req.query;

      if (!predictionId || typeof predictionId !== 'string') {
        return sendError(res, 'predictionId query parameter is required and must be a string', 400);
      }

      if (predictionId.length === 0 || predictionId.length > 100) {
        return sendError(res, 'predictionId must be between 1 and 100 characters', 400);
      }

      const { mayaService } = await import('../../services/maya-service.js');

      const status = await mayaService.getGenerationStatus(user.id, predictionId);

      setNoCacheHeaders(res);
      return res.status(200).json(status);

    } catch (error) {
      console.error('[ERROR] /api/maya/generation-status:', error);
      
      // Enhanced error classification
      const errorMessage = error instanceof Error ? error.message : 'Unknown status check error';
      
      if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
        return sendError(res, 'Generation job not found or invalid', 404);
      }
      
      if (errorMessage.includes('timeout')) {
        return sendError(res, 'Status check timed out. Please try again.', 408);
      }
      
      if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
        return sendError(res, 'Too many status checks. Please wait a moment.', 429);
      }
      
      return sendError(res, 'Failed to check generation status. Please try again.', 500);
    }
  });
}