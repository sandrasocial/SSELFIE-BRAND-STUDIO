/**
 * Video Storyboard API Routes
 * Multi-scene video composition endpoint
 */

import * as express from 'express';
import { Request, Response } from 'express';
import { requireStackAuth } from '../stack-auth.js'
import { GoogleGenAI, Type } from '@google/genai';
import { StackAuthUser } from '../stack-auth.js';

// Define request types for type safety
interface AuthenticatedRequest extends Request {
  user: StackAuthUser;
}

interface StoryboardScene {
  motionPrompt: string;
  duration?: number;
  useSourceImage?: boolean;
}

interface StoryboardRequestBody {
  imageId?: number;
  scenes: StoryboardScene[];
  mode?: 'sequential';
}

interface StoryboardParams extends Record<string, string> {
  storyboardId: string;
}

// Type for the video generation payload
interface VideoGenerationPayload {
  model: string;
  prompt: string;
  config: {
    numberOfVideos: number;
    aspectRatio: string;
    durationSeconds: number;
  };
  image?: {
    imageUrl: string;
  };
}

const router = express.Router();

// Initialize the Google GenAI client (following existing video route pattern)
let ai: GoogleGenAI | null = null;
if (process.env['GOOGLE_API_KEY']) {
  ai = new GoogleGenAI({ apiKey: process.env['GOOGLE_API_KEY'] });
} else {
  console.error('❌ STORYBOARD: GOOGLE_API_KEY environment variable not set. Storyboard routes will fail.');
}

/**
 * POST /api/video/storyboard
 * Create and compose multi-scene storyboard
 */
