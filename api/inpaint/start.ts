import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';
import { SDInpaintService } from '../../server/services/inpaint/sd_inpaint';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface InpaintRequest {
  imageId: number;
  maskPng: string;
  prompt: string;
  imageType?: 'ai_image' | 'generated_image';
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

      const body = await getRequestBody(req) as InpaintRequest;
      const { imageId, maskPng, prompt, imageType = 'ai_image' } = body;

      if (!imageId || !maskPng || !prompt) {
        return sendError(res, 'Missing required fields: imageId, maskPng, prompt', 400);
      }

      const result = await SDInpaintService.startInpainting({
        imageUrl: '', // Will be fetched from imageId
        maskPngBase64: maskPng,
        prompt,
        userId,
        originalImageId: imageId,
        originalImageType: imageType
      });

      if (!result.success) {
        return sendError(res, result.error || 'Failed to start inpainting', 500);
      }

      return sendSuccess(res, result, 201);
    } catch (error) {
      console.error('❌ Inpaint start error:', error);
      return sendError(res, 'Failed to start inpainting', 500);
    }
  });
}

