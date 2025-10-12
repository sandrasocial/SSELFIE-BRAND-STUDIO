/**
 * AI Generation Routes Module
 * Handles story generation, video generation, Victoria AI, and Maya AI
 */

/// <reference path="../../../shared/types/global.d.ts" />
import express, { Router, Request, Response } from 'express';
import { requireStackAuth, requireActiveSubscription } from '../../stack-auth.js';
import { storage } from '../../storage.js';
import { ModelTrainingService } from '../../model-training-service.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { InsertAiImage } from '../../../shared/types-override.js';
import {
  AuthenticatedRequest,
  StoryConceptRequest,
  StoryStatus,
  VideoGenerationRequest,
  VideoStatus,
  VictoriaGenerationRequest,
  VictoriaCustomizationRequest,
  VictoriaDeploymentRequest,
  VictoriaWebsite,
  AIImageGenerationRequest,
  AIImage,
  MayaChat,
  SuccessResponse,
  ErrorResponse
} from '../../../shared/types/ai-generation.js';

const router = Router();

// Story Generation Routes
router.post('/api/story/draft', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { concept } = req.body as StoryConceptRequest;
  const userId = req.user.id;

  if (!concept) {
    throw createError.validation("Concept is required");
  }

  // TODO: Implement story draft generation
  const responseData: SuccessResponse<{ jobId: string; concept: string }> = {
    data: {
      jobId: `draft_${Date.now()}`,
      concept
    },
    message: 'Story draft generation started'
  };
  sendSuccess(res, responseData);
}));

router.post('/api/story/generate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { concept, style, length } = req.body as StoryConceptRequest;
  const userId = req.user.id;

  if (!concept) {
    throw createError.validation("Concept is required");
  }

  // TODO: Implement full story generation
  const responseData: SuccessResponse<{ jobId: string; concept: string; style?: string; length?: string }> = {
    data: {
      jobId: `story_${Date.now()}`,
      concept,
      style,
      length
    },
    message: 'Story generation started'
  };
  sendSuccess(res, responseData);
}));

router.get('/api/story/status/:jobId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  // TODO: Implement story status checking
  const status: StoryStatus = {
    jobId,
    status: 'processing',
    progress: 50,
    message: 'Story generation in progress'
  };
  
  const responseData: SuccessResponse<{ status: StoryStatus }> = {
    data: { status }
  };
  sendSuccess(res, responseData);
}));

// Video Generation Routes
router.post('/api/video/generate-story', requireActiveSubscription, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { story, style, duration } = req.body as VideoGenerationRequest;
  const userId = req.user.id;

  if (!story) {
    throw createError.validation("Story is required");
  }

  // TODO: Implement video generation from story
  const responseData: SuccessResponse<{ jobId: string; story: string; style?: string; duration?: number }> = {
    data: {
      jobId: `video_${Date.now()}`,
      story,
      style,
      duration
    },
    message: 'Video generation started'
  };
  sendSuccess(res, responseData);
}));

router.post('/api/video/generate', requireActiveSubscription, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, style, duration } = req.body as VideoGenerationRequest;
  const userId = req.user.id;

  if (!prompt) {
    throw createError.validation("Prompt is required");
  }

  // TODO: Implement general video generation
  const responseData: SuccessResponse<{ jobId: string; prompt: string; style?: string; duration?: number }> = {
    data: {
      jobId: `video_${Date.now()}`,
      prompt,
      style,
      duration
    },
    message: 'Video generation started'
  };
  sendSuccess(res, responseData);
}));

router.get('/api/videos', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const videos = await storage.getUserVideosByStatus(userId) as VideoStatus[];

  const responseData: SuccessResponse<{ videos: VideoStatus[]; count: number }> = {
    data: {
      videos,
      count: videos.length
    }
  };
  sendSuccess(res, responseData);
}));

// Victoria AI Routes
router.post('/api/victoria/generate', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, style, businessType } = req.body as VictoriaGenerationRequest;
  const userId = req.user.id;

  if (!prompt) {
    throw createError.validation("Prompt is required");
  }

  // TODO: Implement Victoria AI generation
  const responseData: SuccessResponse<{ jobId: string; prompt: string; style?: string; businessType?: string }> = {
    data: {
      jobId: `victoria_${Date.now()}`,
      prompt,
      style,
      businessType
    },
    message: 'Victoria AI generation started'
  };
  sendSuccess(res, responseData);
}));

