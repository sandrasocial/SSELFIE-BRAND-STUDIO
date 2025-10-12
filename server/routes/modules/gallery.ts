/**
 * Gallery Routes
 * Handles image gallery, favorites, and AI image management
 */

import { Router, type Response as ExpressResponse } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { storage } from '../../storage.js';
import { withTimeout } from '../../_utils/timing.js';
import { AuthenticatedRequest, SuccessResponse } from '../../../shared/types/ai-generation.js';

// Circuit Breaker Pattern for Gallery Reliability
interface CircuitBreakerState {
  failures: number;
  isOpen: boolean;
  lastFailure: number;
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  isOpen: false,
  lastFailure: 0
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_TIME = 60000;

function checkCircuitBreaker(): boolean {
  const now = Date.now();
  
  if (circuitBreaker.isOpen && now - circuitBreaker.lastFailure > CIRCUIT_BREAKER_RESET_TIME) {
    circuitBreaker.isOpen = false;
    circuitBreaker.failures = 0;
  }
  
  return !circuitBreaker.isOpen;
}

function recordCircuitBreakerFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  
  if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreaker.isOpen = true;
  }
}

function recordCircuitBreakerSuccess() {
  if (circuitBreaker.failures > 0) {
    circuitBreaker.failures = 0;
  }
}

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
  prompt: string | null;
  style: string | null;
  category: string;
  source: string;
  createdAt: Date | null;
  metadata: ImageMetadata;
}

interface AiImage {
  id: number;
  userId: string;
  imageUrl: string;
  prompt?: string | null;
  style?: string | null;
  category?: string | null;
  source?: string | null;
  createdAt?: Date | null;
  isFavorite?: boolean | null;
  isSelected?: boolean | null;
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

// Favorites GET endpoint - Production version with filtering
router.get('/api/images/favorites', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const userId = req.user.id;
    const ai = await withTimeout(storage.getAIImages(userId), 5000, 'getAIImages') as unknown as AiImage[];
    const favIds = ai
      .filter((img: AiImage) => Boolean(img.isFavorite || img.isSelected))
      .map((img: AiImage) => img.id);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ favorites: favIds });
  } catch {
    res.status(200).json({ favorites: [] });
  }
}));

router.post('/api/images/:id/favorite', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const userId = req.user.id;
    const imageId = parseInt(req.params.id, 10);
    
    if (!imageId || Number.isNaN(imageId)) {
      res.status(400).json({ error: 'Invalid image id' });
      return;
    }
    
    const img = await withTimeout(storage.getAIImage(userId, imageId), 4000, 'getAIImage') as unknown as AiImage | undefined;
    const next = !(img?.isFavorite ?? false);
    await withTimeout(storage.updateAIImage(imageId, { isFavorite: next } as Partial<AiImage>), 4000, 'updateAIImage');
    
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ ok: true, id: imageId, isFavorite: next });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle favorite', message: (error as Error).message });
  }
}));

// Get user gallery - Production version with circuit breaker
router.get('/api/gallery', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const userId = req.user.id;
  
  try {
    // Circuit breaker check
    if (!checkCircuitBreaker()) {
      console.warn('⚠️ Circuit breaker open for gallery-images');
      res.status(503).json({
        images: [],
        total: 0,
        message: 'Service temporarily unavailable',
        code: 'CIRCUIT_BREAKER_OPEN'
      });
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    
    // Parallel fetch with timeout and error recovery
    const [aiImages, generatedImages] = await Promise.all([
      withTimeout(storage.getAIImages(userId), 2500, 'getAIImages').catch(err => {
        console.warn('⚠️ AI images fetch failed:', (err as Error).message);
        recordCircuitBreakerFailure();
        return [];
      }),
      withTimeout(storage.getGeneratedImages(userId), 2500, 'getGeneratedImages').catch(err => {
        console.warn('⚠️ Generated images fetch failed:', (err as Error).message);
        recordCircuitBreakerFailure();
        return [];
      })
    ]);
    
    if (aiImages.length > 0 || generatedImages.length > 0) {
      recordCircuitBreakerSuccess();
    }
    
    // Format images for frontend
    const galleryImages = [
      ...aiImages.map(img => ({
        id: img.id.toString(),
        userId: img.userId,
        type: 'ai_generated',
        title: img.style || 'AI Generated Image',
        description: img.prompt || 'AI-generated image',
        imageUrl: img.imageUrl,
        createdAt: (img.createdAt || new Date()).toISOString(),
        tags: img.style ? [img.style] : ['ai-generated']
      })),
      ...generatedImages.map(img => ({
        id: `gen_${img.id}`,
        userId: img.userId,
        type: 'generated',
        title: 'Generated Image',
        description: img.prompt || 'Generated image',
        imageUrl: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : null),
        createdAt: (img.createdAt || new Date()).toISOString(),
        tags: [img.category || 'generated']
      }))
    ];
    
    galleryImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.status(200).json(galleryImages);
    
  } catch (error) {
    console.error('❌ Gallery: Error fetching images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch gallery images',
      error: (error as Error).message
    });
  }
}));

