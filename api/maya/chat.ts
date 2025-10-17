import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface MayaChatRequest {
  message: string;
  conversationId?: string;
  userId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User ID not found', 401);
      }

      const body = await getRequestBody(req) as MayaChatRequest;
      const { message, conversationId } = body;

      if (!message) {
        return sendError(res, 'Message is required', 400);
      }

      // TODO: Implement Maya AI chat with Claude API
      const newConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const responseData = {
        data: {
          response: "Hi! I'm Maya, your AI brand strategist. I can help you create amazing images for your personal brand. Tell me what kind of images you need!",
          conversationId: newConversationId,
          conceptCards: [],
          timestamp: new Date().toISOString()
        },
        message: 'Chat message processed'
      };

      return sendSuccess(res, responseData);
    } catch (error) {
      console.error('❌ Maya chat error:', error);
      return sendError(res, 'Failed to process chat message', 500);
    }
  });
}

