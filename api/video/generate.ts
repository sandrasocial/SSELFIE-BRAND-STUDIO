/**
 * POST /api/video/generate - Generate video using VEO 3
 * Generates video from image with motion prompt
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed } from '../_utils/response-helpers';
import { generateVeo3Video } from '../../server/services/video/veo3';
import { storage } from '../../server/storage';
import { db } from '../../server/drizzle';
import { generatedImages, aiImages } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface VideoGenerateBody {
  imageId?: string;
  motionPrompt: string;
  mode?: 'preview' | 'production';
  audioScript?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Check if VEO3 is enabled
      if (!process.env.VEO3_ENABLED || process.env.VEO3_ENABLED !== '1') {
        return sendError(res, 'VEO 3 video generation is not enabled', 503);
      }

      if (!process.env['GOOGLE_API_KEY']) {
        return sendError(res, 'Video generation service not configured', 503);
      }

      const { imageId, motionPrompt, mode = 'preview', audioScript, aspectRatio = '9:16' } = req.body as VideoGenerateBody;

      // Validate required parameters
      if (!motionPrompt || typeof motionPrompt !== 'string') {
        return sendError(res, 'motionPrompt is required and must be a string', 400);
      }

      if (motionPrompt.trim().length < 8) {
        return sendError(res, 'motionPrompt must be at least 8 characters long', 400);
      }

      if (!['preview', 'production'].includes(mode)) {
        return sendError(res, 'mode must be either "preview" or "production"', 400);
      }

      let initImageUrl: string | undefined;

      // If imageId provided, fetch the image
      if (imageId) {
        const parsedImageId = parseInt(imageId);
        if (isNaN(parsedImageId)) {
          return sendError(res, 'Invalid imageId format', 400);
        }

        // Try generated images first
        let imageRecord = (await db.select().from(generatedImages)
          .where(and(
            eq(generatedImages.id, parsedImageId),
            eq(generatedImages.userId, userId)
          )).limit(1)) as any;

        if (imageRecord.length === 0) {
          // Try legacy images
          imageRecord = (await db.select().from(aiImages)
            .where(and(
              eq(aiImages.id, parsedImageId),
              eq(aiImages.userId, userId)
            )).limit(1)) as any;
        }

        if (imageRecord.length === 0) {
          return sendError(res, 'Image not found or access denied', 404);
        }

        const record = imageRecord[0];
        initImageUrl = record.selectedUrl || (record as any).imageUrl || (record as any).imageUrls;

        // Handle JSON array of URLs if needed
        if (!initImageUrl && (record as any).imageUrls) {
          try {
            const urls = JSON.parse((record as any).imageUrls);
            initImageUrl = Array.isArray(urls) ? urls[0] : urls;
          } catch {
            initImageUrl = (record as any).imageUrls;
          }
        }
      }

      // Generate video
      const result = await generateVeo3Video({
        userId,
        motionPrompt,
        initImageUrl,
        mode,
        audioScript,
        aspectRatio,
      });

      return res.status(200).json({
        jobId: result.jobId,
        status: 'processing',
        estimatedTime: mode === 'preview' ? '30-60 seconds' : '2-5 minutes',
      });
    } catch (error: unknown) {
      console.error('[ERROR] /api/video/generate:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return sendError(res, `Video generation failed: ${errorMessage}`, 500);
    }
  });
}

