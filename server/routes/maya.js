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

        console.log('🎨 MAYA: Chat request from user:', userId, 'Message:', message.substring(0, 100) + '...');

        // Get Maya's complete personality prompt from the personality system
        const systemPrompt = PersonalityManager.getNaturalPrompt('maya');

        // Build conversation context (limit to last 10 exchanges to prevent context overflow)
        let conversationMessages = [];
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

        // Extract concept cards using improved regex patterns
        let conceptCards = [];
        try {
            // Look for Maya's emoji-based concept card format first
            const emojiConceptPattern = /(\p{Emoji})\s*\*\*([^*]+)\*\*\s*\n([^*]+?)\s*\n\s*FLUX_PROMPT:\s*\[([^\]]+)\]/gu;
            let emojiMatch;
            while ((emojiMatch = emojiConceptPattern.exec(mayaResponse)) !== null) {
                const emoji = emojiMatch[1];
                const title = emojiMatch[2].trim();
                const description = emojiMatch[3].trim();
                const fluxPrompt = emojiMatch[4].trim();

                if (title && description && title.length > 3 && description.length > 10) {
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
            console.log('Concept card extraction failed:', parseError.message);
        }

        console.log('✅ MAYA: Generated response with', conceptCards.length, 'concept cards');

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
});export default router;