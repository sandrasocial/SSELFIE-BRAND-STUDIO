/**
 * Gallery Routes
 * Handles image gallery management
 */

import { Router } from 'express';
import { requireStackAuth } from '../middleware/auth';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler';
import { storage } from '../../storage';

const router = Router();

// Get user gallery
router.get('/api/gallery', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  
  try {
    res.setHeader('Cache-Control', 'no-store');
    console.log('🔍 Gallery: Fetching images for user:', userId);
    
    // Get AI images from the database
    const aiImages = await storage.getAIImages(userId);
    console.log('📊 Gallery: Found', aiImages.length, 'AI images');
    
    // Also get generated images (newer table)
    const generatedImages = await storage.getGeneratedImages(userId);
    console.log('📊 Gallery: Found', generatedImages.length, 'generated images');
    
    // Combine both sources and format for frontend
    const allImages = [
      // AI Images (legacy format)
      ...aiImages.map(img => ({
        id: img.id,
        userId: img.userId,
        url: img.imageUrl,
        prompt: img.prompt,
        style: img.style,
        category: img.category || 'gallery',
        source: img.source || 'workspace',
        createdAt: img.createdAt,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'png',
          size: '1.2MB'
        }
      })),
      // Generated Images (newer format)
      ...generatedImages.map(img => ({
        id: img.id,
        userId: img.userId,
        url: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : ''),
        prompt: img.prompt,
        style: img.category || 'gallery',
        category: img.category || 'gallery',
        source: 'maya-generation',
        createdAt: img.createdAt,
        metadata: {
          width: 1024, // Default width for generated images
          height: 1024, // Default height for generated images
          format: 'png',
          size: '1.2MB'
        }
      }))
    ];
    
    // Sort by creation date (newest first)
    allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('📊 Gallery: Returning', allImages.length, 'total images');
    sendSuccess(res, { gallery: allImages, count: allImages.length });
    
  } catch (error) {
    console.error('❌ Gallery: Error fetching images:', error);
    throw createError.internal('Failed to fetch gallery images');
  }
}));

// Get user gallery images (frontend calls this endpoint)
router.get('/api/gallery-images', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  
  try {
    res.setHeader('Cache-Control', 'no-store');
    console.log('🔍 Gallery: Fetching images for user:', userId);
    
    // Get AI images from the database
    const aiImages = await storage.getAIImages(userId);
    console.log('📊 Gallery: Found', aiImages.length, 'AI images');
    
    // Also get generated images (newer table)
    const generatedImages = await storage.getGeneratedImages(userId);
    console.log('📊 Gallery: Found', generatedImages.length, 'generated images');
    
    // Combine both sources and format for frontend
    const allImages = [
      // AI Images (legacy format)
      ...aiImages.map(img => ({
        id: img.id,
        userId: img.userId,
        url: img.imageUrl,
        prompt: img.prompt,
        style: img.style,
        category: img.category || 'gallery',
        source: img.source || 'workspace',
        createdAt: img.createdAt,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'png',
          size: '1.2MB'
        }
      })),
      // Generated Images (newer format)
      ...generatedImages.map(img => ({
        id: img.id,
        userId: img.userId,
        url: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : ''),
        prompt: img.prompt,
        style: img.category || 'gallery',
        category: img.category || 'gallery',
        source: 'maya-generation',
        createdAt: img.createdAt,
        metadata: {
          width: 1024, // Default width for generated images
          height: 1024, // Default height for generated images
          format: 'png',
          size: '1.2MB'
        }
      }))
    ];
    
    // Sort by creation date (newest first)
    allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('📊 Gallery: Returning', allImages.length, 'total images');
    sendSuccess(res, allImages);
    
  } catch (error) {
    console.error('❌ Gallery: Error fetching images:', error);
    throw createError.internal('Failed to fetch gallery images');
  }
}));

