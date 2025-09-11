/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Secure Maya Chat Routes
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
            console.log('🎨 MAYA: Gemini AI initialized server-side');
        } catch (error) {
            console.error('❌ Failed to initialize Gemini AI:', error);
        }
    }
}

/**
 * POST /api/maya/chat
 * Secure Maya chat endpoint with server-side Gemini integration
 */
router.post('/chat', requireStackAuth, async (req, res) => {
    try {
        const { message, history } = req.body;
        const userId = req.user?.id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!geminiAI) {
            return res.status(503).json({ error: 'AI service not available' });
        }

        console.log('🎨 MAYA: Chat request from user:', userId, 'Message:', message.substring(0, 100) + '...');
        
        // Initialize Gemini AI if needed
        await initGeminiAI();

        // Use Gemini for Maya's personality and responses
        const model = geminiAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        // Maya's core personality prompt
        const systemPrompt = `You are Maya, SSELFIE Studio's AI Creative Director and Personal Brand Strategist. You are sophisticated, intuitive, and deeply understand luxury personal branding.

Your expertise includes:
- Visual storytelling and brand consistency
- Professional photography concepts and styling
- Personal brand strategy and market positioning
- Creative direction for luxury brands
- Fashion, lifestyle, and business imagery

Your tone is:
- Professional yet approachable
- Confident and knowledgeable
- Inspiring and creative
- Strategic and business-focused

When users ask for photo concepts, provide specific, actionable suggestions with:
1. Clear concept descriptions
2. Styling recommendations  
3. Technical photography guidance
4. Brand positioning insights

Always respond with both conversational text and structured concept cards when appropriate.`;

        // Build conversation context
        let conversationContext = systemPrompt + '\n\n';
        if (history && Array.isArray(history)) {
            history.forEach(entry => {
                if (entry.user) conversationContext += `User: ${entry.user}\n`;
                if (entry.maya) conversationContext += `Maya: ${entry.maya}\n`;
            });
        }
        conversationContext += `User: ${message}\nMaya:`;

        const result = await model.generateContent(conversationContext);
        const response = result.response;
        const mayaResponse = response.text();

        // Extract concept cards if Maya suggests photo concepts
        let conceptCards = [];
        try {
            // Look for structured suggestions in Maya's response
            const conceptRegex = /(?:concept|idea|suggestion)[\s\S]*?(?:title|name):\s*["']?([^"'\n]+)["']?[\s\S]*?(?:prompt|description):\s*["']?([^"'\n]+)["']?/gi;
            let match;
            while ((match = conceptRegex.exec(mayaResponse)) !== null) {
                conceptCards.push({
                    title: match[1].trim(),
                    prompt: match[2].trim()
                });
            }
        } catch (parseError) {
            console.log('No concept cards extracted from response');
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
});

export default router;