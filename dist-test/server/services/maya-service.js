/**
 * Maya AI Service - Complete Integration
 * Handles all Maya AI operations with full database integration and FLUX API
 */
import { DatabaseStorage } from '../storage.js';
import Anthropic from '@anthropic-ai/sdk';
import { PersonalityManager } from '../agents/personalities/personality-config.js';
export class MayaService {
    db;
    anthropic;
    constructor(db) {
        this.db = db;
        this.anthropic = new Anthropic({
            apiKey: process.env['ANTHROPIC_API_KEY'],
        });
    }
    /**
     * Get or create user profile for Maya personalization
     */
    async getOrCreateUserProfile(stackAuthId) {
        try {
            // Get user data first (stackAuthId is Stack Auth ID)
            const user = await this.db.getUserByStackAuthId(stackAuthId);
            if (!user) {
                throw new Error('User not found with Stack Auth ID');
            }
            // Check if profile exists using database user ID
            const existingProfile = await this.db.getMayaProfile(user.id);
            if (existingProfile) {
                return existingProfile;
            }
            // Create new Maya profile using database user ID
            const newProfile = {
                userId: user.id,
                onboardingStatus: 'pending',
                onboardingStep: 1,
                completedSteps: [],
                preferences: {
                    communicationStyle: 'casual',
                    generationSettings: {
                        defaultQuality: 'high',
                        preferredAspectRatio: '1:1',
                        autoSave: true,
                    },
                    privacySettings: {
                        shareGenerations: false,
                        allowDataCollection: true,
                    },
                    notificationSettings: {
                        emailUpdates: true,
                        trainingComplete: true,
                        newFeatures: false,
                    },
                },
                totalGenerations: 0,
                monthlyGenerations: 0,
                lastResetDate: new Date(),
                featureAccess: {
                    basicGeneration: true,
                    advancedPrompting: true,
                    customModels: false,
                    prioritySupport: false,
                },
            };
            const createdProfile = await this.db.insertMayaProfile(newProfile);
            return createdProfile;
        }
        catch (error) {
            console.error('❌ MAYA: Failed to get/create user profile:', error);
            throw error;
        }
    }
    /**
     * Get user's trained model for personalized generation
     */
    async getUserModel(userId) {
        try {
            const userModel = await this.db.getUserModel(userId);
            return userModel || null;
        }
        catch (error) {
            console.error('❌ MAYA: Failed to get user model:', error);
            return null;
        }
    }
    /**
     * Process Maya chat with full database integration
     */
    async processChat(stackAuthId, request) {
        try {
            // Get user data first to get database user ID
            const user = await this.db.getUserByStackAuthId(stackAuthId);
            if (!user) {
                throw new Error('User not found with Stack Auth ID');
            }
            // Get or create user profile
            await this.getOrCreateUserProfile(stackAuthId);
            // Get or create conversation
            let conversation;
            if (request.conversationId) {
                const foundConversation = await this.db.getConversation(request.conversationId);
                if (!foundConversation || foundConversation.userId !== user.id) {
                    throw new Error('Conversation not found or access denied');
                }
                conversation = foundConversation;
            }
            else {
                // Create new conversation
                const newConversation = {
                    userId: user.id,
                    agentName: 'maya',
                    title: `Maya Chat ${new Date().toLocaleDateString()}`,
                };
                conversation = await this.db.createConversation(newConversation);
            }
            // Get Maya's personality prompt
            const systemPrompt = PersonalityManager.getNaturalPrompt('maya');
            // Build conversation context
            const conversationMessages = [];
            // Add conversation history if provided
            if (request.history && Array.isArray(request.history)) {
                const recentHistory = request.history.slice(-10); // Limit to last 10 exchanges
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
            // Add current message
            conversationMessages.push({
                role: 'user',
                content: request.message
            });
            // Call Claude API
            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                temperature: 0.7,
                system: systemPrompt,
                messages: conversationMessages
            });
            const mayaResponse = response.content[0].type === 'text'
                ? response.content[0].text
                : '';
            // Save user message to database
            const userMessage = {
                conversationId: conversation.id,
                role: 'user',
                content: request.message,
            };
            await this.db.createMessage(userMessage);
            // Save Maya response to database
            const mayaMessage = {
                conversationId: conversation.id,
                role: 'assistant',
                content: mayaResponse,
            };
            await this.db.createMessage(mayaMessage);
            // Extract concept cards from response
            const conceptCards = this.extractConceptCards(mayaResponse);
            // Save concept cards to Maya concepts database
            for (const concept of conceptCards) {
                const mayaConcept = {
                    userId: user.id,
                    title: concept.title,
                    description: concept.description,
                    prompt: concept.fluxPrompt,
                    type: 'portrait', // Default type for Maya conversations
                    metadata: {
                        conversationId: conversation.id,
                        source: 'maya_chat',
                        creativeLook: concept.creativeLook,
                        emoji: concept.emoji
                    },
                    tags: [],
                    status: 'draft',
                    isTemplate: false,
                };
                await this.db.insertMayaConcept(mayaConcept);
            }
            // Update conversation summary
            await this.updateConversationSummary(conversation.id);
            // Update user profile stats
            await this.updateUserProfileStats();
            return {
                response: mayaResponse,
                conceptCards,
                conversationId: conversation.id,
            };
        }
        catch (error) {
            console.error('❌ MAYA: Chat processing failed:', error);
            throw error;
        }
    }
    /**
     * Generate images using FLUX API
     */
    async generateImages(userId, request) {
        try {
            // Validate user has access
            const userProfile = await this.getOrCreateUserProfile(userId);
            if (!userProfile.featureAccess?.basicGeneration) {
                throw new Error('User does not have generation access');
            }
            // Check generation limits
            if ((userProfile.monthlyGenerations || 0) >= 100) { // Default limit
                throw new Error('Monthly generation limit exceeded');
            }
            // Get user's trained model for personalization
            const userModel = await this.getUserModel(userId);
            // Create generation tracker
            const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const tracker = await this.db.createGenerationTracker({
                userId,
                predictionId: generationId,
                prompt: request.conceptCard.fluxPrompt,
                style: 'editorial',
                status: 'processing',
            });
            // Start FLUX generation asynchronously
            this.startFluxGeneration(userId, request, generationId, tracker, userModel);
            // Update user profile stats
            await this.db.updateMayaProfile(userId, {
                totalGenerations: (userProfile.totalGenerations || 0) + 1,
                monthlyGenerations: (userProfile.monthlyGenerations || 0) + 1,
            });
            return {
                generationId,
                status: 'processing',
                message: 'Image generation started successfully'
            };
        }
        catch (error) {
            console.error('❌ MAYA: Image generation failed:', error);
            throw error;
        }
    }
    /**
     * Start FLUX API generation
     */
    async startFluxGeneration(userId, request, generationId, tracker, userModel) {
        try {
            // Prepare FLUX prompt with user model if available
            let fluxPrompt = request.conceptCard.fluxPrompt;
            if (userModel?.triggerWord && userModel.trainingStatus === 'completed') {
                // Add trigger word for personalized generation
                fluxPrompt = `${userModel.triggerWord}, ${fluxPrompt}`;
            }
            // Call Replicate FLUX API
            const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: "flux-dev", // or flux-pro for premium
                    input: {
                        prompt: fluxPrompt,
                        num_outputs: 4,
                        aspect_ratio: "1:1",
                        output_format: "webp",
                        output_quality: 80,
                        safety_tolerance: 2,
                    }
                })
            });
            if (!replicateResponse.ok) {
                throw new Error(`Replicate API error: ${replicateResponse.status}`);
            }
            const predictionData = await replicateResponse.json();
            // Update tracker with prediction ID
            await this.db.updateGenerationTracker(tracker.id, {
                predictionId: predictionData.id,
                status: 'processing',
            });
            // Store generation result when complete
            this.monitorGenerationCompletion(userId, predictionData.id, tracker, request.conceptCard);
        }
        catch (error) {
            console.error('❌ MAYA: FLUX generation start failed:', error);
            // Update tracker with failure
            await this.db.updateGenerationTracker(tracker.id, {
                status: 'failed',
            });
        }
    }
    /**
     * Monitor generation completion
     */
    async monitorGenerationCompletion(userId, predictionId, tracker, conceptCard) {
        try {
            // Poll for completion (simplified - in production use webhooks)
            const maxAttempts = 60; // 5 minutes max
            let attempts = 0;
            while (attempts < maxAttempts) {
                const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                    headers: {
                        'Authorization': `Token ${process.env['REPLICATE_API_TOKEN']}`,
                    }
                });
                if (!statusResponse.ok) {
                    throw new Error(`Status check failed: ${statusResponse.status}`);
                }
                const statusData = await statusResponse.json();
                if (statusData.status === 'succeeded') {
                    // Generation completed successfully
                    const imageUrls = statusData.output || [];
                    // Update tracker
                    await this.db.updateGenerationTracker(tracker.id, {
                        status: 'completed',
                        imageUrls: JSON.stringify(imageUrls),
                        updatedAt: new Date(),
                    });
                    // Save images to database
                    for (let i = 0; i < imageUrls.length; i++) {
                        const imageData = {
                            userId,
                            url: imageUrls[i],
                            category: 'concept',
                            subcategory: conceptCard.title.toLowerCase(),
                            metadata: {
                                conceptId: conceptCard.id,
                                generationId: tracker.predictionId || `gen_${tracker.id}`,
                                prompt: conceptCard.fluxPrompt,
                                modelUsed: 'flux-dev',
                            },
                            viewCount: 0,
                            shareCount: 0,
                            downloadCount: 0,
                        };
                        await this.db.insertMayaImage(imageData);
                    }
                    return;
                }
                else if (statusData.status === 'failed') {
                    // Generation failed
                    await this.db.updateGenerationTracker(tracker.id, {
                        status: 'failed',
                    });
                    console.error('❌ MAYA: Generation failed for', tracker.id);
                    return;
                }
                // Wait before next check
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
                attempts++;
            }
            // Timeout
            await this.db.updateGenerationTracker(tracker.id, {
                status: 'failed',
            });
            console.error('❌ MAYA: Generation timeout for', tracker.id);
        }
        catch (error) {
            console.error('❌ MAYA: Generation monitoring failed:', error);
            await this.db.updateGenerationTracker(tracker.id, {
                status: 'failed',
            });
        }
    }
    /**
     * Get generation status
     */
    async getGenerationStatus(userId, generationId) {
        try {
            // Find tracker by predictionId (which is stored in the predictionId field)
            const trackers = await this.db.getUserGenerationTrackers(userId);
            const tracker = trackers.find(t => t.predictionId === generationId);
            if (!tracker) {
                throw new Error('Generation not found');
            }
            if (tracker.status === 'completed') {
                const imageUrls = tracker.imageUrls ? JSON.parse(tracker.imageUrls) : [];
                return {
                    generationId,
                    status: 'completed',
                    images: imageUrls,
                    completedAt: tracker.updatedAt || undefined,
                };
            }
            return {
                generationId,
                status: tracker.status || 'processing',
                progress: 50, // Estimated progress
            };
        }
        catch (error) {
            console.error('❌ MAYA: Status check failed:', error);
            throw error;
        }
    }
    /**
     * Extract concept cards from Maya response
     */
    extractConceptCards(response) {
        const conceptCards = [];
        try {
            // Look for Maya's emoji-based concept card format first
            // Simplified pattern that looks for any non-word character followed by **title**
            const emojiConceptPattern = /([^\w\s])\s*\*\*([^*]+)\*\*\s*\n([^*]+?)\s*\n\s*FLUX_PROMPT:\s*\[([^\]]+)\]/g;
            let emojiMatch;
            while ((emojiMatch = emojiConceptPattern.exec(response)) !== null) {
                const emoji = emojiMatch[1];
                const title = emojiMatch[2].trim();
                const description = emojiMatch[3].trim();
                const fluxPrompt = emojiMatch[4].trim();
                if (title && description && title.length > 3 && description.length > 10) {
                    conceptCards.push({
                        id: `concept_${Date.now()}_${conceptCards.length}`,
                        title,
                        description,
                        fluxPrompt,
                        creativeLook: 'Professional',
                        emoji,
                    });
                }
            }
            // Fallback patterns if no emoji-based concepts found
            if (conceptCards.length === 0) {
                const conceptPatterns = [
                    /\*\*([^*\n]+)\*\*:\s*([^\n*]+)/g,
                    /###\s*([^\n]+)\n([^\n#]+)/g,
                    /-\s*\*\*([^*\n]+)\*\*:\s*([^\n-]+)/g,
                ];
                for (const pattern of conceptPatterns) {
                    let match;
                    while ((match = pattern.exec(response)) !== null) {
                        let title = '', description = '';
                        if (match[1] && match[2]) {
                            title = match[1].trim();
                            description = match[2].trim();
                        }
                        if (title && description && title.length > 3 && description.length > 10) {
                            conceptCards.push({
                                id: `concept_${Date.now()}_${conceptCards.length}`,
                                title,
                                description,
                                fluxPrompt: `${title}: ${description}`,
                                creativeLook: 'Creative',
                                emoji: '📸',
                            });
                        }
                    }
                }
            }
        }
        catch (parseError) {
        }
        return conceptCards.slice(0, 3); // Limit to 3 concepts
    }
    /**
     * Update conversation summary
     */
    async updateConversationSummary(conversationId) {
        try {
            // Get recent messages for summary
            const messages = await this.db.getConversationMessages(conversationId, 10);
            if (messages.length > 0) {
                // Create simple summary from last message
                const lastMessage = messages[messages.length - 1];
                const summary = lastMessage.content.substring(0, 200) + (lastMessage.content.length > 200 ? '...' : '');
                await this.db.upsertConversationSummary({
                    conversationId,
                    summary,
                    lastMessageId: lastMessage.id,
                    messageCount: messages.length,
                });
            }
        }
        catch (error) {
            console.error('❌ MAYA: Failed to update conversation summary:', error);
        }
    }
    /**
     * Update user profile statistics
     */
    async updateUserProfileStats() {
        try {
            // This would update various stats like conversation count, etc.
            // Implementation depends on what stats we want to track
        }
        catch (error) {
            console.error('❌ MAYA: Failed to update user profile stats:', error);
        }
    }
}
// Export singleton instance
export const mayaService = new MayaService(new DatabaseStorage());
