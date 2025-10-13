/**
 * GET /api/maya-chats - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers';
import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers';
import { storage } from '../../storage';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    const chats = await storage.getMayaChats(user.id);

    setNoCacheHeaders(res);
    return res.status(200).json({
      success: true,
      chats
    });

  } catch (error) {
    console.error('[ERROR] /api/maya-chats:', error);
    return sendError(res, 'Failed to fetch chats', 500);
  }
}