// Upload image to gallery
router.post('/api/gallery/upload', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageUrl, metadata } = req.body;
  validateRequired({ imageUrl }, ['imageUrl']);

  // Mock implementation - replace with actual upload service
  const imageId = `img_${Date.now()}`;
  sendSuccess(res, { imageId, message: 'Image uploaded successfully' }, 'Image uploaded successfully', 201);
}));

// Save image to gallery
router.post('/api/gallery/save', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageUrl, prompt, style } = req.body;
  validateRequired({ imageUrl }, ['imageUrl']);

  // Mock implementation - replace with actual save service
  const imageId = `img_${Date.now()}`;
  sendSuccess(res, { imageId, message: 'Image saved to gallery' }, 'Image saved to gallery', 201);
}));

// Generate gallery image
router.post('/api/gallery/generate', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { prompt, style, count } = req.body;
  validateRequired({ prompt }, ['prompt']);

  // Mock implementation - replace with actual generation service
  const jobId = `gen_${Date.now()}`;
  sendSuccess(res, { jobId, message: 'Image generation started' }, 'Image generation started', 202);
}));

// Get gallery by category
router.get('/api/gallery/category/:category', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { category } = req.params;

  // Mock implementation - replace with actual category service
  const gallery = [];
  sendSuccess(res, { gallery, category, count: gallery.length });
}));

// Get specific image
router.get('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageId } = req.params;

  // Mock implementation - replace with actual image service
  const image = { id: imageId, url: 'mock-url' };
  sendSuccess(res, { image });
}));

// Update image metadata
router.post('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageId } = req.params;
  const { metadata } = req.body;

  // Mock implementation - replace with actual update service
  sendSuccess(res, { message: 'Image metadata updated' });
}));

// Delete image
router.delete('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageId } = req.params;

  // Mock implementation - replace with actual delete service
  sendSuccess(res, { message: 'Image deleted successfully' });
}));

// Get generation tracker
router.get('/api/gallery/tracker/:trackerId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { trackerId } = req.params;

  // Mock implementation - replace with actual tracker service
  const tracker = { id: trackerId, status: 'completed' };
  sendSuccess(res, { tracker });
}));

// Get prediction status
router.get('/api/gallery/prediction/:predictionId', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { predictionId } = req.params;

  // Mock implementation - replace with actual prediction service
  const prediction = { id: predictionId, status: 'completed' };
  sendSuccess(res, { prediction });
}));

// Generate concept images
router.post('/api/gallery/concept', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { concept, style, count } = req.body;
  validateRequired({ concept }, ['concept']);

  // Mock implementation - replace with actual concept service
  const jobId = `concept_${Date.now()}`;
  sendSuccess(res, { jobId, message: 'Concept generation started' }, 'Concept generation started', 202);
}));

// Generate style images
router.post('/api/gallery/style', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { style, count } = req.body;
  validateRequired({ style }, ['style']);

  // Mock implementation - replace with actual style service
  const jobId = `style_${Date.now()}`;
  sendSuccess(res, { jobId, message: 'Style generation started' }, 'Style generation started', 202);
}));

