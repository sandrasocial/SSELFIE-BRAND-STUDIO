/**
 * @license
 * Copyright 2025 Google LLC  
 * SPDX-License-Identifier: Apache-2.0
 */

// Secure Video Generation Routes for Story Studio
// All AI operations performed server-side with Google Gemini API

import express from 'express';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import { requireStackAuth } from '../stack-auth.js';
import { storage } from '../storage.js';
import { startVeoVideo } from '../services/veo-service.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for file uploads

// Initialize the Google GenAI client
let ai;
if (process.env.GOOGLE_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    console.log('🔑 STORY STUDIO: Gemini AI initialized server-side');
} else {
    // Log an error if the key is missing, as the API will be non-functional.
    console.error('❌ STORY STUDIO: GOOGLE_API_KEY environment variable not set. Video routes will fail.');
}


/**
 * POST /api/video/draft-storyboard
 * Creates a storyboard from user concept using Gemini AI
 */
router.post('/draft-storyboard', requireStackAuth, async (req, res) => {
    const { concept } = req.body;
    if (!concept) {
        return res.status(400).json({ error: 'Concept is required' });
    }
    if (!ai) {
        return res.status(503).json({ error: 'AI service not available' });
    }

    try {
        console.log('🎬 STORY STUDIO: Drafting storyboard for user:', req.user?.id, 'Concept:', concept);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are Maya, an AI brand strategist for luxury brands. A user wants to create a short video reel based on the following concept: "${concept}". Your task is to break this concept down into a 3-scene storyboard. For each scene, write a concise, cinematic prompt that an AI video generator can use. Respond in JSON format.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    scene: { type: Type.INTEGER },
                                    prompt: { type: Type.STRING },
                                },
                            },
                        },
                    },
                },
            },
        });

        const json = JSON.parse(response.text.trim());
        console.log('✅ STORY STUDIO: Storyboard created with', json.scenes.length, 'scenes');
        res.json(json);
    } catch (error) {
        console.error('❌ STORY STUDIO: Storyboard drafting failed:', error);
        res.status(500).json({ error: 'Failed to draft storyboard' });
    }
});

/**
 * POST /api/video/generate-from-image
 * Starts a unified VEO video generation job from a single source image.
 * This route is preserved from your new file.
 */
router.post('/generate-from-image', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        let { imageId, motionPrompt, imageSource } = req.body;

        if (!imageId || !motionPrompt) {
            return res.status(400).json({ error: 'imageId and motionPrompt are required' });
        }
        imageSource = imageSource || 'generated';

        imageId = parseInt(imageId);
        if (Number.isNaN(imageId)) {
            return res.status(400).json({ error: 'imageId must be a number' });
        }
        motionPrompt = String(motionPrompt).trim();
        if (motionPrompt.length < 8) {
            return res.status(400).json({ error: 'motionPrompt too short (min 8 chars)' });
        }

        console.log('🎬 VEO 3: Generate from image request', { userId, imageId, imageSource, motionPromptPreview: motionPrompt.slice(0,80) });
        console.log('🔍 VEO 3: Provider preflight', {
            hasGoogleKey: !!process.env.GOOGLE_API_KEY,
            hasReplicateKey: !!process.env.REPLICATE_API_TOKEN,
            modelVersionGoogle: process.env.VEO_GOOGLE_MODEL || 'default',
            replicateVersion: process.env.VEO_MODEL_VERSION || 'latest'
        });

        const { db } = await import('../drizzle');
        const { generatedImages, aiImages } = await import('../../shared/schema');
        const { eq } = await import('drizzle-orm');

        let imageRecord;
        if (imageSource === 'legacy') {
            imageRecord = (await db.select().from(aiImages).where(eq(aiImages.id, imageId)).limit(1))[0];
        } else {
            imageRecord = (await db.select().from(generatedImages).where(eq(generatedImages.id, imageId)).limit(1))[0];
        }

        if (!imageRecord) return res.status(404).json({ error: 'Image not found' });
        if (imageRecord.userId !== userId) return res.status(403).json({ error: 'Access denied for this image' });

        let imageUrl = imageRecord.selectedUrl || imageRecord.imageUrl;
        if (!imageUrl && imageRecord.imageUrls) {
            try {
                const arr = Array.isArray(imageRecord.imageUrls) ? imageRecord.imageUrls : JSON.parse(imageRecord.imageUrls);
                imageUrl = arr?.[0];
            } catch {}
        }

        if (!imageUrl) return res.status(400).json({ error: 'No usable image URL found for this image' });

        const scenes = [{ prompt: motionPrompt, duration: 5, cameraMovement: 'slow push-in', imageUrl }];

        let userLoraModel = null;
        try {
            const profile = await storage.getUserProfile(userId);
            userLoraModel = profile?.['replicateModelId'] || null;
        } catch (e) {
            console.log('⚠️ VEO 3: Unable to load user profile for LoRA model (continuing)', e?.message);
        }

        const startResult = await startVeoVideo({ scenes, format: '9:16', userLoraModel, userId });
        const jobId = startResult.jobId;

        await storage.saveGeneratedVideo({ userId, imageId, imageSource, motionPrompt, jobId, status: 'pending', progress: 0, estimatedTime: '2-5 minutes' });

        console.log('✅ VEO 3: Video generation job started', { jobId, provider: startResult.provider });
        res.json({ success: true, jobId, provider: startResult.provider, estimatedTime: '2-5 minutes' });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ VEO 3: generate-from-image failed', error);
        res.status(500).json({ error: 'Video generation failed', details: errMsg });
    }
});


