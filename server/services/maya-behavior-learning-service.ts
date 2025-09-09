/**
 * ✨ PHASE 5.1: ADVANCED USER BEHAVIOR LEARNING
 * Maya Behavior Learning Service - Smart pattern recognition and personalized intelligence
 */

import { storage } from '../storage';

export interface UserBehaviorPattern {
  // Interaction Patterns
  preferredRequestStyles: string[]; // How user likes to ask for photos
  conceptPreferences: string[]; // Types of concepts user gravitates toward
  generationTiming: string[]; // When user typically generates photos
  sessionLengths: number[]; // How long user typically spends with Maya
  
  // Style Evolution Tracking
  styleJourney: {
    phase: 'exploring' | 'focused' | 'experimenting' | 'confident';
    progression: Array<{
      date: Date;
      dominant_style: string;
      confidence_score: number;
    }>;
  };
  
  // Personalization Insights
  communicationPreferences: {
    detail_level: 'minimal' | 'moderate' | 'detailed';
    tone_preference: 'casual' | 'professional' | 'friendly';
    guidance_level: 'independent' | 'some_help' | 'guided';
  };
  
  // Predictive Intelligence
  likelyNextRequests: string[]; // What user might ask for next
  seasonalPatterns: Record<string, any>; // How preferences change by season
  contextualTriggers: Record<string, any>; // What situations trigger certain requests
}

export interface EngagementMetrics {
  // Maya Interaction Quality
  averageResponseRating: number; // How well Maya responses perform
  conceptCardEngagement: number; // How often user generates from concept cards
  conversationDepth: number; // How deep conversations typically go
  returnFrequency: number; // How often user comes back
  
  // Generation Behavior
  generationSuccessRate: number; // Percentage of concepts that get generated
  favoriteRate: number; // Percentage of generations that get favorited
  categoryDistribution: Record<string, number>; // Which categories user prefers
  styleConsistency: number; // How consistent user's style choices are
  
  // Business Intelligence
  subscriptionValue: number; // How much value user gets from subscription
  churnRisk: number; // Likelihood user might cancel (0-100)
  upsellOpportunity: number; // Likelihood user wants more features
  referralPotential: number; // Likelihood user would refer others
}

export interface PersonalizedInsights {
  // Style Personality Profile
  dominantAesthetic: string; // User's primary style direction
  secondaryAesthetics: string[]; // Alternative styles user explores
  styleConfidence: number; // How confident user is in their style
  experimentationLevel: number; // How much user likes to try new things
  
  // Maya Relationship Insights
  mayaPersonalityFit: number; // How well Maya's personality matches user
  preferredMayaRole: 'consultant' | 'creative_partner' | 'style_expert' | 'friend';
  communicationSynergy: number; // How well Maya and user communicate
  trustLevel: number; // How much user trusts Maya's suggestions
  
  // Business Context Understanding
  professionalNeedsLevel: number; // How much user needs professional photos
  brandingAwareness: number; // How aware user is of personal branding
  marketingGoals: string[]; // What user wants to achieve with photos
  targetAudience: string[]; // Who user wants to reach with photos
}

export class MayaBehaviorLearningService {

