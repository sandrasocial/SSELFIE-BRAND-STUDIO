/**/**

 * Vercel Serverless Function - /api/maya/heart-image * POST /api/maya/heart-image - Pure Serverless

 * Proxies to server implementation */

 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import handler from '../../server/api/maya/heart-image.js';import { getUserFromRequest } from '../../_utils/auth-helpers.js';

import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export default handler;

export const config = { runtime: 'nodejs', maxDuration: 60 };

export const config = {

  runtime: 'nodejs',export default async function handler(req: VercelRequest, res: VercelResponse) {

  maxDuration: 40,  if (req.method !== 'POST') {

};    return sendMethodNotAllowed(res, ['POST']);

  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    const { imageUrl, prompt, category } = req.body || {};
    
    if (!imageUrl) {
      return sendError(res, 'imageUrl is required', 400);
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
    return sendError(res, error instanceof Error ? error.message : 'Failed to save image', 500);
  }
}