router.post('/api/victoria/customize', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { contentId, customizations } = req.body as VictoriaCustomizationRequest;
  const userId = req.user.id;

  if (!contentId) {
    throw createError.validation("Content ID is required");
  }

  // TODO: Implement Victoria customization
  const responseData: SuccessResponse<{ contentId: string; customizations: Record<string, unknown> }> = {
    data: {
      contentId,
      customizations
    },
    message: 'Victoria content customized'
  };
  sendSuccess(res, responseData);
}));

router.post('/api/victoria/deploy', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { contentId, deploymentOptions } = req.body as VictoriaDeploymentRequest;
  const userId = req.user.id;

  if (!contentId) {
    throw createError.validation("Content ID is required");
  }

  // TODO: Implement Victoria deployment
  const responseData: SuccessResponse<{ contentId: string; deploymentOptions: VictoriaDeploymentRequest['deploymentOptions'] }> = {
    data: {
      contentId,
      deploymentOptions
    },
    message: 'Victoria content deployed'
  };
  sendSuccess(res, responseData);
}));

router.get('/api/victoria/websites', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;

  // TODO: Implement Victoria websites listing
  const responseData: SuccessResponse<{ websites: VictoriaWebsite[]; count: number }> = {
    data: {
      websites: [],
      count: 0
    }
  };
  sendSuccess(res, responseData);
}));

// AI Images Routes - Real Implementation
router.post('/api/ai-images', requireActiveSubscription, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, style, count, seed } = req.body as AIImageGenerationRequest;
  const userId = req.user.id;

  if (!prompt) {
    throw createError.validation("Prompt is required");
  }

  try {
    // Get user's model and LoRA weights
    const userModel = await storage.getUserModelByUserId(userId);
    if (!userModel || userModel.trainingStatus !== 'completed') {
      throw createError.validation('User model not ready. Please complete training first.');
    }

    // Generate images using ModelTrainingService
    const result = await ModelTrainingService.generateUserImages(
      userId,
      prompt,
      count || 2,
      { seed, categoryContext: style }
    );

    // Save generation to database
    const imageData = {
      userId,
      prompt,
      imageUrl: result.images[0] || '',
      style: style || 'ai-generated',
      predictionId: result.predictionId
    } as InsertAiImage;
    const savedImage = await storage.saveAIImage(imageData);

    const responseData: SuccessResponse<{
      jobId: string;
      generatedImage: AIImage;
      images: string[];
      prompt: string;
    }> = {
      data: {
        jobId: result.predictionId || 'no-prediction-id',
        generatedImage: {
          id: savedImage.id,
          userId: savedImage.userId,
          prompt: savedImage.prompt || '',
          generatedPrompt: savedImage.generatedPrompt || '',
          imageUrl: savedImage.imageUrl,
          style: savedImage.style || '',
          category: savedImage.category || '',
          source: savedImage.source || '',
          predictionId: savedImage.predictionId || '',
          generationStatus: savedImage.generationStatus || '',
          isSelected: savedImage.isSelected || false,
          isFavorite: savedImage.isFavorite || false,
          createdAt: savedImage.createdAt || new Date()
        },
        images: result.images,
        prompt
      },
      message: 'AI image generation completed successfully'
    };
    
    sendSuccess(res, responseData);

  } catch (error) {
    console.error('❌ AI Images: Generation failed:', error);
    throw createError.internal('Image generation failed');
  }
}));

router.get('/api/ai-images', requireActiveSubscription, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const images = await storage.getUserAIImages(userId) as AIImage[];

  const responseData: SuccessResponse<{
    images: AIImage[];
    count: number;
  }> = {
    data: {
      images,
      count: images.length
    }
  };
  
  sendSuccess(res, responseData);
}));

// Maya AI Routes
router.get('/api/maya-chats', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const chats = await storage.getMayaChats(userId) as MayaChat[];

  const responseData: SuccessResponse<{
    chats: MayaChat[];
    count: number;
  }> = {
    data: {
      chats,
      count: chats.length
    }
  };
  
  sendSuccess(res, responseData);
}));

router.get('/api/maya-chats/categorized', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;

  // TODO: Implement categorized Maya chats
  const responseData: SuccessResponse<{
    categories: string[];
    chats: MayaChat[];
    count: number;
  }> = {
    data: {
      categories: [],
      chats: [],
      count: 0
    }
  };
  
  sendSuccess(res, responseData);
}));

export default router;