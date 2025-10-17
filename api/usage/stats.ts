import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess, setNoCacheHeaders } from '../_utils/response-helpers';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  setNoCacheHeaders(res);

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User ID not found', 401);
      }

      // TODO: Fetch real usage stats from database
      const usageStats = {
        userId,
        period: 'current_month',
        usage: {
          imagesGenerated: 45,
          videosGenerated: 12,
          emailsSent: 234,
          storageUsed: '2.3 GB',
          apiCallsUsed: 1250
        },
        limits: {
          imagesLimit: 100,
          videosLimit: 25,
          emailsLimit: 500,
          storageLimit: '10 GB',
          apiCallsLimit: 5000
        },
        percentageUsed: {
          images: 45,
          videos: 48,
          emails: 47,
          storage: 23,
          apiCalls: 25
        },
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      return sendSuccess(res, usageStats);
    } catch (error) {
      console.error('❌ Usage stats error:', error);
      return sendError(res, 'Failed to fetch usage statistics', 500);
    }
  });
}