// Get user gallery images (frontend calls this endpoint) - Production version with circuit breaker
router.get('/api/gallery-images', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const userId = req.user.id;
  
  try {
    // Circuit breaker check
    if (!checkCircuitBreaker()) {
      console.warn('⚠️ Circuit breaker open for gallery-images');
      res.status(503).json({
        images: [],
        total: 0,
        message: 'Service temporarily unavailable',
        code: 'CIRCUIT_BREAKER_OPEN'
      });
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    
    // Parallel fetch with timeout and error recovery
    const [aiImages, generatedImages] = await Promise.all([
      withTimeout(storage.getAIImages(userId), 2500, 'getAIImages').catch(err => {
        console.warn('⚠️ AI images fetch failed:', (err as Error).message);
        recordCircuitBreakerFailure();
        return [];
      }),
      withTimeout(storage.getGeneratedImages(userId), 2500, 'getGeneratedImages').catch(err => {
        console.warn('⚠️ Generated images fetch failed:', (err as Error).message);
        recordCircuitBreakerFailure();
        return [];
      })
    ]);
    
    if (aiImages.length > 0 || generatedImages.length > 0) {
      recordCircuitBreakerSuccess();
    }
    
    // Format images for frontend
    const galleryImages = [
      ...aiImages.map(img => ({
        id: img.id.toString(),
        userId: img.userId,
        type: 'ai_generated',
        title: img.style || 'AI Generated Image',
        description: img.prompt || 'AI-generated image',
        imageUrl: img.imageUrl,
        createdAt: (img.createdAt || new Date()).toISOString(),
        tags: img.style ? [img.style] : ['ai-generated']
      })),
      ...generatedImages.map(img => ({
        id: `gen_${img.id}`,
        userId: img.userId,
        type: 'generated',
        title: 'Generated Image',
        description: img.prompt || 'Generated image',
        imageUrl: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : null),
        createdAt: (img.createdAt || new Date()).toISOString(),
        tags: [img.category || 'generated']
      }))
    ];
    
    galleryImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.status(200).json(galleryImages);
    
  } catch (error) {
    console.error('❌ Gallery: Error fetching images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch gallery images',
      error: (error as Error).message
    });
  }
}));

// Delete AI image endpoint - Production version
router.delete('/api/ai-images/:id', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const userId = req.user.id;
    const imageId = parseInt(req.params.id, 10);
    
    if (!imageId || Number.isNaN(imageId)) {
      res.status(400).json({ error: 'Invalid image id' });
      return;
    }
    
    const ok = await storage.deleteAIImage(userId, imageId);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok, id: imageId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image', message: (error as Error).message });
  }
}));

// Upload image to gallery
router.post('/api/gallery/upload', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: UploadImageRequest }, res: ExpressResponse) => {
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
router.post('/api/gallery/save', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: SaveImageRequest }, res: ExpressResponse) => {
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
router.post('/api/gallery/generate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: GenerateImageRequest }, res: ExpressResponse) => {
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
router.get('/api/gallery/category/:category', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
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
router.get('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const userId = req.user.id;
  const { imageId } = req.params;

  // Mock implementation - replace with actual image service
  const image: GalleryImage = {
    id: imageId,
    userId,
    url: 'mock-url',
    prompt: null,
    style: null,
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
router.post('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: UpdateImageMetadataRequest }, res: ExpressResponse) => {
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
router.delete('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
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
router.get('/api/gallery/tracker/:trackerId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
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
router.get('/api/gallery/prediction/:predictionId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
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
router.post('/api/gallery/concept', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: GenerateConceptRequest }, res: ExpressResponse) => {
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
router.post('/api/gallery/style', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: GenerateStyleRequest }, res: ExpressResponse) => {
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
router.get('/api/debug/gallery-inspect', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
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