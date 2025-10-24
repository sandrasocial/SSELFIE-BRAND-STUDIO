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

    // 🔥 FIX: Use stackAuthId for database queries to fix user ID mismatch
    const queryUserId = user.stackAuthId || user.id;
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
