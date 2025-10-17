import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface StoryConceptRequest {
  concept: string;
  style?: string;
  length?: string;
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

      const body = await getRequestBody(req) as StoryConceptRequest;
      const { concept, style, length } = body;

      if (!concept) {
        return sendError(res, 'Concept is required', 400);
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

      return sendSuccess(res, responseData, 201);
    } catch (error) {
      console.error('❌ Story generation error:', error);
      return sendError(res, 'Failed to generate story', 500);
    }
  });
}

