/**
 * GET /api/video/status - Check video generation status
 * Returns status of a video generation job
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, setNoCacheHeaders } from '../_utils/response-helpers';
import { getVeo3Status } from '../../server/services/video/veo3';
import { getQueryParam } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const jobId = getQueryParam(req, 'jobId');
      if (!jobId) {
        return sendError(res, 'jobId query parameter is required', 400);
      }

      // Get video status
      const status = await getVeo3Status(jobId, userId);

      setNoCacheHeaders(res);
      return res.status(200).json(status);
    } catch (error: unknown) {
      console.error('[ERROR] /api/video/status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return sendError(res, `Failed to check video status: ${errorMessage}`, 500);
    }
  });
}

