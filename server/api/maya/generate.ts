/**
 * POST /api/maya/generate - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendError, sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    const { prompt, style, count = 1, conceptName, seed, conceptCard } = req.body || {};
    
    // Handle both old format (direct prompt) and new format (conceptCard.fluxPrompt)
    const finalPrompt = conceptCard?.fluxPrompt || prompt;
    const finalConceptName = conceptCard?.title || conceptName || 'Maya AI Generation';
    
    if (!finalPrompt) {
      return sendError(res, 'Prompt is required', 400);
    }

    const dbUser = user; // getUserFromRequest already returns database user

    const userModel = await storage.getUserModelByUserId(user.id);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      return sendError(res, 'Please complete your model training before generating images', 400);
    }

    const { mayaService } = await import('../../services/maya-service.js');
    
    const generationResult = await mayaService.generateImages(dbUser.id, {
      conceptCard: {
        id: conceptCard?.id || `maya-gen-${Date.now()}`,
        title: finalConceptName,
        fluxPrompt: finalPrompt
      }
    });

    setNoCacheHeaders(res);
    return res.status(200).json({
      success: true,
      generationId: generationResult.generationId,
      status: generationResult.status,
      message: generationResult.message
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/generate:', error);
    return sendError(res, 'Generation failed', 500);
  }
}
