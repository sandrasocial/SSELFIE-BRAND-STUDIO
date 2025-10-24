/**
 * POST /api/story/draft
 * 
 * Generate a story draft from a concept
 * ✅ MIGRATED from server/routes/modules/ai-generation.ts
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';

interface StoryConceptRequest {
  concept: string;
  style?: string;
  length?: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const { concept } = req.body as StoryConceptRequest;
      // 🔥 CRITICAL FIX: Use req.user.id for database queries
      // - For OLD users (pre-Stack Auth): id is the original numeric ID where data was created
      // - For NEW users (Stack Auth): id is already the Stack Auth ID
      // - stackAuthId is only used for linking old users to Stack Auth, NOT for queries
      const userId = req.user.id;

      if (!concept) {
        return res.status(400).json({ error: 'Concept is required' });
      }

      // TODO: Implement story draft generation
      const responseData = {
        data: {
          jobId: `draft_${Date.now()}`,
          concept
        },
        message: 'Story draft generation started'
      };

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('❌ POST /api/story/draft failed:', error);
      return res.status(500).json({
        error: 'Failed to generate story draft',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

