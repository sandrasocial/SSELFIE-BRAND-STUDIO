import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess, setNoCacheHeaders } from '../_utils/response-helpers';
import { getQueryParam } from '../_utils/request-helpers';

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
      const limit = parseInt(getQueryParam(req, 'limit') || '20');
      const type = getQueryParam(req, 'type');
      const priority = getQueryParam(req, 'priority');

      // Mock insights data
      const insights = [
        {
          id: 'insight_1',
          agentName: 'GenerationAgent',
          insightType: 'operational',
          title: 'High Generation Volume',
          message: 'System is processing 150+ image generations per hour',
          priority: 'high',
          timestamp: new Date().toISOString(),
          isRead: false
        },
        {
          id: 'insight_2',
          agentName: 'StorageAgent',
          insightType: 'technical',
          title: 'Storage Optimization',
          message: 'Recommend archiving images older than 90 days',
          priority: 'medium',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ];

      return sendSuccess(res, { insights: insights.slice(0, limit) });
    } catch (error) {
      console.error('❌ Agent insights error:', error);
      return sendError(res, 'Failed to fetch agent insights', 500);
    }
  });
}

