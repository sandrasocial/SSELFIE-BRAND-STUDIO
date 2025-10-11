/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Secure Maya Chat Routes
// All AI operations performed server-side with Anthropic Claude API

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireStackAuth } from '../stack-auth.js';
import { PersonalityManager } from '../agents/personalities/personality-config.js';

const router = express.Router();

// Initialize Claude AI client server-side using existing pattern
const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const DEFAULT_MODEL_STR = 'claude-3-5-sonnet-20241022';

/**
 * POST /api/maya/chat
 * Secure Maya chat endpoint with server-side Claude integration
 */
router.post('/chat', requireStackAuth, async (req, res) => {
    try {
        const { message, history } = req.body;
        const userId = req.user?.id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }


        // Get Maya's complete personality prompt from the personality system
        const systemPrompt = PersonalityManager.getNaturalPrompt('maya');

        // Build conversation context (limit to last 10 exchanges to prevent context overflow)
        const conversationMessages = [];
        if (history && Array.isArray(history)) {
            // Take only the last 10 messages to prevent context from getting too long
            const recentHistory = history.slice(-10);
            recentHistory.forEach(entry => {
                if (entry.user) {
                    conversationMessages.push({
                        role: 'user',
                        content: entry.user
                    });
                }
                if (entry.maya) {
                    conversationMessages.push({
                        role: 'assistant',
                        content: entry.maya
                    });
                }
            });
        }
        conversationMessages.push({
            role: 'user',
            content: message
        });

        // Use Claude for Maya's personality and responses
        const response = await anthropic.messages.create({
            model: DEFAULT_MODEL_STR,
            max_tokens: 4096,
            temperature: 0.7,
            system: systemPrompt,
            messages: conversationMessages
        });

        const mayaResponse = response.content[0].type === 'text' ? response.content[0].text : '';

        // Extract concept cards using Maya's personality-trained format
        const conceptCards = [];
        try {
            console.log('🔍 MAYA: Extracting concept cards from response:', mayaResponse.substring(0, 800));
            
            // Enhanced regex for Maya's personality format: [EMOJI] **CONCEPT NAME IN ALL CAPS**
            const conceptSections = mayaResponse.split('---').filter(section => section.trim().length > 50);
            
            for (const section of conceptSections) {
                // Maya's trained format: [EMOJI] **CONCEPT NAME** \n Description \n FLUX_PROMPT: [prompt]
                const conceptPattern = /([^\w\s])\s*\*\*([^*]+)\*\*\s*[\r\n]+([^]+?)[\r\n]+\s*FLUX_PROMPT:\s*\[([^\]]+)\]/gm;
                
                let match;
                while ((match = conceptPattern.exec(section)) !== null) {
                    const emoji = match[1].trim();
                    const title = match[2].trim();
                    const description = match[3].trim().substring(0, 300); // Limit description
                    const fluxPrompt = match[4].trim();

                    if (title && description && fluxPrompt && title.length > 3 && description.length > 20) {
                        console.log(`✅ MAYA: Extracted concept - ${title} with ${fluxPrompt.length} char prompt`);
                        conceptCards.push({
                            id: `concept_${Date.now()}_${conceptCards.length}`,
                            title: title,
                            description: description,
                            fluxPrompt: fluxPrompt,
                            creativeLook: 'Professional',
                            emoji: emoji
                        });
                    }
                }
            }
            
            // Backup pattern for simpler format (if personality training isn't followed)
            if (conceptCards.length === 0) {
                console.log('🔄 MAYA: Trying backup extraction patterns...');
                const backupPattern = /([^\w\s])\s*\*\*([^*]+)\*\*\s*[\r\n]+([^]+?)(?=\n\n|$)/gm;
                
                let backupMatch;
                while ((backupMatch = backupPattern.exec(mayaResponse)) !== null && conceptCards.length < 4) {
                    const emoji = backupMatch[1].trim();
                    const title = backupMatch[2].trim();
                    const description = backupMatch[3].trim().substring(0, 200);

                    if (title && description && title.length > 3 && description.length > 20) {
                        // Generate a basic FLUX prompt if not provided
                        const basicFluxPrompt = `Professional portrait of sandra, ${title.toLowerCase()}, ${description.substring(0, 100)}, high-quality photography, perfect lighting, elegant composition`;
                        
                        conceptCards.push({
                            id: `concept_${Date.now()}_${conceptCards.length}`,
                            title: title,
                            description: description,
                            fluxPrompt: basicFluxPrompt,
                            creativeLook: 'Professional',
                            emoji: emoji
                        });
                    }
                }
            }

            // If no emoji-based concepts found, try legacy patterns
            if (conceptCards.length === 0) {
                const conceptPatterns = [
                    // Format: **Concept Title**: Description
                    /\*\*([^*\n]+)\*\*:\s*([^\n*]+)/g,
                    // Format: ### Concept Title\nDescription
                    /###\s*([^\n]+)\n([^\n#]+)/g,
                    // Format: - **Title**: Description
                    /-\s*\*\*([^*\n]+)\*\*:\s*([^\n-]+)/g,
                    // Format: 1. Title: Description
                    /(\d+)\.\s*([^\n:]+):\s*([^\n\d]+)/g,
                    // Format: Concept: Title\nDescription: desc
                    /concept:\s*([^\n]+)\ndescription:\s*([^\n]+)/gi,
                    // Format: Title: something\nPrompt: something
                    /title:\s*([^\n]+)\nprompt:\s*([^\n]+)/gi
                ];

                for (const pattern of conceptPatterns) {
                    let match;
                    while ((match = pattern.exec(mayaResponse)) !== null) {
                        let title = '', description = '';

                        if (match[1] && match[2]) {
                            title = match[1].trim();
                            description = match[2].trim();
                        } else if (match[2] && match[3]) {
                            title = match[2].trim();
                            description = match[3].trim();
                        }

                        if (title && description && title.length > 3 && description.length > 10) {
                            conceptCards.push({
                                id: `concept_${Date.now()}_${conceptCards.length}`,
                                title: title,
                                description: description,
                                creativeLook: 'Professional',
                                emoji: '📸'
                            });
                        }
                    }
                }
            }

            // Fallback: if no structured concepts found, try to extract from general suggestions
            if (conceptCards.length === 0) {
                const responseText = mayaResponse.toLowerCase();
                if (responseText.includes('concept') || responseText.includes('idea')) {
                    const sentences = mayaResponse.split(/[.!?]+/).filter(s =>
                        s.toLowerCase().includes('concept') ||
                        s.toLowerCase().includes('idea') ||
                        s.toLowerCase().includes('photo')
                    );

                    sentences.slice(0, 3).forEach((sentence, index) => {
                        const cleanSentence = sentence.trim();
                        if (cleanSentence.length > 20) {
                            conceptCards.push({
                                id: `fallback_concept_${Date.now()}_${index}`,
                                title: `Photo Concept ${index + 1}`,
                                description: cleanSentence,
                                creativeLook: 'Creative',
                                emoji: '💡'
                            });
                        }
                    });
                }
            }
        } catch (parseError) {
        }


        res.json({
            response: mayaResponse,
            conceptCards: conceptCards
        });

    } catch (error) {
        console.error('❌ MAYA: Chat failed:', error);
        res.status(500).json({
            error: 'Failed to process chat message',
            response: "I'm temporarily unable to respond. Please try again in a moment.",
            conceptCards: []
        });
    }
});

