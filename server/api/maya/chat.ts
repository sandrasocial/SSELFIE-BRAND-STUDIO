/**
 * POST /api/maya/chat - Maya AI with PersonalityManager
 * Uses existing mayaChatMessages table (NOT conversations/messages)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { getRequestBody } from '../../_utils/request-helpers.js';
import { sendSuccess, sendUnauthorized, sendBadRequest, sendMethodNotAllowed, sendError } from '../../_utils/response-helpers.js';

import { mayaService } from '../../services/maya-service.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };


export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
      return sendMethodNotAllowed(res, ['POST']);
    }

    try {
      const user = req.user;
      if (!user) {
        return sendUnauthorized(res);
      }

    const { message, chatHistory = [], conversationId } = getRequestBody(req);
    if (!message) {
      return sendBadRequest(res, 'Message is required');
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return sendBadRequest(res, 'Message must be a non-empty string');
    }

    if (message.length > 2000) {
      return sendBadRequest(res, 'Message is too long (maximum 2000 characters)');
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
    
    // Enhanced error classification for better client handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('anthropic') || errorMessage.includes('claude')) {
      return sendError(res, 'AI service temporarily unavailable. Please try again in a moment.', 503);
    }
    
    if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
      return sendError(res, 'Too many requests. Please wait a moment and try again.', 429);
    }
    
    if (errorMessage.includes('timeout')) {
      return sendError(res, 'Request timed out. Please try again.', 408);
    }
    
    return sendError(res, error instanceof Error ? error.message : 'Failed to process chat', 500);
  }
  });
}
