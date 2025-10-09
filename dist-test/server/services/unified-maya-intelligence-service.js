/**
 * Unified Maya Intelligence Service
 * Orchestrates Maya AI operations with intelligence and context awareness
 */
import { ClaudeApiServiceSimple } from './claude-api-service-simple.js';
import { MayaService } from './maya-service.js';
import { PersonalityManager } from '../agents/personalities/personality-config.js';
import { DatabaseStorage } from '../storage.js';
export class UnifiedMayaIntelligenceService {
    claudeService;
    mayaService;
    personalityManager;
    storage;
    constructor() {
        this.claudeService = new ClaudeApiServiceSimple();
        this.mayaService = new MayaService(new DatabaseStorage());
        this.personalityManager = new PersonalityManager();
        this.storage = new DatabaseStorage();
    }
    async processMessage(request) {
        const { userId, message, conversationId, context } = request;
        try {
            // Get Maya's personality configuration
            const systemPrompt = 'You are Maya, a luxury AI personal branding strategist who helps clients develop their personal brand through strategic conversation and creative visual concepts.';
            // Build conversation history
            const history = context?.previousMessages || [];
            // Generate Maya's response using Claude
            const claudeResponse = await this.claudeService.sendMessage(message, history, systemPrompt);
            // Process the response through Maya service for concept cards and advanced features
            const mayaResponse = await this.mayaService.processChat(userId, {
                message,
                history: history.map(msg => ({
                    [msg.role === 'user' ? 'user' : 'maya']: msg.content
                })),
                conversationId
            });
            return {
                response: claudeResponse.content,
                conversationId: mayaResponse.conversationId,
                conceptCards: mayaResponse.conceptCards,
                nextActions: this.generateNextActions(claudeResponse.content),
                confidence: this.calculateConfidence(claudeResponse.content, context)
            };
        }
        catch (error) {
            console.error('Maya Intelligence Service error:', error);
            throw new Error(`Maya processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateBrandStrategy(userId, userInput) {
        // Use the existing Maya service for brand strategy generation
        return this.mayaService.processChat(userId, {
            message: `Help me develop a brand strategy: ${userInput}`,
            history: []
        });
    }
    async analyzeUserContext(userId) {
        // Analyze user's previous conversations and brand development
        try {
            const userProfile = await this.storage.getUser(userId);
            const conversations = await this.storage.getMayaChats(userId);
            return {
                userProfile,
                conversationSummary: conversations.slice(0, 5), // Last 5 conversations
                brandMaturity: this.assessBrandMaturity(conversations),
                recommendations: this.generateRecommendations(userProfile, conversations)
            };
        }
        catch (error) {
            console.error('Context analysis error:', error);
            return null;
        }
    }
    generateNextActions(response) {
        // Simple heuristic to suggest next actions based on Maya's response
        const actions = [];
        if (response.toLowerCase().includes('brand')) {
            actions.push('Explore brand identity options');
        }
        if (response.toLowerCase().includes('image') || response.toLowerCase().includes('photo')) {
            actions.push('Generate concept images');
        }
        if (response.toLowerCase().includes('strategy')) {
            actions.push('Develop detailed strategy');
        }
        return actions.length > 0 ? actions : ['Continue conversation'];
    }
    calculateConfidence(response, context) {
        // Simple confidence calculation based on response characteristics
        let confidence = 0.7; // Base confidence
        if (response.length > 100)
            confidence += 0.1;
        if (context?.previousMessages?.length > 0)
            confidence += 0.1;
        if (response.includes('specific') || response.includes('detailed'))
            confidence += 0.1;
        return Math.min(confidence, 1.0);
    }
    assessBrandMaturity(conversations) {
        if (!conversations || conversations.length === 0)
            return 'beginner';
        if (conversations.length < 5)
            return 'beginner';
        if (conversations.length < 15)
            return 'developing';
        return 'advanced';
    }
    generateRecommendations(userProfile, conversations) {
        const recommendations = [];
        if (!conversations || conversations.length === 0) {
            recommendations.push('Start with brand discovery conversation');
        }
        else if (conversations.length < 3) {
            recommendations.push('Explore your visual identity');
        }
        else {
            recommendations.push('Create your signature brand assets');
        }
        return recommendations;
    }
    async getUnifiedStyleIntelligence(userId, context, mode) {
        // Get user context and brand intelligence
        const userContext = await this.analyzeUserContext(userId);
        return {
            userProfile: userContext?.userProfile,
            brandContext: userContext?.brandMaturity,
            styleRecommendations: userContext?.recommendations || [],
            conversationHistory: userContext?.conversationSummary || [],
            confidence: this.calculateConfidence('unified intelligence', context),
            mode,
            timestamp: new Date().toISOString()
        };
    }
}
export const unifiedMayaIntelligenceService = new UnifiedMayaIntelligenceService();
