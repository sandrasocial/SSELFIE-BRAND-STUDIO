import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface VerticalSliceChatRequest {
  message: string;
  conversationId?: string;
  userId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    const body = await getRequestBody(req) as VerticalSliceChatRequest;
    const { message, conversationId, userId } = body;

    if (!message || !userId) {
      return sendError(res, 'Message and userId are required', 400);
    }

    // Mock concept cards for vertical slice demo
    const mockConceptCards = [
      {
        id: 'concept-1',
        title: 'Professional Headshot',
        description: 'A clean, professional portrait perfect for LinkedIn',
        fluxPrompt: 'professional headshot of a person, clean background, business attire'
      },
      {
        id: 'concept-2',
        title: 'Creative Portrait',
        description: 'An artistic portrait with creative lighting',
        fluxPrompt: 'creative portrait of a person, artistic lighting, interesting composition'
      }
    ];

    const newConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const responseData = {
      data: {
        response: "I can help you create amazing images! I've generated some concept cards for you.",
        conceptCards: mockConceptCards,
        conversationId: newConversationId,
        timestamp: new Date().toISOString()
      },
      message: 'Chat processed'
    };

    return sendSuccess(res, responseData);
  } catch (error) {
    console.error('❌ Vertical slice chat error:', error);
    return sendError(res, 'Failed to process chat', 500);
  }
}