router.post('/storyboard', requireStackAuth, async (req: Request<{}, {}, StoryboardRequestBody>, res: Response) => {
  // Check if storyboard feature is enabled
  if (!process.env.STORYBOARD_ENABLED || process.env.STORYBOARD_ENABLED !== '1') {
    return res.status(403).json({ 
      error: 'Storyboard feature not enabled',
      code: 'STORYBOARD_DISABLED' 
    });
  }

  if (!ai) {
    return res.status(503).json({ error: 'AI service not available' });
  }

  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const { imageId, scenes, mode = 'sequential' } = req.body;

    // Validation
    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({ error: 'scenes array is required' });
    }

    if (scenes.length < 2 || scenes.length > 3) {
      return res.status(400).json({ error: 'Must have 2-3 scenes' });
    }

    // Validate each scene
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.motionPrompt || typeof scene.motionPrompt !== 'string') {
        return res.status(400).json({ error: `Scene ${i + 1} missing motionPrompt` });
      }
      if (scene.motionPrompt.length < 8) {
        return res.status(400).json({ error: `Scene ${i + 1} motionPrompt too short (min 8 chars)` });
      }
      if (scene.duration && (scene.duration < 1 || scene.duration > 12)) {
        return res.status(400).json({ error: `Scene ${i + 1} duration must be 1-12 seconds` });
      }
    }

    console.log('📹 STORYBOARD: Starting multi-scene generation:', {
      userId,
      sceneCount: scenes.length,
      mode,
      imageId: imageId || 'none'
    });

    const { db } = await import('../drizzle.js');
    const { videoStoryboards } = await import('../../shared/schema.js');
    const { storage } = await import('../storage.js');

    // Get source image if provided
    let sourceImageUrl: string | null = null;
    if (imageId) {
      try {
        const { generatedImages, aiImages } = await import('../../shared/schema.js');
        const { eq } = await import('drizzle-orm');
        
        // Try generated images first
        const generatedImageResults = await db.select().from(generatedImages).where(eq(generatedImages.id, imageId)).limit(1);
        const imageRecord = generatedImageResults[0];
        
        // Fall back to legacy ai images if not found in generated images
        if (!imageRecord) {
          const aiImageResults = await db.select().from(aiImages).where(eq(aiImages.id, imageId)).limit(1);
          const aiImageRecord = aiImageResults[0];
          
          if (aiImageRecord && aiImageRecord.userId === userId) {
            // Convert aiImages record to match expected structure
            sourceImageUrl = aiImageRecord.imageUrl || null;
            
            // aiImages table doesn't have imageUrls field, only imageUrl
            // No need to parse JSON for aiImages
          }
        } else if (imageRecord && imageRecord.userId === userId) {
          // Handle generatedImages record
          sourceImageUrl = imageRecord.selectedUrl || null;
          
          // Try parsing imageUrls if no direct URL
          if (!sourceImageUrl && typeof imageRecord.imageUrls === 'string') {
            try {
              const urls = JSON.parse(imageRecord.imageUrls);
              sourceImageUrl = Array.isArray(urls) ? urls[0] : null;
            } catch {
              // Ignore JSON parse errors
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ STORYBOARD: Could not load source image, proceeding without:', error instanceof Error ? error.message : String(error));
      }
    }

    // Get user's LoRA model for personalization
    let userLoraModel = null;
    try {
      const profile = await storage.getUserProfile(userId);
      userLoraModel = (profile as any)?.replicateModelId || null;
    } catch (error) {
      // Silently handle profile loading errors
    }

    // Generate videos for each scene sequentially using existing VEO infrastructure
    const sceneJobs = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const duration = scene.duration || 5; // Default 5 seconds
      
      console.log('🎬 STORYBOARD: Generating scene video:', {
        motionPrompt: scene.motionPrompt.slice(0, 50) + '...',
        duration
      });

      try {
        // Use the same payload structure as the existing generate-story route
        const payload: VideoGenerationPayload = {
          model: 'veo-2.0-generate-001',
          prompt: scene.motionPrompt,
          config: {
            numberOfVideos: 1,
            aspectRatio: '9:16', // Standard format for mobile
            durationSeconds: duration
          }
        };

        // Add source image if available (for first scene or if specified per scene)
        if (sourceImageUrl && (i === 0 || scene.useSourceImage)) {
          payload.image = sourceImageUrl as any;
        }

        console.log('🎬 STORYBOARD: Scene payload prepared:', {
          model: payload.model,
          aspectRatio: payload.config.aspectRatio,
          duration: payload.config.durationSeconds
        });

        const operation = await ai.models.generateVideos(payload as any);
        
        sceneJobs.push({
          sceneIndex: i,
          scenePrompt: scene.motionPrompt.slice(0, 100), // For tracking
          jobId: operation.name,
          status: 'pending',
          duration
        });


      } catch (sceneError) {
        console.error(`❌ STORYBOARD: Scene ${i + 1} generation failed:`, sceneError);
        
        // Add failed job for tracking
        sceneJobs.push({
          sceneIndex: i,
          scenePrompt: scene.motionPrompt.slice(0, 100),
          jobId: '',
          status: 'failed',
          duration: scene.duration || 5,
          error: (sceneError as Error)?.message || 'Scene generation failed'
        });
      }
    }

    // Create storyboard record in database
    const storyboardJobId = `storyboard_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const storyboardRecord = {
      userId,
      scenes: JSON.stringify(scenes), // Store original scene definitions
      mode,
      status: sceneJobs.some(job => job.status === 'failed') ? 'failed' : 'pending',
      progress: 0,
      jobId: storyboardJobId
    };

    await db.insert(videoStoryboards).values(storyboardRecord);

    // Prepare response
    const failedScenes = sceneJobs.filter(job => job.status === 'failed');
    const response = {
      success: true,
      storyboardId: storyboardJobId,
      sceneCount: scenes.length,
      scenesStarted: sceneJobs.filter(job => job.status === 'pending').length,
      scenesFailed: failedScenes.length,
      sceneJobs: sceneJobs.map(job => ({
        sceneIndex: job.sceneIndex,
        jobId: job.jobId,
        status: job.status,
        ...(job.error && { error: job.error })
      })),
      estimatedTime: `${scenes.length * 3}-${scenes.length * 5} minutes`,
      status: failedScenes.length === scenes.length ? 'failed' : 
              failedScenes.length > 0 ? 'partial' : 'pending'
    };

    if (failedScenes.length === scenes.length) {
      return res.status(500).json({
        ...response,
        error: 'All scenes failed to start generation'
      });
    }

    console.log('📹 STORYBOARD: Multi-scene generation completed:', {
      storyboardId: storyboardJobId,
      scenesStarted: response.scenesStarted,
      scenesFailed: response.scenesFailed
    });

    res.json(response);

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ STORYBOARD: Multi-scene generation failed:', error);
    res.status(500).json({ 
      error: 'Storyboard generation failed', 
      details: errMsg 
    });
  }
});

/**
 * GET /api/video/storyboard/:storyboardId
 * Check storyboard composition status
 */
router.get('/storyboard/:storyboardId', requireStackAuth, async (req: Request<StoryboardParams>, res: Response) => {
  if (!process.env.STORYBOARD_ENABLED || process.env.STORYBOARD_ENABLED !== '1') {
    return res.status(403).json({ 
      error: 'Storyboard feature not enabled',
      code: 'STORYBOARD_DISABLED' 
    });
  }

  if (!ai) {
    return res.status(503).json({ error: 'AI service not available' });
  }

  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const { storyboardId } = req.params;

    const { db } = await import('../drizzle.js');
    const { videoStoryboards } = await import('../../shared/schema.js');
    const { eq } = await import('drizzle-orm');

    // Get storyboard record
    const storyboard = (await db
      .select()
      .from(videoStoryboards)
      .where(eq(videoStoryboards.jobId, storyboardId))
      .limit(1))[0];

    if (!storyboard) {
      return res.status(404).json({ error: 'Storyboard not found' });
    }

    if (storyboard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If already completed or failed, return cached result
    if (storyboard.status === 'completed' || storyboard.status === 'failed') {
      return res.json({
        storyboardId,
        status: storyboard.status,
        progress: storyboard.progress,
        composedVideoUrl: storyboard.composedVideoUrl,
        ...(storyboard.errorMessage && { error: storyboard.errorMessage }),
        updatedAt: storyboard.updatedAt
      });
    }

    // For pending/processing storyboards, we would need to:
    // 1. Check status of individual scene jobs
    // 2. If all scenes are complete, compose them with ffmpeg
    // 3. Update database with final result

    // For now, return processing status

    res.json({
      storyboardId,
      status: storyboard.status,
      progress: storyboard.progress,
      message: 'Scenes are being generated. Full composition pending implementation.',
      scenes: typeof storyboard.scenes === 'string' ? JSON.parse(storyboard.scenes) : storyboard.scenes,
      updatedAt: storyboard.updatedAt
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ STORYBOARD: Status check failed:', error);
    res.status(500).json({ 
      error: 'Status check failed', 
      details: errMsg 
    });
  }
});

export default router;

