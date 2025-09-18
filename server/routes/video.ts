import express from 'express';
import { requireStackAuth } from '../stack-auth';
import { generateVeo3Video, getVeo3Status, getQualityPreset } from '../services/video/veo3';
import { db } from '../drizzle';
import { generatedVideos, generatedImages, aiImages } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = express.Router();

/**
 * POST /api/video/generate
 * Generate video using VEO 3 with enhanced options
 * Supports: mode (preview/production), audioScript, initImage
 */
router.post('/generate', requireStackAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if VEO3 is enabled
    if (!process.env.VEO3_ENABLED || process.env.VEO3_ENABLED !== '1') {
      return res.status(503).json({ 
        error: 'VEO 3 video generation is not enabled',
        details: 'Contact support for access to video generation features'
      });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(503).json({
        error: 'Video generation service not configured',
        details: 'Google API key not available'
      });
    }

    const { imageId, motionPrompt, mode = 'preview', audioScript, aspectRatio = '9:16' } = req.body;

    // Validate required parameters
    if (!motionPrompt || typeof motionPrompt !== 'string') {
      return res.status(400).json({ error: 'motionPrompt is required and must be a string' });
    }

    if (motionPrompt.trim().length < 8) {
      return res.status(400).json({ error: 'motionPrompt must be at least 8 characters long' });
    }

    if (!['preview', 'production'].includes(mode)) {
      return res.status(400).json({ error: 'mode must be either "preview" or "production"' });
    }

    if (!['16:9', '9:16', '1:1'].includes(aspectRatio)) {
      return res.status(400).json({ error: 'aspectRatio must be "16:9", "9:16", or "1:1"' });
    }

    let initImageUrl: string | undefined;
    let imageRecord: any = null;

    // If imageId provided, resolve to URL for init image
    if (imageId) {
      const parsedImageId = parseInt(imageId);
      if (Number.isNaN(parsedImageId)) {
        return res.status(400).json({ error: 'imageId must be a valid number' });
      }

      // Try generated images first
      imageRecord = await db.select().from(generatedImages)
        .where(and(
          eq(generatedImages.id, parsedImageId),
          eq(generatedImages.userId, userId)
        )).limit(1);

      if (imageRecord.length === 0) {
        // Try legacy images  
        imageRecord = await db.select().from(aiImages)
          .where(and(
            eq(aiImages.id, parsedImageId),
            eq(aiImages.userId, userId)
          )).limit(1);
      }

      if (imageRecord.length === 0) {
        return res.status(404).json({ error: 'Image not found or access denied' });
      }

      const record = imageRecord[0];
      initImageUrl = record.selectedUrl || record.imageUrl;

      // Handle JSON array of URLs if needed
      if (!initImageUrl && record.imageUrls) {
        try {
          const urls = Array.isArray(record.imageUrls) ? record.imageUrls : JSON.parse(record.imageUrls);
          initImageUrl = urls?.[0];
        } catch (e) {
          console.error('Error parsing image URLs:', e);
        }
      }

      if (!initImageUrl) {
        return res.status(400).json({ error: 'No usable image URL found for the provided imageId' });
      }
    }

    console.log('🎬 VEO 3: Generate request', {
      userId,
      imageId,
      hasInitImage: !!initImageUrl,
      mode,
      hasAudioScript: !!audioScript,
      motionPromptLength: motionPrompt.length,
      aspectRatio
    });

    // Start VEO 3 generation
    const result = await generateVeo3Video({
      motionPrompt,
      mode,
      audioScript,
      initImageUrl,
      userId,
      aspectRatio
    });

    // Save job to database
    const videoRecord = await db.insert(generatedVideos).values({
      userId,
      imageId: imageId ? parseInt(imageId) : null,
      imageSource: imageId ? 'generated' : null,
      motionPrompt,
      jobId: result.jobId,
      status: 'pending',
      progress: 0,
      estimatedTime: result.estimatedTime,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('✅ VEO 3: Job started and saved', { 
      jobId: result.jobId, 
      videoRecordId: videoRecord[0]?.id,
      estimatedTime: result.estimatedTime
    });

    res.json({
      success: true,
      jobId: result.jobId,
      videoId: videoRecord[0]?.id,
      provider: result.provider,
      estimatedTime: result.estimatedTime,
      mode,
      qualityPreset: getQualityPreset(mode),
      ...(result.audioWarning && { audioWarning: result.audioWarning })
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ VEO 3: Generate request failed', { 
      error: errorMessage,
      userId: req.user?.id,
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(500).json({
      error: 'Video generation failed',
      details: errorMessage
    });
  }
});

/**
 * GET /api/video/status/:jobId
 * Check the status of a video generation job
 */
router.get('/status/:jobId', requireStackAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Verify the job belongs to the user
    const videoRecord = await db.select().from(generatedVideos)
      .where(and(
        eq(generatedVideos.jobId, jobId),
        eq(generatedVideos.userId, userId)
      )).limit(1);

    if (videoRecord.length === 0) {
      return res.status(404).json({ error: 'Video job not found or access denied' });
    }

    // Get status from VEO 3 API
    const status = await getVeo3Status(jobId, userId);
    
    // Update database record if needed
    const record = videoRecord[0];
    const needsUpdate = 
      record.status !== status.status ||
      record.progress !== status.progress ||
      (status.videoUrl && !record.videoUrl);

    if (needsUpdate) {
      await db.update(generatedVideos)
        .set({
          status: status.status,
          progress: status.progress || record.progress,
          videoUrl: status.videoUrl || record.videoUrl,
          errorMessage: status.error || record.errorMessage,
          updatedAt: new Date(),
          ...(status.completedAt && { completedAt: new Date(status.completedAt) })
        })
        .where(eq(generatedVideos.id, record.id));
    }

    console.log('🔍 VEO 3: Status check', {
      jobId: jobId.slice(-20),
      status: status.status,
      progress: status.progress,
      hasVideoUrl: !!status.videoUrl
    });

    res.json({
      ...status,
      videoId: record.id,
      createdAt: record.createdAt,
      imageId: record.imageId
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ VEO 3: Status check failed', {
      jobId: req.params.jobId,
      error: errorMessage,
      userId: req.user?.id
    });

    res.status(500).json({
      error: 'Status check failed',
      details: errorMessage
    });
  }
});

