/**
 * PHASE 3.3: ENHANCED CONVERSATION CONTEXT RETENTION
 * Maya Context Session Manager - Maintains rich conversation context across sessions
 */

import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

export interface ContextSession {
  id: string;
  userId: string;
  sessionId: string;
  currentMood: string;
  stylingGoals: string[];
  contextualCues: any;
  adaptationTriggers: string[];
  sessionStarted: Date;
  lastInteraction: Date;
}

export interface ConversationMemory {
  recentPreferences: string[];
  favoriteCategories: string[];
  stylingEvolution: any[];
  emotionalContext: string;
  brandingConsistency: any;
  technicalPreferences: any;
}

export class MayaContextSessionManager {
  
  /**
   * Initialize or resume conversation session with enhanced context retention
   */
  static async initializeSession(
    userId: string, 
    initialContext: any = {}
  ): Promise<ContextSession> {
    try {
      console.log(`📚 CONTEXT SESSION: Initializing enhanced session for user ${userId}`);
      
      const sessionId = uuidv4();
      
      // Detect mood and styling goals from initial context
      const detectedMood = this.detectMoodFromContext(initialContext);
      const stylingGoals = this.extractStylingGoals(initialContext);
      const contextualCues = this.analyzeContextualCues(initialContext);
      
      // Create session in database
      const insertQuery = `
        INSERT INTO maya_context_sessions (
          user_id, session_id, current_mood, styling_goals, 
          contextual_cues, adaptation_triggers
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const sessionData = await storage.db.execute(insertQuery, [
        userId,
        sessionId,
        detectedMood,
        JSON.stringify(stylingGoals),
        JSON.stringify(contextualCues),
        JSON.stringify([])
      ]);
      
      console.log(`✅ CONTEXT SESSION: Enhanced session ${sessionId} created for user ${userId}`);
      
      return {
        id: sessionData[0].id,
        userId,
        sessionId,
        currentMood: detectedMood,
        stylingGoals,
        contextualCues,
        adaptationTriggers: [],
        sessionStarted: new Date(),
        lastInteraction: new Date()
      };
      
    } catch (error) {
      console.error('❌ CONTEXT SESSION ERROR:', error);
      
      // Fallback session
      return {
        id: '0',
        userId,
        sessionId: uuidv4(),
        currentMood: 'neutral',
        stylingGoals: [],
        contextualCues: {},
        adaptationTriggers: [],
        sessionStarted: new Date(),
        lastInteraction: new Date()
      };
    }
  }

  /**
   * Update session context based on conversation progression
   */
  static async updateSessionContext(
    sessionId: string,
    newMessage: string,
    mayaResponse: any,
    detectedContext: any = {}
  ): Promise<void> {
    try {
      // Analyze new message for context updates
      const moodShift = this.detectMoodFromContext({ message: newMessage });
      const newGoals = this.extractStylingGoals({ message: newMessage });
      const newCues = this.analyzeContextualCues({ message: newMessage, response: mayaResponse });
      const adaptationTriggers = this.detectAdaptationTriggers(newMessage, mayaResponse);
      
      // Update session with enriched context
      const updateQuery = `
        UPDATE maya_context_sessions 
        SET 
          current_mood = COALESCE($2, current_mood),
          styling_goals = styling_goals || $3::jsonb,
          contextual_cues = contextual_cues || $4::jsonb,
          adaptation_triggers = adaptation_triggers || $5::jsonb,
          last_interaction = NOW()
        WHERE session_id = $1
      `;
      
      await storage.db.execute(updateQuery, [
        sessionId,
        moodShift !== 'neutral' ? moodShift : null,
        JSON.stringify(newGoals),
        JSON.stringify(newCues),
        JSON.stringify(adaptationTriggers)
      ]);
      
      console.log(`🔄 CONTEXT SESSION: Updated session ${sessionId} with new context insights`);
      
    } catch (error) {
      console.error('❌ CONTEXT UPDATE ERROR:', error);
    }
  }

  /**
   * Retrieve comprehensive conversation memory for personalization
   */
  static async getConversationMemory(userId: string): Promise<ConversationMemory> {
    try {
      // Get recent conversation sessions
      const sessionsQuery = `
        SELECT * FROM maya_context_sessions 
        WHERE user_id = $1 
        ORDER BY last_interaction DESC 
        LIMIT 5
      `;
      
      const sessions = await storage.db.execute(sessionsQuery, [userId]);
      
      // Get user's favorite images for style analysis
      const favoritesQuery = `
        SELECT prompt, category, created_at 
        FROM ai_images 
        WHERE user_id = $1 AND (is_favorite = true OR is_selected = true)
        ORDER BY created_at DESC 
        LIMIT 15
      `;
      
      const favorites = await storage.db.execute(favoritesQuery, [userId]);
      
      // Analyze conversation patterns
      const recentPreferences = this.extractRecentPreferences(sessions);
      const favoriteCategories = this.analyzeFavoriteCategories(favorites);
      const stylingEvolution = this.traceStylingEvolution(sessions, favorites);
      const emotionalContext = this.synthesizeEmotionalContext(sessions);
      
      return {
        recentPreferences,
        favoriteCategories,
        stylingEvolution,
        emotionalContext,
        brandingConsistency: this.analyzeBrandingConsistency(favorites),
        technicalPreferences: this.extractTechnicalPreferences(sessions)
      };
      
    } catch (error) {
      console.error('❌ CONVERSATION MEMORY ERROR:', error);
      
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

  /**
   * Generate personalized conversation starter based on session history
   */
  static async generatePersonalizedGreeting(userId: string): Promise<string> {
    try {
      const memory = await this.getConversationMemory(userId);
      
      if (memory.recentPreferences.length === 0) {
        return "Ready to create some amazing photos together? What's your vision for today?";
      }
      
      const lastPreference = memory.recentPreferences[0];
      const favoriteCategory = memory.favoriteCategories[0] || 'styling';
      
      const personalizedGreetings = [
        `I remember you loved ${lastPreference}! Ready to explore more ${favoriteCategory} concepts?`,
        `Welcome back! I have some exciting ${favoriteCategory} ideas building on what we created last time.`,
        `Perfect timing! I've been thinking about new ways to elevate your ${favoriteCategory} style.`,
        `Ready for another creative session? I have some fresh ${favoriteCategory} concepts that follow your style evolution.`
      ];
      
      return personalizedGreetings[Math.floor(Math.random() * personalizedGreetings.length)];
      
    } catch (error) {
      console.error('❌ PERSONALIZED GREETING ERROR:', error);
      return "Ready to create something beautiful together?";
    }
  }

  // Helper methods for context analysis

  private static detectMoodFromContext(context: any): string {
    const text = (context.message || '').toLowerCase();
    
    if (text.includes('excited') || text.includes('love') || text.includes('amazing')) return 'excited';
    if (text.includes('professional') || text.includes('business') || text.includes('meeting')) return 'professional';
    if (text.includes('casual') || text.includes('relaxed') || text.includes('fun')) return 'relaxed';
    if (text.includes('elegant') || text.includes('sophisticated') || text.includes('luxury')) return 'sophisticated';
    if (text.includes('creative') || text.includes('artistic') || text.includes('unique')) return 'creative';
    
    return 'neutral';
  }

  private static extractStylingGoals(context: any): string[] {
    const text = (context.message || '').toLowerCase();
    const goals: string[] = [];
    
    if (text.includes('professional') || text.includes('business')) goals.push('professional_presence');
    if (text.includes('confident') || text.includes('powerful')) goals.push('confidence_building');
    if (text.includes('elegant') || text.includes('sophisticated')) goals.push('sophisticated_styling');
    if (text.includes('authentic') || text.includes('natural')) goals.push('authentic_expression');
    if (text.includes('creative') || text.includes('unique')) goals.push('creative_exploration');
    if (text.includes('brand') || text.includes('personal brand')) goals.push('brand_development');
    
    return goals;
  }

  private static analyzeContextualCues(context: any): any {
    return {
      timeOfDay: this.getTimeContext(),
      messageLength: (context.message || '').length,
      responseType: context.response?.type || 'unknown',
      conceptGeneration: context.response?.conceptCards?.length > 0,
      emotionalTone: this.detectMoodFromContext(context),
      technicalComplexity: this.assessTechnicalComplexity(context)
    };
  }

  private static detectAdaptationTriggers(message: string, response: any): string[] {
    const triggers: string[] = [];
    
    if (message.toLowerCase().includes('not quite') || message.toLowerCase().includes('different')) {
      triggers.push('style_adjustment_needed');
    }
    
    if (message.toLowerCase().includes('love') || message.toLowerCase().includes('perfect')) {
      triggers.push('positive_feedback');
    }
    
    if (response?.conceptCards?.length > 0) {
      triggers.push('concept_generation_successful');
    }
    
    return triggers;
  }

  private static extractRecentPreferences(sessions: any[]): string[] {
    const preferences: string[] = [];
    
    sessions.forEach(session => {
      if (session.styling_goals) {
        try {
          const goals = JSON.parse(session.styling_goals);
          preferences.push(...goals);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    // Return unique preferences
    return [...new Set(preferences)].slice(0, 5);
  }

  private static analyzeFavoriteCategories(favorites: any[]): string[] {
    const categoryCount: { [key: string]: number } = {};
    
    favorites.forEach(fav => {
      if (fav.category) {
        categoryCount[fav.category] = (categoryCount[fav.category] || 0) + 1;
      }
    });
    
    return Object.keys(categoryCount)
      .sort((a, b) => categoryCount[b] - categoryCount[a])
      .slice(0, 3);
  }

  private static traceStylingEvolution(sessions: any[], favorites: any[]): any[] {
    const evolution: any[] = [];
    
    // Combine session data and favorites to track evolution
    sessions.forEach((session, index) => {
      evolution.push({
        sessionDate: session.last_interaction,
        mood: session.current_mood,
        goals: session.styling_goals ? JSON.parse(session.styling_goals) : [],
        evolutionStage: index === 0 ? 'current' : 'previous'
      });
    });
    
    return evolution.slice(0, 3); // Recent evolution only
  }

  private static synthesizeEmotionalContext(sessions: any[]): string {
    if (sessions.length === 0) return 'neutral';
    
    const moods = sessions.map(s => s.current_mood).filter(m => m);
    const moodCount: { [key: string]: number } = {};
    
    moods.forEach(mood => {
      moodCount[mood] = (moodCount[mood] || 0) + 1;
    });
    
    const dominantMood = Object.keys(moodCount)
      .sort((a, b) => moodCount[b] - moodCount[a])[0];
    
    return dominantMood || 'neutral';
  }

  private static analyzeBrandingConsistency(favorites: any[]): any {
    return {
      consistentCategories: favorites.length > 0,
      brandEvolution: favorites.length > 5 ? 'developing' : 'early',
      styleMaturity: favorites.length > 10 ? 'established' : 'exploring'
    };
  }

  private static extractTechnicalPreferences(sessions: any[]): any {
    return {
      sessionFrequency: sessions.length > 3 ? 'frequent' : 'occasional',
      contextComplexity: sessions.some(s => s.contextual_cues) ? 'complex' : 'simple',
      adaptationResponsiveness: sessions.some(s => s.adaptation_triggers) ? 'responsive' : 'baseline'
    };
  }

  private static getTimeContext(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    
    return 'night';
  }

  private static assessTechnicalComplexity(context: any): string {
    const messageLength = (context.message || '').length;
    const hasSpecificRequests = (context.message || '').includes('specific') || (context.message || '').includes('exactly');
    
    if (messageLength > 100 && hasSpecificRequests) return 'high';
    if (messageLength > 50) return 'medium';
    
    return 'low';
  }
}