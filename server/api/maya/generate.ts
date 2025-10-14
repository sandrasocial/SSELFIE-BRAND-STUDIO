/**
 * POST /api/maya/generate - Pure Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_middleware/auth.js';
import type { AuthenticatedRequest } from '../../_shared/auth-types.js';
import { sendError, sendMethodNotAllowed, sendUnauthorized, sendBadRequest, setNoCacheHeaders } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
      return sendMethodNotAllowed(res, ['POST']);
    }

    try {
      const user = req.user;
      if (!user) return sendUnauthorized(res);

    const { prompt, style, count = 1, conceptName, seed, conceptCard } = req.body || {};
    
    // Handle both old format (direct prompt) and new format (conceptCard.fluxPrompt)
    const finalPrompt = conceptCard?.fluxPrompt || prompt;
    const finalConceptName = conceptCard?.title || conceptName || 'Maya AI Generation';
    
    if (!finalPrompt) {
      return sendBadRequest(res, 'Prompt is required for image generation');
    }

    if (typeof finalPrompt !== 'string' || finalPrompt.trim().length === 0) {
      return sendBadRequest(res, 'Prompt must be a non-empty string');
    }

    if (finalPrompt.length > 1000) {
      return sendBadRequest(res, 'Prompt is too long (maximum 1000 characters)');
    }

    const dbUser = user; // getUserFromRequest already returns database user

    const userModel = await storage.getUserModelByUserId(user.id);
    if (!userModel) {
      return sendError(res, 'Please complete your model training before generating images', 400);
    }

    if (userModel.trainingStatus !== 'completed') {
      return sendError(res, 'Your model training is not yet complete. Please wait for training to finish.', 400);
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
    
    // Enhanced error classification
    const errorMessage = error instanceof Error ? error.message : 'Unknown generation error';
    
    if (errorMessage.includes('replicate') || errorMessage.includes('flux')) {
      return sendError(res, 'Image generation service temporarily unavailable. Please try again in a moment.', 503);
    }
    
    if (errorMessage.includes('rate') || errorMessage.includes('limit') || errorMessage.includes('quota')) {
      return sendError(res, 'Generation limit reached. Please try again later.', 429);
    }
    
    if (errorMessage.includes('model') && errorMessage.includes('not found')) {
      return sendError(res, 'Your personal model is not available. Please contact support.', 500);
    }
    
    if (errorMessage.includes('timeout')) {
      return sendError(res, 'Generation request timed out. Please try again.', 408);
    }
    
    return sendError(res, 'Image generation failed. Please try again or contact support if this persists.', 500);
  }
  });
}
