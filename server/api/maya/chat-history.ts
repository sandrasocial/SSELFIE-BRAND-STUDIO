/**
 * GET /api/maya/chat-history - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';
import { getQueryParam } from '../../_utils/request-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, ['GET']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    const chatId = getQueryParam(req, 'chatId');
    if (!chatId) {
      return sendError(res, 'chatId query parameter required', 400);
    }

    const messages = await storage.getMayaChatMessages(chatId, user.id);

    setNoCacheHeaders(res);
    return res.status(200).json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/chat-history:', error);
    return sendError(res, 'Failed to fetch chat history', 500);
  }
}