/**
 * POST /api/maya/generate
 * Generate images from Maya's concept cards using FLUX
 */
router.post('/generate', requireStackAuth, async (req, res) => {
    try {
        const { conceptCard, conversationId } = req.body;
        const userId = req.user?.id;

        if (!conceptCard || !conceptCard.fluxPrompt) {
            return res.status(400).json({ error: 'Concept card with FLUX prompt is required' });
        }


        // For now, simulate image generation with mock URLs
        // TODO: Integrate with actual FLUX/Replicate API
        const mockImages = [
            `https://picsum.photos/1024/1024?random=${Date.now()}_1`,
            `https://picsum.photos/1024/1024?random=${Date.now()}_2`,
            `https://picsum.photos/1024/1024?random=${Date.now()}_3`,
            `https://picsum.photos/1024/1024?random=${Date.now()}_4`
        ];

        const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Simulate async processing - in real implementation, this would queue the job
        setTimeout(async () => {
            try {
                // TODO: Save generated images to storage and update concept card
            } catch (error) {
                console.error('❌ MAYA: Failed to save generated images:', error);
            }
        }, 1000);

        res.json({
            generationId,
            status: 'processing',
            message: 'Image generation started'
        });

    } catch (error) {
        console.error('❌ MAYA: Generation failed:', error);
        res.status(500).json({
            error: 'Failed to start image generation',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/maya/status/:generationId
 * Check status of image generation
 */
router.get('/status/:generationId', requireStackAuth, async (req, res) => {
    try {
        const { generationId } = req.params;
        const userId = req.user?.id;


        // For now, simulate completed status with mock images
        // TODO: Check actual generation status from queue/storage
        const mockImages = [
            `https://picsum.photos/1024/1024?random=${generationId}_1`,
            `https://picsum.photos/1024/1024?random=${generationId}_2`,
            `https://picsum.photos/1024/1024?random=${generationId}_3`,
            `https://picsum.photos/1024/1024?random=${generationId}_4`
        ];

        res.json({
            generationId,
            status: 'completed',
            images: mockImages,
            completedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ MAYA: Status check failed:', error);
        res.status(500).json({
            error: 'Failed to check generation status',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});

export default router;