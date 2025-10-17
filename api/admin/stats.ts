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

      // TODO: Add admin role check
      // For now, return mock data
      const stats = {
        totalUsers: 1250,
        activeUsers: 890,
        totalRevenue: '€45,230',
        monthlyRevenue: '€8,450',
        subscriptions: {
          free: 450,
          pro: 650,
          enterprise: 150
        },
        features: {
          imagesGenerated: 125000,
          videosGenerated: 8500,
          emailsSent: 450000,
          totalApiCalls: 2500000
        },
        systemHealth: {
          uptime: '99.98%',
          avgResponseTime: '245ms',
          errorRate: '0.02%'
        },
        topFeatures: [
          { name: 'Image Generation', usage: 45 },
          { name: 'Video Generation', usage: 28 },
          { name: 'Email Automation', usage: 18 },
          { name: 'Instagram Integration', usage: 9 }
        ]
      };

      return sendSuccess(res, stats);
    } catch (error) {
      console.error('❌ Admin stats error:', error);
      return sendError(res, 'Failed to fetch admin statistics', 500);
    }
  });
}

