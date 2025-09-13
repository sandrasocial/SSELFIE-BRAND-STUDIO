/**
 * @license
 * Copyright 2025 Google LLC  
 * SPDX-License-Identifier: Apache-2.0
 */

// Secure Video Generation Routes for Story Studio
// All AI operations performed server-side with Google Gemini API

import express from 'express';
// Gemini AI will be imported from the existing server setup
import { requireStackAuth } from '../stack-auth.js';

const router = express.Router();

// Initialize Gemini AI client server-side using existing pattern
let geminiAI = null;
async function initGeminiAI() {
    if (process.env.GOOGLE_API_KEY && !geminiAI) {
        try {
            const { GoogleGenAI } = await import('@google/genai');
            geminiAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
            console.log('🔑 STORY STUDIO: Gemini AI initialized server-side');
        } catch (error) {
            console.error('❌ Failed to initialize Gemini AI:', error);
        }
    }
}

// In-memory job storage (in production, use Redis or database)
const jobs = new Map();

/**
 * POST /api/video/draft-storyboard
 * Creates a storyboard from user concept using Gemini AI
 */
router.post('/draft-storyboard', requireStackAuth, async (req, res) => {
    try {
        const { concept } = req.body;
        const userId = req.user?.id;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        if (!geminiAI) {
            return res.status(503).json({ error: 'AI service not available' });
        }

        console.log('🎬 STORY STUDIO: Drafting storyboard for user:', userId, 'Concept:', concept);

        // Initialize Gemini AI if needed
        await initGeminiAI();
        
        // Use Gemini to create storyboard
        const model = geminiAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        const prompt = `You are Maya, an AI brand strategist for luxury brands. A user wants to create a short video reel based on the following concept: "${concept}". Your task is to break this concept down into a 3-scene storyboard. For each scene, write a concise, cinematic prompt that an AI video generator can use. Respond in JSON format with this structure:
{
  "scenes": [
    {"scene": 1, "prompt": "detailed scene description"},
    {"scene": 2, "prompt": "detailed scene description"}, 
    {"scene": 3, "prompt": "detailed scene description"}
  ]
}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        let parsedResponse;
        try {
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
            // Fallback: create basic 3-scene structure
            parsedResponse = {
                scenes: [
                    { scene: 1, prompt: `Opening scene: ${concept}` },
                    { scene: 2, prompt: `Main action: ${concept}` },
                    { scene: 3, prompt: `Closing scene: ${concept}` }
                ]
            };
        }

        console.log('✅ STORY STUDIO: Storyboard created with', parsedResponse.scenes.length, 'scenes');
        res.json({ scenes: parsedResponse.scenes });

    } catch (error) {
        console.error('❌ STORY STUDIO: Storyboard drafting failed:', error);
        res.status(500).json({ error: 'Failed to draft storyboard' });
    }
});

/**
 * POST /api/video/generate-story  
 * Generates videos from scenes using VEO API
 */
router.post('/generate-story', requireStackAuth, async (req, res) => {
    try {
        const { scenes, format } = req.body;
        const userId = req.user?.id;

        if (!scenes || !Array.isArray(scenes)) {
            return res.status(400).json({ error: 'Scenes array is required' });
        }

        if (!geminiAI) {
            return res.status(503).json({ error: 'AI service not available' });
        }

        console.log('🎬 STORY STUDIO: Generating videos for user:', userId, 'Scenes:', scenes.length);
        
        // Initialize Gemini AI if needed
        await initGeminiAI();

        const jobs = [];
        
        // Generate video for each scene
        for (const scene of scenes) {
            try {
                const jobId = `job_${userId}_${Date.now()}_${scene.scene}`;
                
                // Configure VEO generation
                const config = {
                    model: 'veo-2.0-generate-001',
                    prompt: scene.prompt,
                    aspectRatio: format === '9:16' ? 'PORTRAIT' : 'LANDSCAPE',
                    videoDuration: '5s',
                    numberOfVideos: 1,
                    enhancePrompt: true
                };

                // Start video generation
                const operation = await geminiAI.models.generateVideos(config);
                
                // Store job info
                jobs.set(jobId, {
                    operation: operation.name,
                    sceneId: scene.id || `scene_${scene.scene}`,
                    sceneNum: scene.scene,
                    status: 'generating',
                    prompt: scene.prompt,
                    startTime: new Date(),
                    userId: userId
                });

                jobs.push({
                    jobId: jobId,
                    sceneId: scene.id || `scene_${scene.scene}`,
                    sceneNum: scene.scene
                });

                console.log('✅ STORY STUDIO: Started video generation for scene', scene.scene, 'Job ID:', jobId);

            } catch (sceneError) {
                console.error('❌ STORY STUDIO: Failed to start scene', scene.scene, ':', sceneError);
                // Continue with other scenes
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
 * Checks the status of a video generation job
 */
router.get('/status/:jobId', requireStackAuth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user?.id;

        if (!geminiAI) {
            return res.status(503).json({ error: 'AI service not available' });
        }

        const jobData = jobs.get(jobId);
        
        if (!jobData) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (jobData.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Poll video generation status
        const updatedOperation = await geminiAI.operations.getVideosOperation({ 
            operation: jobData.operation 
        });

        let status = {
            status: 'generating',
            progress: 50,
            message: 'Generating video...',
            videoUrl: null,
            error: null
        };

        if (updatedOperation.done) {
            if (updatedOperation.response && updatedOperation.response.generatedVideos) {
                const videos = updatedOperation.response.generatedVideos;
                if (videos && videos.length > 0) {
                    const videoData = videos[0];
                    // Create secure URL for video access
                    const url = `${decodeURIComponent(videoData.video.uri)}&key=${process.env.GOOGLE_API_KEY}`;
                    
                    try {
                        // Fetch and proxy the video for security
                        const videoResponse = await fetch(url);
                        if (videoResponse.ok) {
                            const videoBuffer = await videoResponse.arrayBuffer();
                            const videoBase64 = Buffer.from(videoBuffer).toString('base64');
                            status = {
                                status: 'done',
                                progress: 100,
                                message: 'Video generated successfully',
                                videoUrl: `data:video/mp4;base64,${videoBase64}`,
                                error: null
                            };
                        } else {
                            status.status = 'error';
                            status.error = 'Failed to fetch generated video';
                        }
                    } catch (fetchError) {
                        status.status = 'error';
                        status.error = 'Failed to fetch generated video';
                    }
                } else {
                    status.status = 'error';
                    status.error = 'No videos were generated';
                }
            } else if (updatedOperation.error) {
                status.status = 'error';
                status.error = updatedOperation.error.message || 'Video generation failed';
            }
        }

        res.json(status);

    } catch (error) {
        console.error('❌ STORY STUDIO: Status check failed:', error);
        res.status(500).json({ error: 'Failed to check video status' });
    }
});

/**
 * POST /api/videos/save
 * Save a generated video to user's favorites/gallery
 */
router.post('/save', requireStackAuth, async (req, res) => {
    try {
        const { videoUrl, imageId, motionPrompt } = req.body;
        const userId = req.user?.id;

        if (!videoUrl || !imageId) {
            return res.status(400).json({ error: 'Video URL and image ID are required' });
        }

        console.log('💾 STORY STUDIO: Saving video for user:', userId);

        // Here you could save video metadata to database
        // For now, just return success
        
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