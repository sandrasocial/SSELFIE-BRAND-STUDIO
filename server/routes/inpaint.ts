/**
 * Inpainting Routes
 * Handles image inpainting functionality
 */

import { Router } from 'express';
import { requireStackAuth } from './middleware/auth';
import { asyncHandler, createError, sendSuccess, validateRequired } from './middleware/error-handler';
import { SDInpaintService } from '../services/inpaint/sd_inpaint';
import { storage } from '../storage';

const router = Router();

/**
 * POST /api/inpaint
 * Start inpainting process
 * Body: { imageId: number, maskPng: string (base64), prompt: string }
 */
router.post('/api/inpaint', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageId, maskPng, prompt } = req.body;

  // Validate required fields
  validateRequired({ imageId, maskPng, prompt }, ['imageId', 'maskPng', 'prompt']);

  try {
    console.log('🎨 INPAINT: Starting inpainting for user:', userId, 'imageId:', imageId);

    // First, find the original image
    let originalImage: any = null;
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
    const imageUrl = originalImage.imageUrl || originalImage.url || originalImage.selectedUrl;
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
router.get('/api/inpaint/:predictionId/status', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { predictionId } = req.params;
  const { variantId } = req.query;

  try {
    console.log('🎨 INPAINT: Checking status for prediction:', predictionId);

    if (!variantId) {
      throw createError.badRequest('variantId query parameter is required');
    }

    const result = await SDInpaintService.checkInpaintStatus(predictionId, parseInt(variantId));

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
router.get('/api/inpaint/variants/:imageId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageId } = req.params;
  const { imageType = 'ai_image' } = req.query;

  try {
    console.log('🎨 INPAINT: Getting variants for image:', imageId, 'type:', imageType);

    const variants = await SDInpaintService.getImageInpaintVariants(
      parseInt(imageId), 
      imageType as 'ai_image' | 'generated_image'
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
router.get('/api/inpaint/user-variants', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;

  try {
    console.log('🎨 INPAINT: Getting all user variants for:', userId);

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
router.delete('/api/inpaint/variant/:variantId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { variantId } = req.params;

  try {
    console.log('🎨 INPAINT: Deleting variant:', variantId, 'for user:', userId);

    // Get the variant to verify ownership
    const variant = await storage.getImageVariant(parseInt(variantId));
    
    if (!variant) {
      throw createError.notFound('Variant not found');
    }

    if (variant.userId !== userId) {
      throw createError.forbidden('Not authorized to delete this variant');
    }

    // TODO: Implement deleteImageVariant method in storage
    // For now, we'll update the status to 'deleted'
    await storage.updateImageVariant(parseInt(variantId), {
      generationStatus: 'deleted'
    });

    sendSuccess(res, { message: 'Variant deleted successfully' });

  } catch (error) {
    console.error('❌ INPAINT: Error deleting variant:', error);
    throw error;
  }
}));

export default router;