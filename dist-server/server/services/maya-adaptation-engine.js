import { ClaudeApiServiceSimple } from './claude-api-service-simple.js';
import { PersonalityManager } from '../agents/personalities/personality-config.js';
import { db } from '../drizzle.js';
export class MayaAdaptationEngine {
    static claudeService = new ClaudeApiServiceSimple();
    static async adaptStylingApproach(userId, currentContext, conversationHistory = []) {
        try {
            console.log(`🎯 ADAPTATION ENGINE: Learning user ${userId} preferences...`);
            const userProfile = await MayaAdaptationEngine.getUserStyleProfile(userId);
            const contextAnalysis = { patterns: [], preferences: [] };
            const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');
            const adaptationPrompt = `
🎯 MAYA ADAPTATION ENGINE - PERSONALIZED STYLING INTELLIGENCE

BASE MAYA PERSONALITY: ${baseMayaPersonality}

USER STYLE PROFILE:
${JSON.stringify(userProfile, null, 2)}

CURRENT CONTEXT: ${JSON.stringify(currentContext, null, 2)}

CONVERSATION PATTERNS: ${JSON.stringify(contextAnalysis, null, 2)}

ADAPTATION TASK:
Analyze this user's style evolution and preferences to create a personalized Maya experience.

Consider:
- 2025 contemporary fashion trends that match their style evolution
- Cultural context and sustainability preferences  
- Previous feedback patterns and style choices
- Contextual cues from current conversation

Respond with JSON:
{
  "adaptedPersonality": "Personalized Maya personality text incorporating user preferences",
  "confidenceScore": 0.85,
  "adaptationReason": "Why these adaptations were chosen",
  "stylingAdjustments": ["Specific styling changes made"],
  "trendRecommendations": ["2025 trends that match user preferences"],
  "nextPersonalizationStep": "What to learn next about this user"
}
`;
            const adaptationResponse = await this.claudeService.sendMessage(adaptationPrompt, 'adaptation-' + userId, 'maya');
            const adaptationResult = JSON.parse(adaptationResponse);
            await this.recordAdaptation(userId, adaptationResult, currentContext);
            console.log(`✅ ADAPTATION ENGINE: Generated personalized styling approach (confidence: ${adaptationResult.confidenceScore})`);
            return adaptationResult;
        }
        catch (error) {
            console.error('❌ ADAPTATION ENGINE ERROR:', error);
            return {
                adaptedPersonality: PersonalityManager.getNaturalPrompt('maya'),
                confidenceScore: 0.5,
                adaptationReason: "Using base Maya personality due to adaptation error",
                stylingAdjustments: [],
                trendRecommendations: [],
                nextPersonalizationStep: "Retry personalization analysis"
            };
        }
    }
    static async getUserStyleProfile(userId) {
        try {
            const evolutionQuery = `
        SELECT * FROM user_style_evolution 
        WHERE user_id = $1 
        ORDER BY last_adaptation DESC 
        LIMIT 1
      `;
            const evolutionData = await db.execute(evolutionQuery.replace('$1', `'${userId}'`));
            const favoritesQuery = `
        SELECT prompt, category, created_at 
        FROM ai_images 
        WHERE user_id = $1 AND (is_favorite = true OR is_selected = true)
        ORDER BY created_at DESC 
        LIMIT 20
      `;
            const favorites = await db.execute(favoritesQuery.replace('$1', `'${userId}'`));
            if (Array.isArray(evolutionData) && evolutionData.length === 0) {
                const initialProfile = {
                    userId,
                    stylePreferences: {},
                    colorPalette: [],
                    fashionStyle: 'classic',
                    culturalContext: {},
                    sustainabilityPreferences: {}
                };
                return initialProfile;
            }
            const evolution = evolutionData[0];
            return {
                userId,
                stylePreferences: evolution.contextual_preferences || {},
                colorPalette: evolution.contextual_preferences?.colors || [],
                fashionStyle: evolution.fashion_style || 'classic',
                culturalContext: evolution.cultural_context || {},
                sustainabilityPreferences: evolution.sustainability_preferences || {}
            };
        }
        catch (error) {
            console.error('❌ USER STYLE PROFILE ERROR:', error);
            return {
                userId,
                stylePreferences: {},
                colorPalette: [],
                fashionStyle: 'classic',
                culturalContext: {},
                sustainabilityPreferences: {}
            };
        }
    }
    static async analyzeContextualCues(currentContext, conversationHistory) {
        const recentMessages = conversationHistory.slice(-5);
        return {
            conversationMood: this.detectMood(recentMessages),
            stylingKeywords: this.extractStylingKeywords(recentMessages),
            categoryFocus: this.detectCategoryFocus(currentContext),
            energyLevel: this.detectEnergyLevel(recentMessages),
            timeContext: this.getTimeContext()
        };
    }
    static async initializeUserEvolution(userId) {
        try {
            const insertQuery = `
        INSERT INTO user_style_evolution (
          user_id, learning_progress, style_evolution_path, 
          feedback_patterns, contextual_preferences,
          trend_adaptation, cultural_context, sustainability_preferences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
            await db.execute(insertQuery.replace('$1', `'${userId}'`).replace('$2', `'${JSON.stringify(initialProfile)}'`).replace('$3', `'${JSON.stringify([])}'`).replace('$4', `'${JSON.stringify({})}'`).replace('$5', `'${JSON.stringify({ initialized: true })}'`).replace('$6', `'${JSON.stringify({})}'`).replace('$7', `'${JSON.stringify({})}'`).replace('$8', `'${JSON.stringify({})}'`));
            console.log(`✅ ADAPTATION ENGINE: Initialized style evolution for user ${userId}`);
        }
        catch (error) {
            console.error('❌ STYLE EVOLUTION INIT ERROR:', error);
        }
    }
    static async recordAdaptation(userId, result, context) {
        try {
            const updateQuery = `
        UPDATE user_style_evolution 
        SET 
          learning_progress = jsonb_set(
            learning_progress, 
            '{lastAdaptation}', 
            to_jsonb($2::timestamp)
          ),
          style_evolution_path = style_evolution_path || $3::jsonb,
          last_adaptation = NOW()
        WHERE user_id = $1
      `;
            const evolutionEntry = {
                timestamp: Date.now(),
                adaptationType: 'contextual',
                confidenceScore: result.confidenceScore,
                context: context
            };
            await db.execute(updateQuery.replace('$1', `'${userId}'`).replace('$2', `'${new Date().toISOString()}'`).replace('$3', `'${JSON.stringify([evolutionEntry])}'`));
        }
        catch (error) {
            console.error('❌ ADAPTATION RECORDING ERROR:', error);
        }
    }
    static extractPreferredCategories(favorites) {
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
    static detectMood(messages) {
        const text = messages.map(m => m.content || '').join(' ').toLowerCase();
        if (text.includes('excited') || text.includes('amazing') || text.includes('love'))
            return 'excited';
        if (text.includes('professional') || text.includes('business') || text.includes('meeting'))
            return 'professional';
        if (text.includes('casual') || text.includes('relaxed') || text.includes('comfortable'))
            return 'relaxed';
        return 'neutral';
    }
    static extractStylingKeywords(messages) {
        const text = messages.map(m => m.content || '').join(' ').toLowerCase();
        const keywords = [
            'bold', 'elegant', 'casual', 'professional', 'edgy', 'classic',
            'modern', 'vintage', 'minimalist', 'dramatic', 'soft', 'structured'
        ];
        return keywords.filter(keyword => text.includes(keyword));
    }
    static detectCategoryFocus(context) {
        return context?.category || 'General';
    }
    static detectEnergyLevel(messages) {
        const text = messages.map(m => m.content || '').join(' ').toLowerCase();
        if (text.includes('!') || text.includes('exciting') || text.includes('energetic'))
            return 'high';
        if (text.includes('calm') || text.includes('peaceful') || text.includes('relaxed'))
            return 'low';
        return 'medium';
    }
    static getTimeContext() {
        const hour = new Date().getHours();
        if (hour < 12)
            return 'morning';
        if (hour < 17)
            return 'afternoon';
        if (hour < 21)
            return 'evening';
        return 'night';
    }
}
//# sourceMappingURL=maya-adaptation-engine.js.map