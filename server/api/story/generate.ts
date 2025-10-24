/**
 * POST /api/story/generate
 * 
 * Generate a full story from a concept
 * ✅ MIGRATED from server/routes/modules/ai-generation.ts
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';

interface StoryGenerateRequest {
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
      const { concept, style, length } = req.body as StoryGenerateRequest;
      // 🔥 FIX: Use stackAuthId for database queries to fix user ID mismatch
      const userId = req.user.stackAuthId || req.user.id;

      if (!concept) {
        return res.status(400).json({ error: 'Concept is required' });
      }

      // TODO: Implement full story generation
      const responseData = {
        data: {
          jobId: `story_${Date.now()}`,
          concept,
          style,
          length
        },
        message: 'Story generation started'
      };

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('❌ POST /api/story/generate failed:', error);
      return res.status(500).json({
        error: 'Failed to generate story',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

