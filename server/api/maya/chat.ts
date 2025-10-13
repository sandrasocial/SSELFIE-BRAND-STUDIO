/**
 * POST /api/maya/chat - Maya AI Complete Intelligence Pipeline
 * Uses MayaService with full production pipeline
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { getRequestBody } from '../../_utils/request-helpers.js';
import { sendSuccess, sendUnauthorized, sendBadRequest, sendMethodNotAllowed, sendError } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';
import { MayaService } from '../../services/maya-service.js';

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

    const stackAuthId = user.stackAuthId || user.id.toString();
    console.log(`💬 MAYA CHAT SERVICE: User ${stackAuthId} - "${message.substring(0, 50)}..."`);

    const mayaService = new MayaService(storage);
    
    const result = await mayaService.processChat(stackAuthId, {
      message,
      history: chatHistory.map((entry: any) => ({
        user: entry.role === 'user' ? entry.content : undefined,
        maya: entry.role === 'assistant' || entry.role === 'maya' ? entry.content : undefined
      })),
      conversationId
    });

    console.log(`✅ MAYA: Response generated with ${result.conceptCards.length} concept cards`);

    return sendSuccess(res, {
      response: result.response,
      conceptCards: result.conceptCards,
      conversationId: result.conversationId
    });

  } catch (error) {
    console.error('❌ Error in /api/maya/chat:', error);
    return sendError(res, error instanceof Error ? error.message : 'Failed to process chat', 500);
  }
}
