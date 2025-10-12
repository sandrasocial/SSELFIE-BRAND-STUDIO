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

// ========================================
// MIGRATION NOTE: Core Gallery Endpoints
// ========================================
// The following endpoints have been migrated to pure serverless:
// - GET  /api/gallery          → server/api/gallery/images.ts (Phase 1)
// - GET  /api/gallery-images   → server/api/gallery/images.ts (Phase 1)
// - GET  /api/images/favorites → server/api/gallery/favorites.ts (Phase 2)
// - POST /api/images/:id/favorite → server/api/gallery/favorite-toggle.ts (Phase 2)
// - DELETE /api/ai-images/:id  → server/api/gallery/delete.ts (Phase 3)
//
// Express Router code removed in Phase 4 cleanup (203 lines).
// These routes are now handled by pure Vercel serverless functions.
// ========================================

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