// Upscale image - Create HD variant
router.post('/api/upscale', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { imageId, provider, scale } = req.body;
  
  validateRequired({ imageId }, ['imageId']);
  
  // Import upscale services dynamically
  const { isUpscalingEnabled, getUpscaleProvider, getProviderConfig } = await import('../../config/upscale');
  
  // Check if upscaling is configured
  if (!isUpscalingEnabled()) {
    return res.status(501).json({
      error: 'Upscaling not configured',
      message: 'Image upscaling is not available. Please configure UPSCALE_PROVIDER environment variable.'
    });
  }
  
  try {
    // Get original image
    const originalImage = await storage.getAIImageById(imageId, userId);
    if (!originalImage) {
      return res.status(404).json({
        error: 'Image not found',
        message: 'The specified image could not be found.'
      });
    }
    
    // Check if HD variant already exists
    const existingVariant = await storage.getImageVariant(imageId, 'hd');
    if (existingVariant) {
      return sendSuccess(res, {
        variantId: existingVariant.id,
        url: existingVariant.url,
        width: existingVariant.width,
        height: existingVariant.height,
        cached: true
      }, 'HD variant already exists');
    }
    
    // Determine provider and scale
    const configuredProvider = provider || getUpscaleProvider();
    const config = getProviderConfig(configuredProvider);
    const upscaleScale = scale || config.defaultScale;
    
    // Import and call appropriate upscaling service
    let upscaleResult;
    if (configuredProvider === 'real_esrgan') {
      const { upscaleImageWithRealESRGAN } = await import('../../services/upscale/real_esrgan');
      upscaleResult = await upscaleImageWithRealESRGAN(originalImage.imageUrl, upscaleScale);
    } else if (configuredProvider === 'topaz') {
      const { upscaleImageWithTopaz } = await import('../../services/upscale/topaz');
      upscaleResult = await upscaleImageWithTopaz(originalImage.imageUrl, upscaleScale);
    } else {
      return res.status(501).json({
        error: 'Unsupported provider',
        message: `Provider ${configuredProvider} is not supported.`
      });
    }
    
    // Handle upscaling error
    if ('error' in upscaleResult) {
      return res.status(500).json({
        error: 'Upscaling failed',
        message: upscaleResult.error,
        details: upscaleResult.details
      });
    }
    
    // Save variant to database
    const variant = await storage.createImageVariant({
      imageId: parseInt(imageId),
      kind: 'hd',
      url: upscaleResult.url,
      width: upscaleResult.width,
      height: upscaleResult.height,
      provider: upscaleResult.provider,
      scale: upscaleResult.scale,
      fileSize: null // We don't have file size info yet
    });
    
    sendSuccess(res, {
      variantId: variant.id,
      url: variant.url,
      width: variant.width,
      height: variant.height,
      provider: variant.provider,
      scale: variant.scale
    }, 'Image upscaled successfully');
    
  } catch (error: any) {
    console.error('❌ UPSCALE: Route error:', error);
    res.status(500).json({
      error: 'Upscaling failed',
      message: 'An unexpected error occurred during upscaling.',
      details: error.message
    });
  }
}));

export default router;

// DEBUG: Inspect gallery linkage for current user and any linked legacy ID
router.get('/api/debug/gallery-inspect', requireStackAuth, asyncHandler(async (req: any, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const stackUserId = req.user.id;
  const linkedUser = await storage.getUserByStackAuthId(stackUserId);
  const legacyUserId = linkedUser?.id;

  const result: Record<string, unknown> = {
    stackUserId,
    legacyUserId: legacyUserId || null,
  };

  // Helper to safely sample arrays
  const sample = <T>(arr: T[] | undefined, n = 5) => (Array.isArray(arr) ? arr.slice(0, n) : []);

  // Fetch images for stack ID
  const aiStack = await storage.getAIImages(stackUserId);
  const genStack = await storage.getGeneratedImages(stackUserId);

  // If there is a legacy linked id, fetch those as well
  let aiLegacy: unknown[] = [];
  let genLegacy: unknown[] = [];
  if (legacyUserId) {
    aiLegacy = await storage.getAIImages(String(legacyUserId));
    genLegacy = await storage.getGeneratedImages(String(legacyUserId));
  }

  result['counts'] = {
    aiForStackId: aiStack.length,
    generatedForStackId: genStack.length,
    aiForLegacyId: aiLegacy.length,
    generatedForLegacyId: genLegacy.length,
  };
  result['samples'] = {
    aiForStackId: sample(aiStack),
    generatedForStackId: sample(genStack),
    aiForLegacyId: sample(aiLegacy as unknown[]),
    generatedForLegacyId: sample(genLegacy as unknown[]),
  };

  res.json(result);
}));