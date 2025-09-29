/**
 * Gallery Routes
 * Handles image gallery management
 */

import { Router, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { storage } from '../../storage.js';
import { SuccessResponse } from '../../types/ai-generation.js';
import { AuthenticatedRequest, AuthenticatedRequestWithBody, AuthenticatedRequestWithParams, FullAuthenticatedRequest } from '../../../api/_shared/request-types.js';

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: string;
}

interface GalleryImage {
  id: number | string;
  userId: string;
  url: string;
  prompt?: string;
  style?: string;
  category: string;
  source: string;
  createdAt: Date;
  metadata: ImageMetadata;
}

interface UploadImageRequest {
  imageUrl: string;
  metadata?: ImageMetadata;
}

interface SaveImageRequest {
  imageUrl: string;
  prompt?: string;
  style?: string;
}

interface GenerateImageRequest {
  prompt: string;
  style?: string;
  count?: number;
}

interface GenerateConceptRequest {
  concept: string;
  style?: string;
  count?: number;
}

interface GenerateStyleRequest {
  style: string;
  count?: number;
}

interface UpdateImageMetadataRequest {
  metadata: ImageMetadata;
}

const router = Router();

// Get user gallery
router.get('/api/gallery', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
    const allImages: GalleryImage[] = [
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
          width: 1024,
          height: 1024,
          format: 'png',
          size: '1.2MB'
        }
      }))
    ];
    
    // Sort by creation date (newest first)
    allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('📊 Gallery: Returning', allImages.length, 'total images');
    
    const responseData: SuccessResponse<{
      gallery: GalleryImage[];
      count: number;
    }> = {
      data: {
        gallery: allImages,
        count: allImages.length
      }
    };
    
    sendSuccess(res, responseData);
    
  } catch (error) {
    console.error('❌ Gallery: Error fetching images:', error);
    throw createError.internal('Failed to fetch gallery images');
  }
}));

// Get user gallery images (frontend calls this endpoint)
router.get('/api/gallery-images', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
    const allImages: GalleryImage[] = [
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
          width: 1024,
          height: 1024,
          format: 'png',
          size: '1.2MB'
        }
      }))
    ];
    
    // Sort by creation date (newest first)
    allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('📊 Gallery: Returning', allImages.length, 'total images');
    
    const responseData: SuccessResponse<GalleryImage[]> = {
      data: allImages
    };
    
    sendSuccess(res, responseData);
    
  } catch (error) {
    console.error('❌ Gallery: Error fetching images:', error);
    throw createError.internal('Failed to fetch gallery images');
  }
}));

// Upload image to gallery
router.post('/api/gallery/upload', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithBody<UploadImageRequest>, res: Response) => {
  const userId = req.user.id;
  const { imageUrl, metadata } = req.body;
  validateRequired({ imageUrl }, ['imageUrl']);

  // Mock implementation - replace with actual upload service
  const imageId = `img_${Date.now()}`;
  const responseData: SuccessResponse<{ imageId: string }> = {
    data: { imageId },
    message: 'Image uploaded successfully'
  };
  
  sendSuccess(res, responseData, 'Image uploaded successfully', 201);
}));

// Save image to gallery
router.post('/api/gallery/save', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithBody<SaveImageRequest>, res: Response) => {
  const userId = req.user.id;
  const { imageUrl, prompt, style } = req.body;
  validateRequired({ imageUrl }, ['imageUrl']);

  // Mock implementation - replace with actual save service
  const imageId = `img_${Date.now()}`;
  const responseData: SuccessResponse<{ imageId: string }> = {
    data: { imageId },
    message: 'Image saved to gallery'
  };
  
  sendSuccess(res, responseData, 'Image saved to gallery', 201);
}));

// Generate gallery image
router.post('/api/gallery/generate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithBody<GenerateImageRequest>, res: Response) => {
  const userId = req.user.id;
  const { prompt, style, count } = req.body;
  validateRequired({ prompt }, ['prompt']);

  // Mock implementation - replace with actual generation service
  const jobId = `gen_${Date.now()}`;
  const responseData: SuccessResponse<{ jobId: string }> = {
    data: { jobId },
    message: 'Image generation started'
  };
  
  sendSuccess(res, responseData, 'Image generation started', 202);
}));

// Get gallery by category
router.get('/api/gallery/category/:category', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithParams<{category: string}>, res: Response) => {
  const userId = req.user.id;
  const { category } = req.params;

  // Mock implementation - replace with actual category service
  const gallery: GalleryImage[] = [];
  const responseData: SuccessResponse<{
    gallery: GalleryImage[];
    category: string;
    count: number;
  }> = {
    data: {
      gallery,
      category,
      count: gallery.length
    }
  };
  
  sendSuccess(res, responseData);
}));

