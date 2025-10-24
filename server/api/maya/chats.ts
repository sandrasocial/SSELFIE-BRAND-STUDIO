/**
 * GET /api/maya-chats - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    // 🔥 CRITICAL FIX: Use user.id for database queries
    // - For OLD users (pre-Stack Auth): id is the original numeric ID where data was created
    // - For NEW users (Stack Auth): id is already the Stack Auth ID
    // - stackAuthId is only used for linking old users to Stack Auth, NOT for queries
    const queryUserId = user.id;
    const chats = await storage.getMayaChats(queryUserId);

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
