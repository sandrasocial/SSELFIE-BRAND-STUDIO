/**
 * Inpainting Routes
 * ⚠️ DEPRECATED: This Express router uses legacy Stack Auth imports
 * Inpainting is now handled by api/inpaint/* serverless functions
 * This file is kept for reference only
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, createError, sendSuccess, validateRequired } from './middleware/error-handler.js';
import { SDInpaintService } from '../services/inpaint/sd_inpaint.js';
import { storage } from '../storage.js'

// Legacy middleware stub (kept for reference)
const requireStackAuth = (req: Request, res: Response, next: Function) => {
  return res.status(501).json({
    error: 'Deprecated endpoint',
    message: 'Use api/inpaint/* serverless functions instead'
  });
};

const router = Router();

/**
 * POST /api/inpaint
 * Start inpainting process
 * Body: { imageId: number, maskPng: string (base64), prompt: string }
 */
router.post('/api/inpaint', requireStackAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { imageId, maskPng, prompt } = req.body;

  // Validate required fields
  validateRequired({ imageId, maskPng, prompt }, ['imageId', 'maskPng', 'prompt']);

  try {

    // First, find the original image
    let originalImage: unknown = null;
    let originalImageType: 'ai_image' | 'generated_image' = 'ai_image';

    // Try to find in aiImages first
    const aiImage = await storage.getAIImages(userId);
    originalImage = aiImage.find(img => img.id === parseInt(imageId));
    
    if (!originalImage) {
      // Try to find in generatedImages
      const genImages = await storage.getGeneratedImages(userId);
      originalImage = genImages.find(img => img.id === parseInt(imageId));
      originalImageType = 'generated_image';
    }

    if (!originalImage) {
      throw createError.notFound('Original image not found or not owned by user');
    }

    // Get the image URL
    const imageUrl = (originalImage as { imageUrl?: string; url?: string; selectedUrl?: string }).imageUrl || 
                     (originalImage as { imageUrl?: string; url?: string; selectedUrl?: string }).url || 
                     (originalImage as { imageUrl?: string; url?: string; selectedUrl?: string }).selectedUrl;
    if (!imageUrl) {
      throw createError.badRequest('Original image has no valid URL');
    }

    // Start inpainting process
    const result = await SDInpaintService.startInpainting({
      imageUrl,
      maskPngBase64: maskPng,
      prompt,
      userId,
      originalImageId: parseInt(imageId),
      originalImageType
    });

    if (!result.success) {
      throw createError.internal(result.error || 'Failed to start inpainting');
    }

    sendSuccess(res, {
      predictionId: result.predictionId,
      variantId: result.variantId,
      status: 'processing'
    }, 'Inpainting started successfully', 202);

  } catch (error) {
    console.error('❌ INPAINT: Error starting inpainting:', error);
    throw error;
  }
}));

/**
 * GET /api/inpaint/:predictionId/status
 * Check inpainting prediction status
 */
router.get('/api/inpaint/:predictionId/status', requireStackAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { predictionId } = req.params;
  const { variantId } = req.query;

  try {

    if (!variantId) {
      throw createError.badRequest('variantId query parameter is required');
    }

    const result = await SDInpaintService.checkInpaintStatus(predictionId, parseInt(variantId as string));

    sendSuccess(res, result);

  } catch (error) {
    console.error('❌ INPAINT: Error checking status:', error);
    throw error;
  }
}));

/**
 * GET /api/inpaint/variants/:imageId
 * Get all inpainting variants for a specific image
 */
router.get('/api/inpaint/variants/:imageId', requireStackAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { imageId } = req.params;
  const { imageType = 'ai_image' } = req.query;

  try {

    const variants = await SDInpaintService.getImageInpaintVariants(
      parseInt(imageId), 
      (imageType as string) as 'ai_image' | 'generated_image'
    );

    // Filter by user to ensure security
    const userVariants = variants.filter(variant => variant.userId === userId);

    sendSuccess(res, {
      variants: userVariants,
      count: userVariants.length
    });

  } catch (error) {
    console.error('❌ INPAINT: Error getting variants:', error);
    throw error;
  }
}));

/**
 * GET /api/inpaint/user-variants
 * Get all inpainting variants for the current user
 */
router.get('/api/inpaint/user-variants', requireStackAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {

    const variants = await SDInpaintService.getUserInpaintVariants(userId);

    sendSuccess(res, {
      variants,
      count: variants.length
    });

  } catch (error) {
    console.error('❌ INPAINT: Error getting user variants:', error);
    throw error;
  }
}));

/**
 * DELETE /api/inpaint/variant/:variantId
 * Delete an inpainting variant
 */
router.delete('/api/inpaint/variant/:variantId', requireStackAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { variantId } = req.params;

  try {

    // Get the variant to verify ownership
    const variant = await storage.getImageVariant(parseInt(variantId), userId);

    if (!variant) {
      throw createError.notFound('Variant not found');
    }

    if (variant.userId !== userId) {
      throw createError.forbidden('Not authorized to delete this variant');
    }

    // TODO: Implement deleteImageVariant method in storage
    // For now, we'll update the status to 'deleted'
    await storage.updateImageVariant(parseInt(variantId), {
      processingStatus: 'deleted'
    });

    sendSuccess(res, { message: 'Variant deleted successfully' });

  } catch (error) {
    console.error('❌ INPAINT: Error deleting variant:', error);
    throw error;
  }
}));

export default router;
