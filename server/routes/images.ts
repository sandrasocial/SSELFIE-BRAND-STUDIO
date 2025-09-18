/**
 * Image Routes
 * Handles image variations and related functionality
 */

import { Router } from 'express';
import { requireStackAuth } from './middleware/auth';
import { asyncHandler, createError, sendSuccess, validateRequired } from './middleware/error-handler';
import { ImageVariationsService } from '../services/images/variations';
import { storage } from '../storage';

const router = Router();

/**
 * POST /api/images/:id/variations
 * Generate variations of an existing image
 * Body: { count?: number (default 3) }
 */
router.post('/api/images/:id/variations', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { id: imageId } = req.params;
  const { count = 3, imageType = 'ai_image' } = req.body;

  // Validate inputs
  if (!imageId || isNaN(parseInt(imageId))) {
    throw createError.badRequest('Invalid image ID');
  }

  if (count < 1 || count > 6) {
    throw createError.badRequest('Count must be between 1 and 6');
  }

  if (!['ai_image', 'generated_image'].includes(imageType)) {
    throw createError.badRequest('imageType must be either "ai_image" or "generated_image"');
  }

  try {
    console.log('🎨 VARIATIONS: Starting variations for user:', userId, 'image:', imageId, 'count:', count);

    const result = await ImageVariationsService.generateVariations({
      originalImageId: parseInt(imageId),
      originalImageType: imageType as 'ai_image' | 'generated_image',
      userId,
      count
    });

    if (!result.success) {
      throw createError.internal(result.error || 'Failed to start variation generation');
    }

    sendSuccess(res, {
      predictionId: result.predictionId,
      variantIds: result.variantIds,
      status: 'processing',
      count
    }, 'Variation generation started successfully', 202);

  } catch (error) {
    console.error('❌ VARIATIONS: Error starting variations:', error);
    throw error;
  }
}));

/**
 * GET /api/images/:id/variations/status/:predictionId
 * Check status of variation generation
 */
router.get('/api/images/:id/variations/status/:predictionId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { id: imageId, predictionId } = req.params;
  const { variantIds } = req.query;

  try {
    console.log('🎨 VARIATIONS: Checking status for prediction:', predictionId);

    if (!variantIds) {
      throw createError.badRequest('variantIds query parameter is required');
    }

    // Parse variant IDs
    const variantIdArray = Array.isArray(variantIds) 
      ? variantIds.map(id => parseInt(id)) 
      : variantIds.split(',').map(id => parseInt(id.trim()));

    const result = await ImageVariationsService.checkVariationStatus(predictionId, variantIdArray);

    sendSuccess(res, result);

  } catch (error) {
    console.error('❌ VARIATIONS: Error checking variation status:', error);
    throw error;
  }
}));

/**
 * GET /api/images/:id/variations
 * Get all variations for a specific image
 */
router.get('/api/images/:id/variations', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { id: imageId } = req.params;
  const { imageType = 'ai_image' } = req.query;

  try {
    console.log('🎨 VARIATIONS: Getting variations for image:', imageId, 'type:', imageType);

    const variations = await ImageVariationsService.getImageVariations(
      parseInt(imageId),
      imageType as 'ai_image' | 'generated_image',
      userId
    );

    sendSuccess(res, {
      variations,
      count: variations.length,
      imageId: parseInt(imageId),
      imageType
    });

  } catch (error) {
    console.error('❌ VARIATIONS: Error getting image variations:', error);
    throw error;
  }
}));

/**
 * GET /api/images/variations/user
 * Get all variations for the current user
 */
router.get('/api/images/variations/user', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;

  try {
    console.log('🎨 VARIATIONS: Getting all user variations for:', userId);

    const variations = await ImageVariationsService.getUserVariations(userId);

    sendSuccess(res, {
      variations,
      count: variations.length
    });

  } catch (error) {
    console.error('❌ VARIATIONS: Error getting user variations:', error);
    throw error;
  }
}));

/**
 * DELETE /api/images/variations/:variantId
 * Delete a specific variation
 */
router.delete('/api/images/variations/:variantId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { variantId } = req.params;

  try {
    console.log('🎨 VARIATIONS: Deleting variation:', variantId, 'for user:', userId);

    // Get the variant to verify ownership
    const variant = await storage.getImageVariant(parseInt(variantId));
    
    if (!variant) {
      throw createError.notFound('Variation not found');
    }

    if (variant.userId !== userId) {
      throw createError.forbidden('Not authorized to delete this variation');
    }

    // Update the variant status to 'deleted'
    await storage.updateImageVariant(parseInt(variantId), {
      generationStatus: 'deleted'
    });

    sendSuccess(res, { message: 'Variation deleted successfully' });

  } catch (error) {
    console.error('❌ VARIATIONS: Error deleting variation:', error);
    throw error;
  }
}));

/**
 * POST /api/images/:id/save-variation
 * Save a variation as a new gallery image
 */
router.post('/api/images/:id/save-variation', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { id: variantId } = req.params;

  try {
    console.log('🎨 VARIATIONS: Saving variation as new image:', variantId, 'for user:', userId);

    // Get the variant
    const variant = await storage.getImageVariant(parseInt(variantId));
    
    if (!variant) {
      throw createError.notFound('Variation not found');
    }

    if (variant.userId !== userId) {
      throw createError.forbidden('Not authorized to save this variation');
    }

    if (!variant.imageUrl) {
      throw createError.badRequest('Variation is not completed yet');
    }

    // Save as a new AI image
    const newImage = await storage.saveAIImage({
      userId,
      imageUrl: variant.imageUrl,
      prompt: variant.prompt,
      source: 'variation',
      style: 'variation',
      category: 'variation'
    });

    sendSuccess(res, {
      imageId: newImage.id,
      message: 'Variation saved to gallery successfully'
    }, 'Variation saved to gallery', 201);

  } catch (error) {
    console.error('❌ VARIATIONS: Error saving variation:', error);
    throw error;
  }
}));

export default router;
