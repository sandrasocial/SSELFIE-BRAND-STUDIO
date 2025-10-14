/**
 * POST /api/maya/heart-image - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    const { imageUrl, prompt, category } = req.body || {};
    
    if (!imageUrl) {
      return sendError(res, 'imageUrl is required', 400);
    }

    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      return sendError(res, 'imageUrl must be a valid HTTP/HTTPS URL', 400);
    }

    if (imageUrl.length > 2000) {
      return sendError(res, 'imageUrl is too long', 400);
    }

    const { MayaChatPreviewService } = await import('../../maya-chat-preview-service.js');
    
    const savedImage = await MayaChatPreviewService.heartImageToGallery(
      user.id,
      imageUrl,
      prompt || 'Hearted from Maya',
      category || 'other'
    );

    setNoCacheHeaders(res);
    return res.status(200).json({
      success: true,
      savedImage
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/heart-image:', error);
    
    // Enhanced error classification
    const errorMessage = error instanceof Error ? error.message : 'Unknown save error';
    
    if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
      return sendError(res, 'Image already saved to gallery', 409);
    }
    
    if (errorMessage.includes('storage') || errorMessage.includes('s3')) {
      return sendError(res, 'Storage service temporarily unavailable. Please try again.', 503);
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return sendError(res, 'Invalid image data. Please try again.', 400);
    }
    
    return sendError(res, error instanceof Error ? error.message : 'Failed to save image', 500);
  }
}
