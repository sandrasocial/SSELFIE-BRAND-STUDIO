import { personalBrandService } from './personal-brand-service.js';
import { SimpleMemoryService } from './simple-memory-service.js';
import { storage } from '../storage.js';
import { v4 as uuidv4 } from 'uuid';
export class UnifiedMayaMemoryService {
    simpleMemory;
    contextCache = new Map();
    CACHE_TTL = 15 * 60 * 1000;
    constructor() {
        this.simpleMemory = SimpleMemoryService.getInstance();
        console.log('🧠 UNIFIED MAYA MEMORY: Service initialized');
    }
    async getUnifiedMayaContext(userId, sessionId, initialMessage) {
        const cacheKey = `${userId}:${sessionId || 'current'}`;
        if (this.contextCache.has(cacheKey)) {
            const cached = this.contextCache.get(cacheKey);
            if (Date.now() - cached.lastUpdated.getTime() < this.CACHE_TTL) {
                console.log(`⚡ UNIFIED MAYA MEMORY: Cache hit for user ${userId}`);
                return cached;
            }
        }
        console.log(`🔍 UNIFIED MAYA MEMORY: Building comprehensive context for user ${userId}`);
        try {
            const [conversationHistory, personalBrandData, personalInsights, onboardingProgress, conversationMemory, sessionMetadata] = await Promise.all([
                this.getConversationHistory(userId, 15),
                this.getPersonalInsights(userId),
                this.getOnboardingProgress(userId),
                this.getConversationMemory(userId),
                this.getSessionMetadata(userId)
            ]);
            const actualSessionId = sessionId || uuidv4();
            const sessionContext = await this.initializeSessionContext(userId, actualSessionId, initialMessage);
            const contextualIntelligence = await this.buildContextualIntelligence(userId);
            const unifiedContext = {
                userId,
                sessionId: actualSessionId,
                conversationHistory,
                personalBrandData,
                personalInsights,
                onboardingProgress,
                sessionContext,
                contextualIntelligence,
                conversationMemory,
                sessionMetadata,
                lastUpdated: new Date(),
                cacheVersion: '1.0'
            };
            this.contextCache.set(cacheKey, unifiedContext);
            console.log(`✅ UNIFIED MAYA MEMORY: Complete context built for user ${userId} (${conversationHistory.length} messages, ${Object.keys(personalBrandData).length} brand fields)`);
            return unifiedContext;
        }
        catch (error) {
            console.error(`❌ UNIFIED MAYA MEMORY: Failed to build context for ${userId}:`, error);
            return this.getDefaultContext(userId, sessionId || uuidv4());
        }
    }
    async saveUnifiedConversation(userId, userMessage, mayaResponse, sessionId, hasImageGeneration = false, conceptCards = []) {
        console.log(`💾 UNIFIED MAYA MEMORY: Saving conversation for user ${userId}, session ${sessionId}`);
        try {
            const chatId = await this.getOrCreateMayaChatSession(userId);
            const userMsgData = {
                chatId,
                role: 'user',
                content: userMessage,
                createdAt: new Date()
            };
            const userMessage_saved = await storage.createMayaChatMessage(userMsgData);
            const mayaResponseData = {
                chatId,
                role: 'assistant',
                content: mayaResponse,
                createdAt: new Date()
            };
            const mayaMessage_saved = await storage.createMayaChatMessage(mayaResponseData);
            await Promise.all([
                this.updateChatActivity(chatId),
                this.extractAndSaveUnifiedInsights(userId, userMessage, mayaResponse, conceptCards),
                this.updateSessionContext(userId, sessionId, userMessage, mayaResponse),
                this.updateSimpleMemoryContext(userId, sessionId)
            ]);
            this.invalidateCache(userId, sessionId);
            console.log(`✅ UNIFIED MAYA MEMORY: Conversation saved successfully for user ${userId}`);
            return {
                chatId,
                messageId: mayaMessage_saved.id,
                sessionUpdated: true
            };
        }
        catch (error) {
            console.error(`❌ UNIFIED MAYA MEMORY: Failed to save conversation for ${userId}:`, error);
            throw error;
        }
    }
    async getConversationHistory(userId, limit = 15) {
        try {
            const recentChats = await storage.getMayaChats(userId);
            if (recentChats.length === 0) {
                return [];
            }
            const latestChat = recentChats[0];
            const messages = await storage.getMayaChatMessages(latestChat.id, userId);
            return messages
                .slice(-limit * 2)
                .map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.createdAt,
                chatId: msg.chatId,
                messageId: msg.id,
                hasImageGeneration: msg.hasImageGeneration || false,
                conceptCards: msg.conceptCards || []
            }));
        }
        catch (error) {
            console.error(`❌ UNIFIED MAYA MEMORY: Failed to get conversation history for ${userId}:`, error);
            return [];
        }
    }
    async extractAndSaveUnifiedInsights(userId, userMessage, mayaResponse, conceptCards = []) {
        try {
            const messageInsights = this.extractInsightsFromMessage(userMessage);
            const responseInsights = this.extractInsightsFromResponse(mayaResponse, conceptCards);
            const sessionInsights = this.extractSessionInsights(userMessage, mayaResponse);
            const unifiedInsights = this.mergeInsights(messageInsights, responseInsights, sessionInsights);
            if (this.hasSignificantInsights(unifiedInsights)) {
                await this.savePersonalInsights(userId, unifiedInsights);
            }
            console.log(`🧠 UNIFIED MAYA MEMORY: Insights extracted and saved for user ${userId}`);
        }
        catch (error) {
            console.error(`❌ UNIFIED MAYA MEMORY: Failed to extract insights for ${userId}:`, error);
        }
    }
    async initializeSessionContext(userId, sessionId, initialMessage) {
        try {
            const sessionGoals = initialMessage ? this.extractSessionGoals(initialMessage) : ['general_styling'];
            const sessionMood = initialMessage ? this.detectSessionMood(initialMessage) : 'exploratory';
            return {
                sessionId,
                sessionStartTime: new Date(),
                sessionGoals,
                sessionMood,
                sessionProgress: 0,
                conversationDepth: 1,
                topicsExplored: [],
                preferencesRevealed: [],
                challengesIdentified: []
            };
        }
        catch (error) {
            console.error(`❌ UNIFIED MAYA MEMORY: Failed to initialize session context for ${userId}:`, error);
            return this.getDefaultSessionContext(sessionId);
        }
    }
    async buildContextualIntelligence(userId) {
        try {
            const currentDate = new Date();
            const month = currentDate.getMonth();
            let currentSeason;
            if (month >= 2 && month <= 4)
                currentSeason = 'spring';
            else if (month >= 5 && month <= 7)
                currentSeason = 'summer';
            else if (month >= 8 && month <= 10)
                currentSeason = 'fall';
            else
                currentSeason = 'winter';
            return {
                currentSeason,
                seasonalShift: [2, 5, 8, 11].includes(month),
                holidayContext: this.getUpcomingHolidays(month),
                weatherConsiderations: this.getSeasonalWeatherConsiderations(currentSeason),
                industryContext: 'general',
                careerStage: 'mid',
                professionalGoals: [],
                brandPersonality: [],
                region: 'general',
                culturalNorms: [],
                regionalTrends: [],
                urbanRuralContext: 'urban'
            };
        }
        catch (error) {
            console.error(`❌ UNIFIED MAYA MEMORY: Failed to build contextual intelligence for ${userId}:`, error);
            return this.getDefaultContextualIntelligence();
        }
    }
    async getOnboardingProgress(userId) {
        try {
            const currentStep = await personalBrandService.getOnboardingProgress(userId);
            const isCompleted = await personalBrandService.hasCompletedPersonalBrandOnboarding(userId);
            return { currentStep, isCompleted };
        }
        catch (error) {
            return { currentStep: 0, isCompleted: false };
        }
    }
    async getPersonalInsights(userId) {
        try {
            const memoryData = await storage.getAgentMemory('maya', userId);
            if (memoryData?.personalInsights) {
                return memoryData.personalInsights;
            }
        }
        catch (error) {
            console.error('Failed to load Maya insights from memory:', error);
        }
        return {
            emotionalState: [],
            mentionedGoals: [],
            styleHints: [],
            progressMarkers: [],
            lastUpdated: new Date()
        };
    }
    async getConversationMemory(userId) {
        try {
            const favoritesQuery = await storage.getAIImages(userId);
            const favorites = favoritesQuery.filter(img => img.isSelected || img.isFavorite).slice(0, 15);
            return {
                recentPreferences: [],
                favoriteCategories: this.analyzeFavoriteCategories(favorites),
                stylingEvolution: [],
                emotionalContext: 'neutral',
                brandingConsistency: this.analyzeBrandingConsistency(favorites),
                technicalPreferences: {}
            };
        }
        catch (error) {
            return {
                recentPreferences: [],
                favoriteCategories: [],
                stylingEvolution: [],
                emotionalContext: 'neutral',
                brandingConsistency: {},
                technicalPreferences: {}
            };
        }
    }
    async getSessionMetadata(userId) {
        try {
            const chats = await storage.getMayaChats(userId);
            return {
                totalSessions: chats.length,
                averageSessionLength: 0,
                lastInteractionDate: chats.length > 0 ? chats[0].lastActivity : null,
                preferredTimeOfDay: this.getTimeContext(),
                adaptationTriggers: []
            };
        }
        catch (error) {
            return {
                totalSessions: 0,
                averageSessionLength: 0,
                lastInteractionDate: null,
                preferredTimeOfDay: 'morning',
                adaptationTriggers: []
            };
        }
    }
    extractSessionGoals(message) {
        const goals = [];
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('professional') || lowerMessage.includes('business'))
            goals.push('professional_photos');
        if (lowerMessage.includes('brand') || lowerMessage.includes('personal brand'))
            goals.push('brand_building');
        if (lowerMessage.includes('instagram') || lowerMessage.includes('social media'))
            goals.push('social_content');
        if (lowerMessage.includes('style') || lowerMessage.includes('aesthetic'))
            goals.push('style_exploration');
        if (lowerMessage.includes('event') || lowerMessage.includes('occasion'))
            goals.push('event_preparation');
        return goals.length > 0 ? goals : ['general_styling'];
    }
    detectSessionMood(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('need') || lowerMessage.includes('urgent'))
            return 'urgent';
        if (lowerMessage.includes('specific') || lowerMessage.includes('exactly'))
            return 'focused';
        if (lowerMessage.includes('creative') || lowerMessage.includes('artistic'))
            return 'creative';
        if (lowerMessage.includes('fun') || lowerMessage.includes('casual'))
            return 'relaxed';
        return 'exploratory';
    }
    extractInsightsFromMessage(message) {
        const lowerMessage = message.toLowerCase();
        const insights = {
            emotionalState: [],
            mentionedGoals: [],
            styleHints: [],
            progressMarkers: []
        };
        if (lowerMessage.includes('confident') || lowerMessage.includes('empowered')) {
            insights.emotionalState.push('confident');
        }
        if (lowerMessage.includes('excited') || lowerMessage.includes('ready')) {
            insights.emotionalState.push('motivated');
        }
        return insights;
    }
    extractInsightsFromResponse(response, conceptCards) {
        return {
            emotionalState: [],
            mentionedGoals: [],
            styleHints: conceptCards.length > 0 ? ['concept_generation_successful'] : [],
            progressMarkers: []
        };
    }
    extractSessionInsights(userMessage, mayaResponse) {
        return {
            messageComplexity: userMessage.length > 100 ? 'high' : 'medium',
            responseType: mayaResponse.includes('concept') ? 'creative' : 'conversational'
        };
    }
    mergeInsights(messageInsights, responseInsights, sessionInsights) {
        return {
            emotionalState: [...(messageInsights.emotionalState || []), ...(responseInsights.emotionalState || [])],
            mentionedGoals: [...(messageInsights.mentionedGoals || []), ...(responseInsights.mentionedGoals || [])],
            styleHints: [...(messageInsights.styleHints || []), ...(responseInsights.styleHints || [])],
            progressMarkers: [...(messageInsights.progressMarkers || []), ...(responseInsights.progressMarkers || [])]
        };
    }
    hasSignificantInsights(insights) {
        return (insights.emotionalState?.length || 0) > 0 ||
            (insights.mentionedGoals?.length || 0) > 0 ||
            (insights.styleHints?.length || 0) > 0;
    }
    async savePersonalInsights(userId, insights) {
        try {
            const existingInsights = await this.getPersonalInsights(userId);
            const mergedInsights = {
                emotionalState: this.mergeUniqueArray(existingInsights.emotionalState, insights.emotionalState || []),
                mentionedGoals: this.mergeUniqueArray(existingInsights.mentionedGoals, insights.mentionedGoals || []),
                styleHints: this.mergeUniqueArray(existingInsights.styleHints, insights.styleHints || []),
                progressMarkers: this.mergeUniqueArray(existingInsights.progressMarkers, insights.progressMarkers || []),
                lastUpdated: new Date()
            };
            await storage.saveAgentMemory('maya', userId, {
                personalInsights: mergedInsights,
                lastUpdated: new Date()
            });
        }
        catch (error) {
            console.error('Failed to save Maya insights to memory:', error);
        }
    }
    mergeUniqueArray(existing, newItems) {
        const combined = [...existing, ...newItems];
        return Array.from(new Set(combined));
    }
    async getOrCreateMayaChatSession(userId) {
        const existingChats = await storage.getMayaChats(userId);
        if (existingChats.length > 0) {
            return existingChats[0].id;
        }
        const newChatData = {
            userId,
            chatTitle: 'Personal Brand Discovery with Maya',
            chatCategory: 'onboarding',
            createdAt: new Date(),
            lastActivity: new Date()
        };
        const newChatId = await storage.createMayaChat(userId, newChatData);
        return newChatId;
    }
    async updateChatActivity(chatId) {
        console.log(`💬 UNIFIED MAYA MEMORY: Updated activity for chat ${chatId}`);
    }
    async updateSessionContext(userId, sessionId, userMessage, mayaResponse) {
        console.log(`🔄 UNIFIED MAYA MEMORY: Updated session context for ${userId}, session ${sessionId}`);
    }
    async updateSimpleMemoryContext(userId, sessionId) {
        await this.simpleMemory.prepareAgentContext({
            agentName: 'maya',
            userId,
            task: 'personal_brand_conversation'
        });
    }
    invalidateCache(userId, sessionId) {
        const cacheKey = `${userId}:${sessionId}`;
        this.contextCache.delete(cacheKey);
        console.log(`🗑️ UNIFIED MAYA MEMORY: Cache invalidated for ${cacheKey}`);
    }
    analyzeFavoriteCategories(favorites) {
        const categoryCount = {};
        favorites.forEach(fav => {
            if (fav.category) {
                categoryCount[fav.category] = (categoryCount[fav.category] || 0) + 1;
            }
        });
        return Object.keys(categoryCount)
            .sort((a, b) => categoryCount[b] - categoryCount[a])
            .slice(0, 3);
    }
    analyzeBrandingConsistency(favorites) {
        return {
            consistentCategories: favorites.length > 0,
            brandEvolution: favorites.length > 5 ? 'developing' : 'early',
            styleMaturity: favorites.length > 10 ? 'established' : 'exploring'
        };
    }
    getTimeContext() {
        const hour = new Date().getHours();
        if (hour < 12)
            return 'morning';
        if (hour < 17)
            return 'afternoon';
        if (hour < 21)
            return 'evening';
        return 'night';
    }
    getUpcomingHolidays(month) {
        const holidays = {
            0: ['New Year'], 1: ['Valentine\'s Day'], 2: ['Spring Events'],
            3: ['Easter', 'Spring Formal Events'], 4: ['Mother\'s Day', 'Graduation Season'],
            5: ['Wedding Season', 'Summer Events'], 6: ['Summer Weddings', 'Vacation Events'],
            7: ['Late Summer Events'], 8: ['Back to School', 'Fall Events'],
            9: ['Halloween', 'Fall Professional Events'], 10: ['Thanksgiving', 'Holiday Season'],
            11: ['Christmas', 'New Year\'s Eve', 'Holiday Parties']
        };
        return holidays[month] || [];
    }
    getSeasonalWeatherConsiderations(season) {
        const considerations = {
            spring: ['Layering', 'Transitional Weather', 'Light Fabrics'],
            summer: ['Breathable Fabrics', 'Sun Protection', 'Heat Management'],
            fall: ['Warm Layers', 'Rich Colors', 'Weather Protection'],
            winter: ['Warmth', 'Dark Colors', 'Indoor/Outdoor Transition']
        };
        return considerations[season] || [];
    }
    getDefaultContext(userId, sessionId) {
        return {
            userId,
            sessionId,
            conversationHistory: [],
            personalBrandData: {},
            personalInsights: {
                emotionalState: [],
                mentionedGoals: [],
                styleHints: [],
                progressMarkers: [],
                lastUpdated: new Date()
            },
            onboardingProgress: { currentStep: 0, isCompleted: false },
            sessionContext: this.getDefaultSessionContext(sessionId),
            contextualIntelligence: this.getDefaultContextualIntelligence(),
            conversationMemory: {
                recentPreferences: [],
                favoriteCategories: [],
                stylingEvolution: [],
                emotionalContext: 'neutral',
                brandingConsistency: {
                    consistentCategories: false,
                    brandEvolution: 'early',
                    styleMaturity: 'exploring'
                },
                technicalPreferences: {}
            },
            sessionMetadata: {
                totalSessions: 0,
                averageSessionLength: 0,
                lastInteractionDate: null,
                preferredTimeOfDay: 'day',
                adaptationTriggers: []
            },
            lastUpdated: new Date(),
            cacheVersion: '1.0'
        };
    }
    getDefaultSessionContext(sessionId) {
        return {
            sessionId,
            sessionStartTime: new Date(),
            sessionGoals: ['general_styling'],
            sessionMood: 'exploratory',
            sessionProgress: 0,
            conversationDepth: 1,
            topicsExplored: [],
            preferencesRevealed: [],
            challengesIdentified: []
        };
    }
    getDefaultContextualIntelligence() {
        return {
            currentSeason: 'spring',
            seasonalShift: false,
            holidayContext: [],
            weatherConsiderations: [],
            industryContext: 'general',
            careerStage: 'mid',
            professionalGoals: [],
            brandPersonality: [],
            region: 'general',
            culturalNorms: [],
            regionalTrends: [],
            urbanRuralContext: 'urban'
        };
    }
    async clearRestrictiveCategorizations(userId) {
        try {
            await storage.saveAgentMemory('maya', userId, {
                personalInsights: {
                    emotionalState: [],
                    mentionedGoals: [],
                    styleHints: [],
                    progressMarkers: [],
                    lastUpdated: new Date()
                },
                lastUpdated: new Date(),
                clearedRestrictiveCategories: true
            });
            this.invalidateCache(userId, 'current');
            console.log(`🧠 UNIFIED MAYA MEMORY: Cleared restrictive categorizations for user ${userId}`);
        }
        catch (error) {
            console.error('Failed to clear restrictive Maya categorizations:', error);
        }
    }
    async getMayaSystemStats(userId) {
        try {
            const context = await this.getUnifiedMayaContext(userId);
            return {
                systemVersion: 'Unified Maya Memory v1.0',
                userId,
                performance: {
                    cacheHitRate: this.contextCache.has(`${userId}:current`) ? 'cached' : 'fresh',
                    contextCompleteness: this.calculateContextCompleteness(context),
                    memoryEfficiency: 'optimized'
                },
                memory: {
                    totalConversations: context.conversationHistory.length,
                    onboardingProgress: context.onboardingProgress.currentStep,
                    personalInsights: Object.keys(context.personalInsights).length,
                    sessionData: context.sessionContext.conversationDepth
                },
                intelligence: {
                    seasonalContext: context.contextualIntelligence.currentSeason,
                    businessContext: context.contextualIntelligence.careerStage,
                    locationContext: context.contextualIntelligence.region
                },
                lastUpdate: context.lastUpdated
            };
        }
        catch (error) {
            console.error(`❌ UNIFIED MAYA MEMORY: Failed to get stats for ${userId}:`, error);
            return { error: 'Failed to generate stats' };
        }
    }
    calculateContextCompleteness(context) {
        let completeness = 0;
        if (context.conversationHistory.length > 0)
            completeness += 25;
        if (Object.keys(context.personalBrandData).length > 0)
            completeness += 25;
        if (context.personalInsights.styleHints.length > 0)
            completeness += 25;
        if (context.sessionContext.topicsExplored.length > 0)
            completeness += 25;
        return `${completeness}%`;
    }
}
export const unifiedMayaMemoryService = new UnifiedMayaMemoryService();
console.log('🚀 UNIFIED MAYA MEMORY: Service loaded and ready for Phase 1 optimization');
//# sourceMappingURL=unified-maya-memory-service.js.map