import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface MayaGenerateRequest {
  prompt: string;
  style?: string;
  count?: number;
  seed?: number;
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

      const body = await getRequestBody(req) as MayaGenerateRequest;
      const { prompt, style, count = 1, seed } = body;

      if (!prompt) {
        return sendError(res, 'Prompt is required', 400);
      }

      // TODO: Implement image generation via mayaService
      const responseData = {
        data: {
          jobId: `maya_gen_${Date.now()}`,
          prompt,
          style,
          count,
          seed,
          status: 'processing',
          estimatedTime: '30-60 seconds'
        },
        message: 'Image generation started'
      };

      return sendSuccess(res, responseData, 201);
    } catch (error) {
      console.error('❌ Maya generate error:', error);
      return sendError(res, 'Failed to generate images', 500);
    }
  });
}

