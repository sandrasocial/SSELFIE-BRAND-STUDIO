import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { storage } from '../../storage.js';
import { ModelTrainingService } from '../../model-training-service.js';
import { PersonalityManager } from '../../agents/personalities/personality-config.js';
import { MayaAdaptationEngine } from '../../services/maya-adaptation-engine.js';
import { ClaudeApiServiceSimple } from '../../services/claude-api-service-simple.js';
const router = Router();
const claudeService = new ClaudeApiServiceSimple();
router.get('/api/maya-chats', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const chats = await storage.getMayaChats(userId);
    const responseData = {
        data: {
            chats,
            count: chats.length
        }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/maya-chats/:chatId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { chatId } = req.params;
    const chat = await storage.getMayaChat(chatId, userId);
    if (!chat) {
        throw createError.notFound('Chat not found');
    }
    const responseData = {
        data: { chat }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/maya-chat', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { message, chatHistory = [], context = {} } = req.body;
    validateRequired({ message }, ['message']);
    try {
        const basePersonality = PersonalityManager.getNaturalPrompt('maya');
        let mayaPersonality = basePersonality;
        try {
            const adaptation = await MayaAdaptationEngine.adaptStylingApproach(userId, context, chatHistory);
            if (adaptation.adaptedPersonality) {
                mayaPersonality = adaptation.adaptedPersonality;
                console.log('🎯 MAYA: Applied personalized adaptation');
            }
        }
        catch (adaptError) {
            console.log('⚠️ MAYA: Adaptation failed, using base personality');
        }
        const claudeHistory = chatHistory.map(entry => ({
            role: entry.user ? 'user' : 'assistant',
            content: entry.user || entry.maya || entry.response || ''
        })).filter(msg => msg.content.trim());
        const mayaResponse = await claudeService.sendMessage(message, `maya-chat-${userId}`, 'maya', false, claudeHistory, mayaPersonality);
        let conceptCards = [];
        try {
            const conceptRegex = /(?:concept|idea|suggestion)[\s\S]*?(?:title|name):\s*["']?([^"'\n]+)["']?[\s\S]*?(?:prompt|description):\s*["']?([^"'\n]+)["']?/gi;
            let match;
            while ((match = conceptRegex.exec(mayaResponse)) !== null) {
                conceptCards.push({
                    title: match[1].trim(),
                    prompt: match[2].trim()
                });
            }
        }
        catch (parseError) {
            console.log('No concept cards extracted from response');
        }
        const chatId = await storage.saveMayaChat(userId, {
            message,
            response: mayaResponse,
            conceptCards,
            context
        });
        const responseData = {
            data: {
                response: mayaResponse,
                conceptCards,
                chatId,
                agentName: 'Maya - AI Creative Director',
                agentType: 'member',
                timestamp: new Date().toISOString()
            }
        };
        sendSuccess(res, responseData);
    }
    catch (error) {
        console.error('❌ MAYA: Chat failed:', error);
        throw createError.internal('Failed to process chat message');
    }
}));
router.post('/api/maya/chat', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { message, chatHistory, context } = req.body;
    validateRequired({ message }, ['message']);
    try {
        const basePersonality = PersonalityManager.getNaturalPrompt('maya');
        let mayaPersonality = basePersonality;
        try {
            const adaptation = await MayaAdaptationEngine.adaptStylingApproach(userId, context || {}, chatHistory || []);
            if (adaptation.adaptedPersonality) {
                mayaPersonality = adaptation.adaptedPersonality;
                console.log('🎯 MAYA: Applied personalized adaptation');
            }
        }
        catch (adaptError) {
            console.log('⚠️ MAYA: Adaptation failed, using base personality');
        }
        const claudeHistory = (chatHistory || []).map((entry) => ({
            role: entry.user ? 'user' : 'assistant',
            content: entry.user || entry.maya || entry.response || ''
        })).filter((msg) => msg.content.trim());
        const mayaResponse = await claudeService.sendMessage(message, `maya-chat-${userId}`, 'maya', false, claudeHistory, mayaPersonality);
        let conceptCards = [];
        try {
            const conceptRegex = /(?:concept|idea|suggestion)[\s\S]*?(?:title|name):\s*["']?([^"'\n]+)["']?[\s\S]*?(?:prompt|description):\s*["']?([^"'\n]+)["']?/gi;
            let match;
            while ((match = conceptRegex.exec(mayaResponse)) !== null) {
                conceptCards.push({
                    title: match[1].trim(),
                    prompt: match[2].trim()
                });
            }
        }
        catch (parseError) {
            console.log('No concept cards extracted from response');
        }
        const chatId = await storage.saveMayaChat(userId, {
            message,
            response: mayaResponse,
            conceptCards,
            context: context || {}
        });
        sendSuccess(res, {
            response: mayaResponse,
            conceptCards,
            chatId,
            agentName: 'Maya - AI Creative Director',
            agentType: 'member',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ MAYA: Chat failed:', error);
        throw createError.internal('Failed to process chat message');
    }
}));
router.post('/api/maya-generate', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { prompt, style, count, conceptName, seed } = req.body;
    validateRequired({ prompt }, ['prompt']);
    try {
        const userModel = await storage.getUserModelByUserId(userId);
        if (!userModel || userModel.trainingStatus !== 'completed') {
            throw createError.validation('User model not ready. Please complete training first.');
        }
        const loraWeights = await storage.getUserActiveLoraWeight(userId);
        if (!loraWeights) {
            throw createError.validation('User LoRA weights not available. Please retrain your model.');
        }
        let finalPrompt = prompt;
        if (conceptName) {
            finalPrompt = `${conceptName}: ${prompt}`;
        }
        else {
            finalPrompt = `Professional photography, ${userModel.triggerWord || 'sandra'}, ${prompt}`;
        }
        const result = await ModelTrainingService.generateUserImages(userId, finalPrompt, count || 2, { seed, categoryContext: style });
        const generationId = await storage.saveAIImage({
            userId,
            prompt: finalPrompt,
            imageUrl: result.images[0] || '',
            style: style || 'maya-styled',
            predictionId: result.predictionId
        });
        const responseData = {
            data: {
                jobId: result.predictionId,
                generationId: generationId.toString(),
                images: result.images,
                prompt: finalPrompt
            },
            message: 'Maya generation completed successfully'
        };
        sendSuccess(res, responseData);
    }
    catch (error) {
        console.error('❌ MAYA: Generation failed:', error);
        throw createError.internal('Image generation failed');
    }
}));
router.get('/api/maya-chats/:chatId/messages', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { chatId } = req.params;
    const messages = await storage.getMayaChatMessages(chatId, userId);
    const responseData = {
        data: {
            messages,
            count: messages.length
        }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/maya-chats/:chatId/messages', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { message } = req.body;
    validateRequired({ message }, ['message']);
    const messageId = await storage.saveMayaMessage(chatId, userId, {
        message,
        role: 'user'
    });
    const responseData = {
        data: { messageId: parseInt(messageId) },
        message: 'Message sent successfully'
    };
    sendSuccess(res, responseData, 'Message sent successfully', 201);
}));
router.patch('/api/maya-chats/:chatId/messages/:messageId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { chatId, messageId } = req.params;
    const { content } = req.body;
    validateRequired({ content }, ['content']);
    await storage.updateMayaMessage(messageId, userId, { content });
    const responseData = {
        data: { success: true },
        message: 'Message updated successfully'
    };
    sendSuccess(res, responseData);
}));
router.post('/api/maya-chats', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { title, initialMessage } = req.body;
    const chatId = await storage.createMayaChat(userId, {
        title: title || 'New Maya Chat',
        initialMessage
    });
    const responseData = {
        data: { chatId },
        message: 'New Maya chat created'
    };
    sendSuccess(res, responseData, 'New Maya chat created', 201);
}));
router.get('/api/maya-images', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const images = await storage.getUserAIImages(userId);
    const responseData = {
        data: {
            images,
            count: images.length
        }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/maya/personality', requireStackAuth, asyncHandler(async (req, res) => {
    const personality = PersonalityManager.getNaturalPrompt('maya');
    const responseData = {
        data: { personality }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/maya/get-video-prompt', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageUrl } = req.body;
    validateRequired({ imageUrl }, ['imageUrl']);
    try {
        console.log(`🎬 MAYA VIDEO DIRECTION: Creating motion prompt for user ${userId}`);
        const videoDirectorPrompt = `You are Maya, SSELFIE Studio's AI Creative Director and Video Director. 

🎬 VIDEO DIRECTION MODE: You are analyzing the actual image provided to create the perfect motion prompt for VEO 3 video generation.

Your expertise includes:
- Cinematic storytelling and visual narrative
- Fashion and lifestyle video aesthetics
- Professional portrait cinematography
- Understanding of what makes compelling short-form video content

TASK: Analyze the provided image carefully and create ONE single, cinematic motion prompt that perfectly enhances what you see in the image.

ANALYSIS INSTRUCTIONS:
1. Study the subject's pose, expression, and mood
2. Observe the lighting, background, and overall composition
3. Consider the style and aesthetic of the image
4. Identify the best camera movement that would enhance the scene

MOTION PROMPT GUIDELINES:
- Keep it to 1-2 sentences maximum
- Focus on movements that specifically enhance THIS image
- Use the actual elements you see (lighting, pose, background, mood)
- Use professional cinematography terminology
- Make it suitable for high-end fashion/lifestyle content
- Be specific to what you observe in the image

Analyze the image and respond with ONLY the motion prompt that perfectly captures and enhances what you see - no explanation, no additional text.`;
        const claudeService = new ClaudeApiServiceSimple();
        const videoConversationId = `video_direction_${userId}_${Date.now()}`;
        const mayaVideoPrompt = await claudeService.sendMessageWithImage(videoDirectorPrompt, imageUrl, videoConversationId, 'maya');
        console.log(`✅ MAYA VIDEO DIRECTION: Generated motion prompt for user ${userId}`);
        const responseData = {
            data: {
                videoPrompt: mayaVideoPrompt,
                director: 'Maya - AI Creative Director',
                timestamp: new Date().toISOString()
            }
        };
        sendSuccess(res, responseData);
    }
    catch (error) {
        console.error('❌ MAYA VIDEO DIRECTION ERROR:', error);
        throw createError.internal('Failed to generate video direction');
    }
}));
export default router;
//# sourceMappingURL=maya.js.map