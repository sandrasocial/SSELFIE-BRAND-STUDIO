/**
 * POST /api/start-model-training - Pure Serverless
 * Accepts base64 selfie images, uploads to S3, creates ZIP and starts Replicate LoRA training.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth.js';
import type { AuthenticatedRequest } from '../_shared/auth-types.js';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers.js';
import { parseJsonBody } from '../_utils/request-helpers.js';
import { TrainingInitiator } from '../services/upload/training-initiator.js';
import * as fs from 'fs';
import * as path from 'path';

export const config = { runtime: 'nodejs', maxDuration: 40 } as const;

interface StartTrainingRequest {
  selfieImages: string[]; // base64 data URLs
  gender?: string; // 'woman' | 'man' | 'non-binary'
  retraining?: boolean; // optional flag to indicate retraining flow
}

function ensureTmpDir(): string {
  const tmpDir = path.join('/tmp', 'sselfie-training');
  try { if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true }); } catch {
      // Intentionally ignoring errors
    }
  return tmpDir;
}

function decodeBase64DataUrl(dataUrl: string): { buffer: Buffer; ext: string } {
  // data:[mime];base64,XXXXX
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error('Invalid image data');
  const mime = match[1] || 'image/jpeg';
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const buffer = Buffer.from(match[2], 'base64');
  return { buffer, ext };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return sendMethodNotAllowed(res, ['POST']);

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Authentication required', 401);

      const body = await parseJsonBody<StartTrainingRequest>(req);
      const selfieImages = body?.selfieImages || [];
      const gender = body?.gender;
      const isRetraining = !!(body as any)?.retraining;


      if (!Array.isArray(selfieImages) || selfieImages.length < 10) {
        return sendError(res, 'At least 10 selfie images are required', 400);
      }

      const tmpDir = ensureTmpDir();
      const localFiles: string[] = [];

      // Persist base64 images to temp files
      for (let i = 0; i < selfieImages.length; i++) {
        const img = selfieImages[i];
        try {
          const { buffer, ext } = decodeBase64DataUrl(img);
          const filename = `selfie_${userId}_${Date.now()}_${i}.${ext}`;
          const filePath = path.join(tmpDir, filename);
          fs.writeFileSync(filePath, buffer);
          localFiles.push(filePath);
        } catch (e) {
          console.error('Failed to decode image', i, e);
        }
      }

      if (localFiles.length < 10) {
        return sendError(res, 'Failed to process enough images for training', 400);
      }

      // Use unique per-user trigger word tied to model invocation
      const triggerWord = userId;

      // Kick off the complete upload + training pipeline
      const initiator = new TrainingInitiator();
      const result = await initiator.completeBulletproofUpload({
        userId,
        uploadedFiles: localFiles, // initiator will upload to S3 if local paths
        triggerWord,
        trainingConfig: {
          steps: 1200,
          learningRate: 0.0002,
          batchSize: 1,
          resolution: '1024'
        },
        notificationSettings: { sendUpdates: true }
      });

      // Cleanup temp files
      localFiles.forEach((f) => { try { fs.unlinkSync(f); } catch {
      // Intentionally ignoring errors
    } });

      if (!result.success) {
        return res.status(200).json({ success: false, errors: [result.message], next: result.nextSteps || [] });
      }

      return sendSuccess(res, { success: true, trainingId: result.trainingId, estimatedTime: result.estimatedTime }, 201);
    } catch (error: unknown) {
      console.error('❌ start-model-training error', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return sendError(res, `Failed to start training: ${message}`, 500);
    }
  });
}

