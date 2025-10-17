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

      // TODO: Fetch user's websites from database
      const websites = [
        {
          id: 'website_1',
          name: 'My Portfolio',
          url: 'https://myportfolio.com',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];

      return sendSuccess(res, { websites });
    } catch (error) {
      console.error('❌ Websites list error:', error);
      return sendError(res, 'Failed to fetch websites', 500);
    }
  });
}

