import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess, setNoCacheHeaders } from '../_utils/response-helpers';
import { db } from '../../server/drizzle';
import { conceptCards } from '../../shared/schema';
import { eq } from 'drizzle-orm';

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

      const cards = await db
        .select()
        .from(conceptCards)
        .where(eq(conceptCards.userId, userId));

      return sendSuccess(res, {
        cards,
        count: cards.length
      });
    } catch (error) {
      console.error('❌ Concept cards list error:', error);
      return sendError(res, 'Failed to fetch concept cards', 500);
    }
  });
}

