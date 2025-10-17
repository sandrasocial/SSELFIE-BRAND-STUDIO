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
      // For now, return mock data
      const page = parseInt(getQueryParam(req, 'page') || '1');
      const limit = parseInt(getQueryParam(req, 'limit') || '10');

      const users = {
        data: [
          {
            id: 'user_1',
            email: 'user1@example.com',
            name: 'User One',
            plan: 'free',
            createdAt: new Date(),
            status: 'active'
          },
          {
            id: 'user_2',
            email: 'user2@example.com',
            name: 'User Two',
            plan: 'pro',
            createdAt: new Date(),
            status: 'active'
          }
        ],
        pagination: {
          page,
          limit,
          total: 2,
          pages: 1
        }
      };

      return sendSuccess(res, users);
    } catch (error) {
      console.error('❌ Admin users error:', error);
      return sendError(res, 'Failed to fetch users', 500);
    }
  });
}

