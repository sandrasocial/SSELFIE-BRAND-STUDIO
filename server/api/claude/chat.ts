/**
 * POST /api/claude/chat
 * 
 * Send a message to Claude AI
 * ✅ MIGRATED from server/routes/modules/claude.ts
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';

interface ClaudeMessage {
  message: string;
  conversationId?: string;
  agentId?: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const { message, conversationId, agentId } = req.body as ClaudeMessage;
      const userId = req.user.id;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Mock implementation - replace with actual Claude service
      const response = "Hello! I'm Claude, your AI assistant. How can I help you today?";

      const responseData = {
        data: {
          response,
          conversationId: conversationId || `conv_${Date.now()}`
        }
      };

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('❌ POST /api/claude/chat failed:', error);
      return res.status(500).json({
        error: 'Failed to send message to Claude',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