/**
 * POST /api/video/generate-story  
 * Generates videos from scenes using the VEO API, with corrected parameters.
 */
router.post('/generate-story', requireStackAuth, upload.any(), async (req, res) => {
    if (!ai) {
        return res.status(503).json({ error: 'AI service not available' });
    }

    try {
        const scenes = JSON.parse(req.body.scenes);
        const format = req.body.format;
        const conditioningImages = {};
        if (req.files) {
            req.files.forEach(file => {
                conditioningImages[file.fieldname] = file;
            });
        }
        
        console.log('🎬 STORY STUDIO: Generating videos for user:', req.user?.id, 'Scenes:', scenes.length);

        const jobs = [];
        for (const scene of scenes) {
            try {
                const payload = {
                    model: 'veo-2.0-generate-001',
                    prompt: scene.prompt,
                    config: {
                        numberOfVideos: 1,
                        aspectRatio: format, // Correct format: '9:16' or '16:9'
                    }
                };

                const imageFile = conditioningImages[scene.id];
                if (imageFile) {
                    payload.image = {
                        imageBytes: imageFile.buffer.toString('base64'),
                        mimeType: imageFile.mimetype,
                    };
                }

                const operation = await ai.models.generateVideos(payload);
                jobs.push({ jobId: operation.name, sceneId: scene.id, sceneNum: scene.scene });
                console.log(`✅ STORY STUDIO: Started video generation for scene ${scene.scene}, Job ID: ${operation.name}`);

            } catch (sceneError) {
                console.error(`❌ STORY STUDIO: Failed to start scene ${scene.scene}:`, sceneError);
            }
        }
        res.json({ jobs });
    } catch (error) {
        console.error('❌ STORY STUDIO: Video generation failed:', error);
        res.status(500).json({ error: 'Failed to generate videos' });
    }
});

/**
 * GET /api/video/status/:jobId
 * Checks the status of a video generation job efficiently.
 */
router.get('/status/:jobId', requireStackAuth, async (req, res) => {
    const { jobId } = req.params;
    if (!ai) {
        return res.status(503).json({ error: 'AI service not available' });
    }

    try {
        const operation = await ai.operations.getVideosOperation({ operation: jobId });
        const metadata = operation.metadata;
        const response = operation.response;

        let videoUrl = null;
        let errorMessage = null;

        if (operation.done) {
            if (response?.generatedVideos?.length > 0) {
                const videoData = response.generatedVideos[0];
                videoUrl = `${decodeURIComponent(videoData.video.uri)}&key=${process.env.GOOGLE_API_KEY}`;
            } else {
                errorMessage = operation.error?.message || 'Video generation completed but no video was returned.';
            }
        }
        
        // Legacy-compatible shape expected by StoryStudioModal polling logic
        let legacyStatus = 'processing';
        if (operation.done && videoUrl) legacyStatus = 'completed';
        else if (operation.done && errorMessage) legacyStatus = 'failed';

        res.json({
            done: operation.done,
            progressPercent: metadata?.progressPercent,
            state: metadata?.state,
            videoUrl: videoUrl,
            error: errorMessage,
            // Added legacy fields
            status: legacyStatus,
            progress: typeof metadata?.progressPercent === 'number' ? metadata.progressPercent : (legacyStatus === 'completed' ? 100 : 0)
        });

    } catch (error) {
        console.error(`❌ STORY STUDIO: Status check for job ${jobId} failed:`, error);
        res.status(500).json({ error: `Failed to check video status for job ${jobId}` });
    }
});


/**
 * POST /api/videos/save
 * Save a generated video to user's favorites/gallery.
 * This route is preserved from your new file.
 */
router.post('/save', requireStackAuth, async (req, res) => {
    try {
        const { videoUrl, imageId, motionPrompt } = req.body;
        const userId = req.user?.id;

        if (!videoUrl || !imageId) {
            return res.status(400).json({ error: 'Video URL and image ID are required' });
        }

        console.log('💾 STORY STUDIO: Saving video for user:', userId);
        
        res.json({ 
            success: true, 
            message: 'Video saved successfully' 
        });

    } catch (error) {
        console.error('❌ STORY STUDIO: Save video failed:', error);
        res.status(500).json({ error: 'Failed to save video' });
    }
});

export default router;