import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getQueryParam } from '../_utils/request-helpers';
import { SDInpaintService } from '../../server/services/inpaint/sd_inpaint';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User ID not found', 401);
      }

      const predictionId = getQueryParam(req, 'predictionId');
      const variantId = getQueryParam(req, 'variantId');

      if (!predictionId) {
        return sendError(res, 'predictionId query parameter is required', 400);
      }

      if (!variantId) {
        return sendError(res, 'variantId query parameter is required', 400);
      }

      const result = await SDInpaintService.checkInpaintStatus(predictionId, parseInt(variantId));

      return sendSuccess(res, result);
    } catch (error) {
      console.error('❌ Inpaint status error:', error);
      return sendError(res, 'Failed to check inpaint status', 500);
    }
  });
}

