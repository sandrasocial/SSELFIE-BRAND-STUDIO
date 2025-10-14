/**
 * POST /api/maya/chat - Maya AI with PersonalityManager
 * Uses existing mayaChatMessages table (NOT conversations/messages)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { getRequestBody } from '../../_utils/request-helpers.js';
import { sendSuccess, sendUnauthorized, sendBadRequest, sendMethodNotAllowed, sendError } from '../../_utils/response-helpers.js';

import { mayaService } from '../../services/maya-service.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendUnauthorized(res);
    }

    const { message, chatHistory = [], conversationId } = getRequestBody(req);
    if (!message) {
      return sendBadRequest(res, 'Message is required');
    }

    console.log(`💬 MAYA CHAT: User ${user.id} - "${message.substring(0, 50)}..."`);

    // Use MayaService for full pipeline (creative looks, prompt, concept cards, storage)
    const mayaResult = await mayaService.processChat(user.stackAuthId || user.id, {
      message,
      history: chatHistory.map((entry: any) => ({
        user: entry.role === 'user' ? entry.content : undefined,
        maya: (entry.role === 'assistant' || entry.role === 'maya') ? entry.content : undefined
      })),
      conversationId
    });

    // Return data directly (frontend expects unwrapped response)
    res.status(200).json({
      response: mayaResult.response,
      conceptCards: mayaResult.conceptCards,
      chatId: mayaResult.conversationId
    });

  } catch (error) {
    console.error('❌ Error in /api/maya/chat:', error);
    return sendError(res, error instanceof Error ? error.message : 'Failed to process chat', 500);
  }
}