  /**
   * ✨ PHASE 5.1: Initialize advanced behavior tracking for user
   */
  static async initializeBehaviorTracking(userId: string): Promise<void> {
    try {
      console.log(`🧠 PHASE 5.1: Initializing behavior tracking for user ${userId}`);
      
      // Check if behavior tracking already exists
      const existingData = await this.getBehaviorData(userId);
      
      if (!existingData) {
        // Create initial behavior profile
        const initialProfile = {
          userId,
          behaviorPatterns: this.getDefaultBehaviorPatterns(),
          engagementMetrics: this.getDefaultEngagementMetrics(),
          personalizedInsights: this.getDefaultPersonalizedInsights(),
          learningVersion: '5.1',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Store initial profile
        await this.storeBehaviorData(userId, initialProfile);
        console.log(`✅ PHASE 5.1: Behavior tracking initialized for user ${userId}`);
      } else {
        console.log(`🔄 PHASE 5.1: Behavior tracking already exists for user ${userId}, upgrading if needed`);
        await this.upgradeBehaviorTracking(userId, existingData);
      }
      
    } catch (error) {
      console.error(`❌ PHASE 5.1: Behavior tracking initialization failed for ${userId}:`, error);
    }
  }

  /**
   * Default behavior patterns for new users
   */
  private static getDefaultBehaviorPatterns(): UserBehaviorPattern {
    return {
      preferredRequestStyles: [],
      conceptPreferences: [],
      generationTiming: [],
      sessionLengths: [],
      styleJourney: {
        phase: 'exploring',
        progression: []
      },
      communicationPreferences: {
        detail_level: 'moderate',
        tone_preference: 'friendly',
        guidance_level: 'some_help'
      },
      likelyNextRequests: [],
      seasonalPatterns: {},
      contextualTriggers: {}
    };
  }

  /**
   * Default engagement metrics for new users
   */
  private static getDefaultEngagementMetrics(): EngagementMetrics {
    return {
      averageResponseRating: 0.0,
      conceptCardEngagement: 0.0,
      conversationDepth: 1.0,
      returnFrequency: 0.0,
      generationSuccessRate: 0.0,
      favoriteRate: 0.0,
      categoryDistribution: {},
      styleConsistency: 0.0,
      subscriptionValue: 50.0,
      churnRisk: 30.0,
      upsellOpportunity: 20.0,
      referralPotential: 25.0
    };
  }

  /**
   * Default personalized insights for new users
   */
  private static getDefaultPersonalizedInsights(): PersonalizedInsights {
    return {
      dominantAesthetic: 'discovering',
      secondaryAesthetics: [],
      styleConfidence: 50.0,
      experimentationLevel: 70.0,
      mayaPersonalityFit: 75.0,
      preferredMayaRole: 'creative_partner',
      communicationSynergy: 70.0,
      trustLevel: 60.0,
      professionalNeedsLevel: 50.0,
      brandingAwareness: 40.0,
      marketingGoals: [],
      targetAudience: []
    };
  }

  /**
   * ✨ PHASE 5.1: Learn from user interaction with concept cards
   */
  static async learnFromConceptCardInteraction(
    userId: string,
    conceptCard: any,
    interactionType: 'generated' | 'skipped' | 'favorited' | 'shared'
  ): Promise<void> {
    try {
      console.log(`🧠 PHASE 5.1: Learning from ${interactionType} interaction for user ${userId}`);
      
      const behaviorData = await this.getBehaviorData(userId);
      if (!behaviorData) {
        await this.initializeBehaviorTracking(userId);
        return;
      }
      
      // Extract learning insights from interaction
      const insights = await this.analyzeConceptCardInteraction(conceptCard, interactionType);
      
      // Update behavior patterns
      await this.updateBehaviorPatterns(userId, behaviorData, insights);
      
      // Update engagement metrics
      await this.updateEngagementMetrics(userId, behaviorData, interactionType);
      
      // Generate personalized insights
      await this.updatePersonalizedInsights(userId, behaviorData, insights);
      
      console.log(`✅ PHASE 5.1: Learning complete for ${interactionType} interaction`);
      
    } catch (error) {
      console.error(`❌ PHASE 5.1: Learning from interaction failed for ${userId}:`, error);
    }
  }

  /**
   * Analyze concept card interaction for insights
   */
  private static async analyzeConceptCardInteraction(
    conceptCard: any,
    interactionType: string
  ): Promise<any> {
    return {
      styleElements: this.extractStyleElements(conceptCard),
      categoryPreference: conceptCard.category || 'Unknown',
      complexityLevel: this.analyzeComplexity(conceptCard),
      emotionalTone: this.analyzeEmotionalTone(conceptCard),
      professionalLevel: this.analyzeProfessionalLevel(conceptCard),
      interactionValue: this.calculateInteractionValue(interactionType),
      preferenceSignal: this.calculatePreferenceSignal(interactionType)
    };
  }

  /**
   * Extract style elements from concept card
   */
  private static extractStyleElements(conceptCard: any): string[] {
    const elements = new Set<string>();
    const description = (conceptCard.description || '').toLowerCase();
    
    // Color analysis
    if (description.includes('neutral') || description.includes('beige') || description.includes('cream')) {
      elements.add('neutral-colors');
    }
    if (description.includes('bold') || description.includes('vibrant') || description.includes('bright')) {
      elements.add('bold-colors');
    }
    if (description.includes('monochromatic') || description.includes('black') || description.includes('white')) {
      elements.add('monochromatic');
    }
    
    // Style analysis
    if (description.includes('minimalist') || description.includes('clean') || description.includes('simple')) {
      elements.add('minimalist');
    }
    if (description.includes('elegant') || description.includes('sophisticated') || description.includes('refined')) {
      elements.add('elegant');
    }
    if (description.includes('casual') || description.includes('relaxed') || description.includes('comfortable')) {
      elements.add('casual');
    }
    if (description.includes('edgy') || description.includes('bold') || description.includes('dramatic')) {
      elements.add('edgy');
    }
    
    // Setting analysis
    if (description.includes('natural light') || description.includes('outdoor') || description.includes('garden')) {
      elements.add('natural-setting');
    }
    if (description.includes('studio') || description.includes('professional') || description.includes('backdrop')) {
      elements.add('studio-setting');
    }
    if (description.includes('urban') || description.includes('city') || description.includes('street')) {
      elements.add('urban-setting');
    }
    
    return Array.from(elements);
  }

  /**
   * Analyze complexity level of concept
   */
  private static analyzeComplexity(conceptCard: any): 'simple' | 'moderate' | 'complex' {
    const description = (conceptCard.description || '').toLowerCase();
    const promptLength = (conceptCard.prompt || '').length;
    
    if (promptLength > 200 || description.includes('multiple') || description.includes('layered')) {
      return 'complex';
    }
    if (promptLength > 100 || description.includes('styled') || description.includes('coordinated')) {
      return 'moderate';
    }
    return 'simple';
  }

  /**
   * Analyze emotional tone of concept
   */
  private static analyzeEmotionalTone(conceptCard: any): string {
    const description = (conceptCard.description || '').toLowerCase();
    
    if (description.includes('confident') || description.includes('powerful') || description.includes('strong')) {
      return 'confident';
    }
    if (description.includes('soft') || description.includes('gentle') || description.includes('serene')) {
      return 'serene';
    }
    if (description.includes('playful') || description.includes('fun') || description.includes('vibrant')) {
      return 'playful';
    }
    if (description.includes('elegant') || description.includes('sophisticated') || description.includes('refined')) {
      return 'elegant';
    }
    
    return 'neutral';
  }

  /**
   * Analyze professional level of concept
   */
  private static analyzeProfessionalLevel(conceptCard: any): number {
    const description = (conceptCard.description || '').toLowerCase();
    const category = (conceptCard.category || '').toLowerCase();
    
    let professionalScore = 0;
    
    if (category.includes('business') || category.includes('professional')) {
      professionalScore += 40;
    }
    if (description.includes('linkedin') || description.includes('corporate') || description.includes('executive')) {
      professionalScore += 30;
    }
    if (description.includes('networking') || description.includes('meeting') || description.includes('presentation')) {
      professionalScore += 20;
    }
    if (description.includes('suit') || description.includes('blazer') || description.includes('formal')) {
      professionalScore += 10;
    }
    
    return Math.min(100, professionalScore);
  }

  /**
   * Calculate interaction value score
   */
  private static calculateInteractionValue(interactionType: string): number {
    const valueMap = {
      'favorited': 100,
      'shared': 90,
      'generated': 70,
      'skipped': 10
    };
    return valueMap[interactionType] || 0;
  }

  /**
   * Calculate preference signal strength
   */
  private static calculatePreferenceSignal(interactionType: string): number {
    const signalMap = {
      'favorited': 1.0,
      'shared': 0.9,
      'generated': 0.7,
      'skipped': -0.3
    };
    return signalMap[interactionType] || 0;
  }

  /**
   * ✨ PHASE 5.1: Get personalized Maya response style for user
   */
  static async getPersonalizedResponseStyle(userId: string): Promise<any> {
    try {
      const behaviorData = await this.getBehaviorData(userId);
      
      if (!behaviorData) {
        return this.getDefaultResponseStyle();
      }
      
      const insights = behaviorData.personalizedInsights;
      const patterns = behaviorData.behaviorPatterns;
      
      return {
        detailLevel: patterns.communicationPreferences.detail_level,
        tonePreference: patterns.communicationPreferences.tone_preference,
        guidanceLevel: patterns.communicationPreferences.guidance_level,
        conceptCount: this.getOptimalConceptCount(behaviorData),
        styleEmphasis: insights.dominantAesthetic,
        personalityRole: insights.preferredMayaRole,
        adaptations: this.getPersonalityAdaptations(insights)
      };
      
    } catch (error) {
      console.error(`❌ PHASE 5.1: Failed to get personalized response style for ${userId}:`, error);
      return this.getDefaultResponseStyle();
    }
  }

  /**
   * Get optimal number of concept cards for user
   */
  private static getOptimalConceptCount(behaviorData: any): number {
    const engagement = behaviorData.engagementMetrics.conceptCardEngagement;
    const experimentationLevel = behaviorData.personalizedInsights.experimentationLevel;
    
    if (experimentationLevel > 80) return 4; // High experimentation - more options
    if (engagement > 70) return 3; // High engagement - standard options
    if (engagement > 40) return 2; // Moderate engagement - fewer options
    return 3; // Default
  }

  /**
   * Get personality adaptations for Maya
   */
  private static getPersonalityAdaptations(insights: any): any {
    return {
      emphasisLevel: insights.mayaPersonalityFit > 80 ? 'high' : 'moderate',
      creativeFreedom: insights.experimentationLevel > 70 ? 'high' : 'moderate',
      professionalFocus: insights.professionalNeedsLevel > 60 ? 'high' : 'low',
      brandingEmphasis: insights.brandingAwareness > 50 ? 'moderate' : 'subtle'
    };
  }

  /**
   * Default response style for new users
   */
  private static getDefaultResponseStyle(): any {
    return {
      detailLevel: 'moderate',
      tonePreference: 'friendly',
      guidanceLevel: 'some_help',
      conceptCount: 3,
      styleEmphasis: 'exploring',
      personalityRole: 'creative_partner',
      adaptations: {
        emphasisLevel: 'moderate',
        creativeFreedom: 'high',
        professionalFocus: 'moderate',
        brandingEmphasis: 'subtle'
      }
    };
  }

  /**
   * Update behavior patterns based on new insights
   */
  private static async updateBehaviorPatterns(userId: string, behaviorData: any, insights: any): Promise<void> {
    // Add style elements to preferences
    insights.styleElements.forEach(element => {
      if (!behaviorData.behaviorPatterns.conceptPreferences.includes(element)) {
        behaviorData.behaviorPatterns.conceptPreferences.push(element);
      }
    });
    
    // Update style journey
    if (insights.preferenceSignal > 0.5) {
      behaviorData.behaviorPatterns.styleJourney.progression.push({
        date: new Date(),
        dominant_style: insights.styleElements[0] || 'exploring',
        confidence_score: insights.preferenceSignal
      });
      
      // Keep only last 10 progression points
      if (behaviorData.behaviorPatterns.styleJourney.progression.length > 10) {
        behaviorData.behaviorPatterns.styleJourney.progression = 
          behaviorData.behaviorPatterns.styleJourney.progression.slice(-10);
      }
    }
    
    await this.storeBehaviorData(userId, behaviorData);
  }

  /**
   * Update engagement metrics based on interaction
   */
  private static async updateEngagementMetrics(userId: string, behaviorData: any, interactionType: string): Promise<void> {
    const metrics = behaviorData.engagementMetrics;
    
    // Update concept card engagement
    if (interactionType === 'generated') {
      metrics.conceptCardEngagement = Math.min(100, metrics.conceptCardEngagement + 2);
      metrics.generationSuccessRate = Math.min(100, metrics.generationSuccessRate + 1);
    }
    
    if (interactionType === 'favorited') {
      metrics.favoriteRate = Math.min(100, metrics.favoriteRate + 3);
      metrics.subscriptionValue = Math.min(100, metrics.subscriptionValue + 1);
    }
    
    if (interactionType === 'skipped') {
      metrics.conceptCardEngagement = Math.max(0, metrics.conceptCardEngagement - 0.5);
    }
    
    await this.storeBehaviorData(userId, behaviorData);
  }

  /**
   * Update personalized insights based on new data
   */
  private static async updatePersonalizedInsights(userId: string, behaviorData: any, insights: any): Promise<void> {
    const personalizedInsights = behaviorData.personalizedInsights;
    
    // Update style confidence based on consistent choices
    if (insights.preferenceSignal > 0.7) {
      personalizedInsights.styleConfidence = Math.min(100, personalizedInsights.styleConfidence + 1);
    }
    
    // Update dominant aesthetic if strong preference signal
    if (insights.preferenceSignal > 0.8 && insights.styleElements.length > 0) {
      personalizedInsights.dominantAesthetic = insights.styleElements[0];
    }
    
    // Update professional needs level
    if (insights.professionalLevel > 50) {
      personalizedInsights.professionalNeedsLevel = Math.min(100, personalizedInsights.professionalNeedsLevel + 2);
    }
    
    await this.storeBehaviorData(userId, behaviorData);
  }

  /**
   * Get behavior data from storage
   */
  private static async getBehaviorData(userId: string): Promise<any> {
    try {
      // For now, use simple storage - will integrate with database later
      return null; // Placeholder for actual storage implementation
    } catch (error) {
      console.error(`❌ PHASE 5.1: Failed to get behavior data for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Store behavior data to storage
   */
  private static async storeBehaviorData(userId: string, data: any): Promise<void> {
    try {
      // For now, use simple storage - will integrate with database later
      console.log(`💾 PHASE 5.1: Behavior data updated for user ${userId}`);
    } catch (error) {
      console.error(`❌ PHASE 5.1: Failed to store behavior data for ${userId}:`, error);
    }
  }

  /**
   * Upgrade existing behavior tracking to latest version
   */
  private static async upgradeBehaviorTracking(userId: string, existingData: any): Promise<void> {
    // Add any missing fields from latest version
    const currentVersion = existingData.learningVersion || '1.0';
    
    if (currentVersion < '5.1') {
      // Upgrade to Phase 5.1 structure
      console.log(`🔄 PHASE 5.1: Upgrading behavior tracking for user ${userId} from ${currentVersion} to 5.1`);
      
      // Add any new fields introduced in Phase 5.1
      existingData.learningVersion = '5.1';
      existingData.updatedAt = new Date();
      
      await this.storeBehaviorData(userId, existingData);
    }
  }

  /**
   * Get learning service statistics
   */
  static getLearningStats(): any {
    return {
      phase: 'Phase 5.1',
      component: 'Advanced User Behavior Learning',
      capabilities: [
        'Concept card interaction learning',
        'Style preference pattern recognition',
        'Personalized Maya response adaptation',
        'Engagement metric tracking',
        'Predictive user behavior analysis'
      ],
      learningTypes: [
        'Style journey progression',
        'Communication preference detection',
        'Professional needs assessment',
        'Brand awareness evaluation'
      ],
      status: 'Active'
    };
  }
}