/**
 * GET /api/video/history
 * Get user's video generation history
 */
router.get('/history', requireStackAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const videos = await db.select().from(generatedVideos)
      .where(eq(generatedVideos.userId, userId))
      .orderBy(desc(generatedVideos.createdAt))
      .limit(limit)
      .offset(offset);

    console.log('📚 VEO 3: History request', { 
      userId, 
      count: videos.length,
      limit,
      offset
    });

    res.json({
      videos: videos.map(video => ({
        id: video.id,
        imageId: video.imageId,
        motionPrompt: video.motionPrompt,
        status: video.status,
        progress: video.progress,
        videoUrl: video.videoUrl,
        estimatedTime: video.estimatedTime,
        createdAt: video.createdAt,
        completedAt: video.completedAt,
        errorMessage: video.errorMessage
      })),
      pagination: {
        limit,
        offset,
        hasMore: videos.length === limit
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ VEO 3: History request failed', {
      error: errorMessage,
      userId: req.user?.id
    });

    res.status(500).json({
      error: 'Failed to fetch video history',
      details: errorMessage
    });
  }
});

/**
 * POST /api/video/save
 * Save a generated video to user's favorites
 */
router.post('/save', requireStackAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Verify video exists and belongs to user
    const video = await db.select().from(generatedVideos)
      .where(and(
        eq(generatedVideos.id, videoId),
        eq(generatedVideos.userId, userId)
      )).limit(1);

    if (video.length === 0) {
      return res.status(404).json({ error: 'Video not found or access denied' });
    }

    if (video[0].status !== 'completed' || !video[0].videoUrl) {
      return res.status(400).json({ error: 'Video is not ready to be saved' });
    }

    // Mark as saved
    await db.update(generatedVideos)
      .set({ saved: true, updatedAt: new Date() })
      .where(eq(generatedVideos.id, videoId));

    console.log('💾 VEO 3: Video saved', { videoId, userId });

    res.json({
      success: true,
      message: 'Video saved to your collection'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ VEO 3: Save video failed', {
      error: errorMessage,
      userId: req.user?.id,
      videoId: req.body.videoId
    });

    res.status(500).json({
      error: 'Failed to save video',
      details: errorMessage
    });
  }
});

/**
 * GET /api/video/presets
 * Get available quality presets and their descriptions
 */
router.get('/presets', requireStackAuth, async (req, res) => {
  try {
    const presets = {
      preview: getQualityPreset('preview'),
      production: getQualityPreset('production')
    };

    res.json({ presets });
  } catch (error) {
    console.error('❌ VEO 3: Presets request failed', error);
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

export default router;