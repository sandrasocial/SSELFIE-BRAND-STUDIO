/**
 * PHASE 3: DYNAMIC PERSONALIZATION ENGINE
 * Maya Adaptation Engine - Learns user preferences and adapts styling approaches
 */

import { storage } from '../storage';
import { ClaudeApiServiceSimple } from './claude-api-service-simple';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { db } from '../drizzle';

export interface AdaptationResult {
  adaptedPersonality: any;
  confidenceScore: number;
  adaptationReason: string;
  stylingAdjustments: string[];
  trendRecommendations: string[];
  nextPersonalizationStep?: string;
}

export interface UserStyleProfile {
  preferredCategories: string[];
  colorPreferences: string[];
  styleEvolution: any[];
  feedbackPatterns: any;
  culturalContext: any;
  sustainabilityPreferences: any;
}

export class MayaAdaptationEngine {
  private static claudeService = new ClaudeApiServiceSimple();

  /**
   * Real-time personalization based on user interaction patterns
   */
  static async adaptStylingApproach(
    userId: string, 
    currentContext: any,
    conversationHistory: any[] = []
  ): Promise<AdaptationResult> {
    try {
      console.log(`🎯 ADAPTATION ENGINE: Learning user ${userId} preferences...`);

      // Get user's style evolution data
      const userProfile = await MayaAdaptationEngine.getUserStyleProfile(userId);
      
      // Analyze conversation patterns for styling preferences  
      const contextAnalysis = { patterns: [], preferences: [] };
      
      // Get Maya's base personality for adaptation
      const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');
      
      // Generate adapted styling approach
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

      const adaptationResponse = await this.claudeService.sendMessage(
        adaptationPrompt, 
        'adaptation-' + userId, 
        'maya'
      );

      const adaptationResult = JSON.parse(adaptationResponse);

      // Store adaptation learning
      await this.recordAdaptation(userId, adaptationResult, currentContext);
      
      console.log(`✅ ADAPTATION ENGINE: Generated personalized styling approach (confidence: ${adaptationResult.confidenceScore})`);
      
      return adaptationResult;

    } catch (error) {
      console.error('❌ ADAPTATION ENGINE ERROR:', error);
      
      // Fallback to base Maya personality
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

  /**
   * Get comprehensive user style profile from evolution tracking
   */
  private static async getUserStyleProfile(userId: string): Promise<UserStyleProfile> {
    try {
      // Get user's style evolution data
      const evolutionQuery = `
        SELECT * FROM user_style_evolution 
        WHERE user_id = $1 
        ORDER BY last_adaptation DESC 
        LIMIT 1
      `;
      
      const evolutionData = await db.execute(evolutionQuery.replace('$1', `'${userId}'`));
      
      // Get recent gallery favorites for style preferences
      const favoritesQuery = `
        SELECT prompt, category, created_at 
        FROM ai_images 
        WHERE user_id = $1 AND (is_favorite = true OR is_selected = true)
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      
      const favorites = await db.execute(favoritesQuery.replace('$1', `'${userId}'`));

      if (Array.isArray(evolutionData) && evolutionData.length === 0) {
        // New user - create initial profile
        const initialProfile: UserStyleProfile = {
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

    } catch (error) {
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

  /**
   * Analyze current conversation for contextual styling cues
   */
  private static async analyzeContextualCues(currentContext: any, conversationHistory: any[]): Promise<any> {
    const recentMessages = conversationHistory.slice(-5); // Last 5 messages
    
    return {
      conversationMood: this.detectMood(recentMessages),
      stylingKeywords: this.extractStylingKeywords(recentMessages),
      categoryFocus: this.detectCategoryFocus(currentContext),
      energyLevel: this.detectEnergyLevel(recentMessages),
      timeContext: this.getTimeContext()
    };
  }

  /**
   * Initialize style evolution tracking for new user
   */
  private static async initializeUserEvolution(userId: string): Promise<void> {
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
    } catch (error) {
      console.error('❌ STYLE EVOLUTION INIT ERROR:', error);
    }
  }

  /**
   * Record successful adaptation for learning
   */
  private static async recordAdaptation(userId: string, result: AdaptationResult, context: any): Promise<void> {
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
      
    } catch (error) {
      console.error('❌ ADAPTATION RECORDING ERROR:', error);
    }
  }

  // Helper methods for analysis
  private static extractPreferredCategories(favorites: any[]): string[] {
    const categoryCount: { [key: string]: number } = {};
    
    favorites.forEach(fav => {
      if (fav.category) {
        categoryCount[fav.category] = (categoryCount[fav.category] || 0) + 1;
      }
    });
    
    return Object.keys(categoryCount)
      .sort((a, b) => categoryCount[b] - categoryCount[a])
      .slice(0, 3); // Top 3 categories
  }

  private static detectMood(messages: any[]): string {
    const text = messages.map(m => m.content || '').join(' ').toLowerCase();
    
    if (text.includes('excited') || text.includes('amazing') || text.includes('love')) return 'excited';
    if (text.includes('professional') || text.includes('business') || text.includes('meeting')) return 'professional';
    if (text.includes('casual') || text.includes('relaxed') || text.includes('comfortable')) return 'relaxed';
    
    return 'neutral';
  }

  private static extractStylingKeywords(messages: any[]): string[] {
    const text = messages.map(m => m.content || '').join(' ').toLowerCase();
    const keywords = [
      'bold', 'elegant', 'casual', 'professional', 'edgy', 'classic', 
      'modern', 'vintage', 'minimalist', 'dramatic', 'soft', 'structured'
    ];
    
    return keywords.filter(keyword => text.includes(keyword));
  }

  private static detectCategoryFocus(context: any): string {
    return context?.category || 'General';
  }

  private static detectEnergyLevel(messages: any[]): string {
    const text = messages.map(m => m.content || '').join(' ').toLowerCase();
    
    if (text.includes('!') || text.includes('exciting') || text.includes('energetic')) return 'high';
    if (text.includes('calm') || text.includes('peaceful') || text.includes('relaxed')) return 'low';
    
    return 'medium';
  }

  private static getTimeContext(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    
    return 'night';
  }
}