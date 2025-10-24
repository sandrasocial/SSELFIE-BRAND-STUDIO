/**
 * GET /api/maya/chat-history - Pure Serverless
 * 
 * Returns all messages from user's most recent Maya chat.
 * No chatId required - automatically gets latest chat.
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

    // Get database user
    const dbUser = user; // getUserFromRequest already returns database user

    // 🔥 FIX: Use stackAuthId for database queries to fix user ID mismatch
    const queryUserId = dbUser.stackAuthId || dbUser.id;

    // Get chatId from query param OR get user's latest chat
    let chatId = getQueryParam(req, 'chatId');

    if (!chatId) {
      // No chatId provided - get user's most recent chat
      const userChats = await storage.getMayaChats(queryUserId);
      
      if (userChats.length === 0) {
        // No chats yet - return empty array
        console.log(`📭 No Maya chats found for user ${queryUserId}`);
        setNoCacheHeaders(res);
        return res.status(200).json({
          success: true,
          messages: []
        });
      }

      // Use most recent chat
      chatId = userChats[0].id.toString();
      console.log(`💬 Using latest chat ${chatId} for user ${queryUserId}`);
    }

    // Get messages for the chat
    const messages = await storage.getMayaChatMessages(chatId, dbUser.id);
    
    console.log(`📋 Returning ${messages.length} messages from chat ${chatId}`);

    setNoCacheHeaders(res);
    return res.status(200).json({
      success: true,
      messages,
      chatId // Include chatId in response for client reference
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/chat-history:', error);
    return sendError(res, error instanceof Error ? error.message : 'Failed to fetch chat history', 500);
  }
}
