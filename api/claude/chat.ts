import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface ClaudeMessage {
  message: string;
  conversationId?: string;
  agentId?: string;
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

      const body = await getRequestBody(req) as ClaudeMessage;
      const { message, conversationId, agentId } = body;

      if (!message) {
        return sendError(res, 'Message is required', 400);
      }

      // TODO: Implement Claude AI chat
      const responseData = {
        data: {
          response: "Hello! I'm Claude, your AI assistant. How can I help you today?",
          conversationId: conversationId || `conv_${Date.now()}`,
          agentId,
          timestamp: new Date().toISOString()
        },
        message: 'Chat message processed'
      };

      return sendSuccess(res, responseData);
    } catch (error) {
      console.error('❌ Claude chat error:', error);
      return sendError(res, 'Failed to process chat message', 500);
    }
  });
}