// Get specific image
router.get('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithParams<{imageId: string}>, res: Response) => {
  const userId = req.user.id;
  const { imageId } = req.params;

  // Mock implementation - replace with actual image service
  const image: GalleryImage = {
    id: imageId,
    userId,
    url: 'mock-url',
    category: 'gallery',
    source: 'workspace',
    createdAt: new Date(),
    metadata: {
      width: 1024,
      height: 1024,
      format: 'png',
      size: '1.2MB'
    }
  };
  
  const responseData: SuccessResponse<{ image: GalleryImage }> = {
    data: { image }
  };
  
  sendSuccess(res, responseData);
}));

// Update image metadata
router.post('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithBody<UpdateImageMetadataRequest> & AuthenticatedRequestWithParams<{imageId: string}>, res: Response) => {
  const userId = req.user.id;
  const { imageId } = req.params;
  const { metadata } = req.body;
  validateRequired({ metadata }, ['metadata']);

  // Mock implementation - replace with actual update service
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Image metadata updated'
  };
  
  sendSuccess(res, responseData);
}));

// Delete image
router.delete('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithParams<{imageId: string}>, res: Response) => {
  const userId = req.user.id;
  const { imageId } = req.params;

  // Mock implementation - replace with actual delete service
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Image deleted successfully'
  };
  
  sendSuccess(res, responseData);
}));

interface GenerationTracker {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

interface Prediction {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: GalleryImage[];
}

// Get generation tracker
router.get('/api/gallery/tracker/:trackerId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithParams<{trackerId: string}>, res: Response) => {
  const userId = req.user.id;
  const { trackerId } = req.params;

  // Mock implementation - replace with actual tracker service
  const tracker: GenerationTracker = {
    id: trackerId,
    status: 'completed'
  };
  
  const responseData: SuccessResponse<{ tracker: GenerationTracker }> = {
    data: { tracker }
  };
  
  sendSuccess(res, responseData);
}));

// Get prediction status
router.get('/api/gallery/prediction/:predictionId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithParams<{predictionId: string}>, res: Response) => {
  const userId = req.user.id;
  const { predictionId } = req.params;

  // Mock implementation - replace with actual prediction service
  const prediction: Prediction = {
    id: predictionId,
    status: 'completed'
  };
  
  const responseData: SuccessResponse<{ prediction: Prediction }> = {
    data: { prediction }
  };
  
  sendSuccess(res, responseData);
}));

// Generate concept images
router.post('/api/gallery/concept', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithBody<GenerateConceptRequest>, res: Response) => {
  const userId = req.user.id;
  const { concept, style, count } = req.body;
  validateRequired({ concept }, ['concept']);

  // Mock implementation - replace with actual concept service
  const jobId = `concept_${Date.now()}`;
  const responseData: SuccessResponse<{ jobId: string }> = {
    data: { jobId },
    message: 'Concept generation started'
  };
  
  sendSuccess(res, responseData, 'Concept generation started', 202);
}));

// Generate style images
router.post('/api/gallery/style', requireStackAuth, asyncHandler(async (req: AuthenticatedRequestWithBody<GenerateStyleRequest>, res: Response) => {
  const userId = req.user.id;
  const { style, count } = req.body;
  validateRequired({ style }, ['style']);

  // Mock implementation - replace with actual style service
  const jobId = `style_${Date.now()}`;
  const responseData: SuccessResponse<{ jobId: string }> = {
    data: { jobId },
    message: 'Style generation started'
  };
  
  sendSuccess(res, responseData, 'Style generation started', 202);
}));

export default router;

interface GalleryInspectResult {
  stackUserId: string;
  legacyUserId: string | null;
  counts: {
    aiForStackId: number;
    generatedForStackId: number;
    aiForLegacyId: number;
    generatedForLegacyId: number;
  };
  samples: {
    aiForStackId: unknown[];
    generatedForStackId: unknown[];
    aiForLegacyId: unknown[];
    generatedForLegacyId: unknown[];
  };
}

// DEBUG: Inspect gallery linkage for current user and any linked legacy ID
router.get('/api/debug/gallery-inspect', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const stackUserId = req.user.id;
  const linkedUser = await storage.getUserByStackAuthId(stackUserId);
  const legacyUserId = linkedUser?.id;

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

  const result: GalleryInspectResult = {
    stackUserId,
    legacyUserId: legacyUserId || null,
    counts: {
      aiForStackId: aiStack.length,
      generatedForStackId: genStack.length,
      aiForLegacyId: aiLegacy.length,
      generatedForLegacyId: genLegacy.length,
    },
    samples: {
      aiForStackId: sample(aiStack),
      generatedForStackId: sample(genStack),
      aiForLegacyId: sample(aiLegacy),
      generatedForLegacyId: sample(genLegacy),
    }
  };

  res.json(result);
}));