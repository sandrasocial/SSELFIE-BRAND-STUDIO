import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface GenerateCoverImageRequest {
  title: string;
  subtitle?: string;
  style?: string;
  imageUrl?: string;
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

      const body = await getRequestBody(req) as GenerateCoverImageRequest;
      const { title, subtitle, style, imageUrl } = body;

      if (!title) {
        return sendError(res, 'Title is required', 400);
      }

      // TODO: Implement cover image generation
      const responseData = {
        data: {
          jobId: `cover_${Date.now()}`,
          title,
          subtitle,
          style,
          imageUrl,
          status: 'processing'
        },
        message: 'Cover image generation started'
      };

      return sendSuccess(res, responseData, 201);
    } catch (error) {
      console.error('❌ Cover image generation error:', error);
      return sendError(res, 'Failed to generate cover image', 500);
    }
  });
}

