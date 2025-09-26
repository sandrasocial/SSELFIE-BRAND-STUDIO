/**
 * ✨ PHASE 3: UNIFIED MAYA INTELLIGENCE SERVICE
 * 
 * CRITICAL INTELLIGENCE CONSOLIDATION: Combines all Maya styling intelligence into single optimized system
 * 
 * BEFORE: 4 separate intelligence services causing processing overhead
 * - user-style-memory.ts (276 lines) -> User preference tracking & learning
 * - maya-predictive-styling-service.ts (490 lines) -> Style predictions & forecasting  
 * - brand-intelligence-service.ts (61 lines) -> Brand guidelines & voice
 * - maya-trend-intelligence.ts (557 lines) -> Trend analysis & forecasting
 * 
 * AFTER: Single unified intelligence engine
 * - Consolidated user learning and style prediction
 * - Integrated brand voice with trend intelligence
 * - Optimized database queries for style data
 * - Unified interface for all Maya styling decisions
 * 
 * TARGET: 40%+ intelligence processing time reduction
 */

import { db } from '../drizzle';
import { userStyleMemory, promptAnalysis, aiImages } from '../../shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { unifiedMayaContextService, type UnifiedMayaContext } from './unified-maya-context-service.js';

// ===== CORE INTELLIGENCE INTERFACES =====

export interface UnifiedStyleIntelligence {
  // User Learning Intelligence  
  userProfile: UserStyleProfile;
  stylePreferences: StylePreferences;
  learningInsights: LearningInsights;
  
  // Predictive Intelligence
  stylePredictions: StylePredictions;
  trendIntelligence: TrendIntelligence;
  seasonalInsights: SeasonalInsights;
  
  // Brand Intelligence
  brandAlignment: BrandAlignment;
  voiceGuidance: VoiceGuidance;
  editorialDirection: EditorialDirection;
  
  // Performance Metrics
  intelligenceConfidence: number;
  processingTime: number;
  cacheStatus: 'hit' | 'miss' | 'stale';
}

export interface UserStyleProfile {
  // Core Preferences (from user-style-memory.ts)
  preferredCategories: string[];
  favoritePromptPatterns: string[];
  colorPreferences: string[];
  settingPreferences: string[];
  stylingKeywords: string[];
  
  // Learning Metrics
  totalInteractions: number;
  totalFavorites: number;
  averageSessionLength: number;
  successScore: number;
  
  // Intelligence Evolution
  styleEvolutionPhase: 'discovery' | 'exploration' | 'refinement' | 'mastery';
  confidenceLevel: number;
  experimentationWillingness: number;
}

export interface StylePredictions {
  // Next-Session Predictions
  predictedStyles: string[];
  confidenceScores: Record<string, number>;
  reasoningBasis: string[];
  
  // Trend Alignment  
  personalizedTrends: string[];
  trendAdoptionTimeline: Record<string, string>;
  trendMixingOpportunities: string[];
  
  // Advanced Intelligence
  styleEvolutionPath: string[];
  comfortZoneExpansions: string[];
  expertRecommendations: string[];
}

export interface BrandAlignment {
  // Sandra's Brand Integration
  brandVoice: 'empowering' | 'bold' | 'relatable' | 'direct';
  messagingStyle: string[];
  businessContext: string[];
  
  // Editorial Consistency
  visualDirection: string[];
  colorScheme: string[];
  typographyGuidance: string[];
}

// ===== SUPPORTING INTERFACES =====

export interface StylePreferences {
  weights: Record<string, number>;
  categories: string[];
  colors: string[];
  settings: string[];
  keywords: string[];
}

export interface LearningInsights {
  topPatterns: string[];
  successFactors: string[];
  improvementAreas: string[];
  nextLevelSuggestions: string[];
}

export interface TrendIntelligence {
  currentTrends: string[];
  emergingTrends: string[];
  personalTrendFit: Record<string, number>;
  trendAdoptionStrategy: string[];
}

export interface SeasonalInsights {
  currentSeasonOptimal: string[];
  upcomingSeasonPrep: string[];
  weatherConsiderations: string[];
  eventOpportunities: string[];
}

export interface VoiceGuidance {
  conversationalTone: string[];
  messagingApproach: string[];
  encouragementStyle: string[];
  expertiseLevel: string[];
}

export interface EditorialDirection {
  visualHierarchy: string[];
  componentStyling: string[];
  colorPalette: string[];
  layoutPrinciples: string[];
}

// ===== UNIFIED MAYA INTELLIGENCE SERVICE =====

export class UnifiedMayaIntelligenceService {
  private intelligenceCache: Map<string, { data: UnifiedStyleIntelligence; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  
  /**
   * 🎯 PHASE 3: Get complete Maya intelligence with single call
   * 
   * Consolidates all style intelligence services into optimized unified response
   */
  async getUnifiedStyleIntelligence(
    userId: string,
    context?: UnifiedMayaContext,
    requestType?: 'chat' | 'generation' | 'analysis'
  ): Promise<UnifiedStyleIntelligence> {
    const cacheKey = `${userId}_${requestType || 'default'}`;
    
    // Check intelligence cache
    const cached = this.intelligenceCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`⚡ UNIFIED INTELLIGENCE: Cache hit for user ${userId}`);
      return cached.data;
    }
    
    console.log(`🧠 UNIFIED INTELLIGENCE: Building comprehensive intelligence for user ${userId}`);
    const startTime = Date.now();
    
    try {
      // Get unified context if not provided (optimization: avoid duplicate calls)
      const userContext = context || await unifiedMayaContextService.getUnifiedMayaContext(userId);
      
      // PHASE 3: Single parallel intelligence gathering (replaces 4 separate service calls)
      const [userProfile, stylePredictions, brandAlignment] = await Promise.all([
        this.buildUserStyleProfile(userId, userContext),
        this.generateStylePredictions(userId, userContext),
        this.getBrandAlignment(userContext)
      ]);
      
      // Build unified intelligence object
      const unifiedIntelligence: UnifiedStyleIntelligence = {
        userProfile,
        stylePreferences: this.extractStylePreferences(userProfile),
        learningInsights: this.generateLearningInsights(userProfile),
        stylePredictions,
        trendIntelligence: this.buildTrendIntelligence(stylePredictions, userProfile),
        seasonalInsights: this.generateSeasonalInsights(),
        brandAlignment,
        voiceGuidance: this.getVoiceGuidance(brandAlignment),
        editorialDirection: this.getEditorialDirection(),
        intelligenceConfidence: this.calculateIntelligenceConfidence(userProfile, stylePredictions),
        processingTime: Date.now() - startTime,
        cacheStatus: 'miss'
      };
      
      // Cache for performance
      this.intelligenceCache.set(cacheKey, {
        data: unifiedIntelligence,
        timestamp: Date.now()
      });
      
      console.log(`✅ UNIFIED INTELLIGENCE: Complete intelligence built in ${unifiedIntelligence.processingTime}ms (confidence: ${unifiedIntelligence.intelligenceConfidence}%)`);
      return unifiedIntelligence;
      
    } catch (error) {
      console.error(`❌ UNIFIED INTELLIGENCE: Failed for user ${userId}:`, error);
      return this.createFallbackIntelligence(userId);
    }
  }
  
  /**
   * 🎯 PHASE 3: Build comprehensive user style profile
   * Consolidates user-style-memory.ts functionality
   */
  private async buildUserStyleProfile(userId: string, context: UnifiedMayaContext): Promise<UserStyleProfile> {
    try {
      // Get existing style memory from database
      const [styleMemory] = await db
        .select()
        .from(userStyleMemory)
        .where(eq(userStyleMemory.userId, userId))
        .limit(1);
      
      // Get recent prompt analysis for success scoring
      const recentAnalysis = await db
        .select()
        .from(promptAnalysis)
        .where(eq(promptAnalysis.userId, userId))
        .orderBy(desc(promptAnalysis.createdAt))
        .limit(20);
      
      const averageSuccessScore = recentAnalysis.length > 0
        ? recentAnalysis.reduce((sum, a) => sum + (parseFloat(a.successScore as string) || 0), 0) / recentAnalysis.length
        : 0;
      
      // Determine style evolution phase based on data
      const styleEvolutionPhase = this.determineStylePhase(
        styleMemory?.totalInteractions || 0,
        styleMemory?.totalFavorites || 0,
        averageSuccessScore
      );
      
      return {
        preferredCategories: styleMemory?.preferredCategories as string[] || [],
        favoritePromptPatterns: styleMemory?.favoritePromptPatterns as string[] || [],
        colorPreferences: styleMemory?.colorPreferences as string[] || [],
        settingPreferences: styleMemory?.settingPreferences as string[] || [],
        stylingKeywords: styleMemory?.stylingKeywords as string[] || [],
        totalInteractions: styleMemory?.totalInteractions || 0,
        totalFavorites: styleMemory?.totalFavorites || 0,
        averageSessionLength: styleMemory?.averageSessionLength || 0,
        successScore: Math.round(averageSuccessScore * 100),
        styleEvolutionPhase,
        confidenceLevel: this.calculateConfidenceLevel(styleMemory?.totalInteractions || 0, averageSuccessScore),
        experimentationWillingness: this.calculateExperimentationWillingness(styleEvolutionPhase, averageSuccessScore)
      };
      
    } catch (error) {
      console.error(`❌ USER STYLE PROFILE: Failed to build for ${userId}:`, error);
      return this.getDefaultStyleProfile();
    }
  }
  
  /**
   * 🎯 PHASE 3: Generate style predictions
   * Consolidates maya-predictive-styling-service.ts functionality
   */
  private async generateStylePredictions(userId: string, context: UnifiedMayaContext): Promise<StylePredictions> {
    try {
      // Use context data for intelligent predictions
      const personalBrand = context.personalBrand;
      const profile = context.profile;
      
      // Generate predictions based on personal brand and context
      const predictedStyles = this.predictStylesFromContext(personalBrand, profile);
      const personalizedTrends = this.getPersonalizedTrends(predictedStyles);
      
      return {
        predictedStyles,
        confidenceScores: this.calculateStyleConfidence(predictedStyles),
        reasoningBasis: this.getReasoningBasis(personalBrand, profile),
        personalizedTrends,
        trendAdoptionTimeline: this.createTrendTimeline(personalizedTrends),
        trendMixingOpportunities: this.findTrendMixingOpportunities(predictedStyles, personalizedTrends),
        styleEvolutionPath: this.createStyleEvolutionPath(predictedStyles),
        comfortZoneExpansions: this.suggestComfortZoneExpansions(predictedStyles),
        expertRecommendations: this.generateExpertRecommendations(predictedStyles)
      };
      
    } catch (error) {
      console.error(`❌ STYLE PREDICTIONS: Failed for ${userId}:`, error);
      return this.getDefaultStylePredictions();
    }
  }
  
  /**
   * 🎯 PHASE 3: Get brand alignment
   * Consolidates brand-intelligence-service.ts functionality
   */
  private getBrandAlignment(context: UnifiedMayaContext): BrandAlignment {
    // Sandra's brand intelligence integration
    return {
      brandVoice: 'empowering',
      messagingStyle: [
        "Let's be real for a second...",
        "Here's the thing...",
        "Can I tell you something?",
        "Your photos are your business card now"
      ],
      businessContext: [
        'AI-powered personal branding: €47/month',
        'TRAIN → STYLE → GALLERY workflow',
        'Professional photos for entrepreneurs',
        'Visibility over vanity messaging'
      ],
      visualDirection: [
        'Magazine-inspired editorial style',
        'Professional yet approachable',
        'Luxury feel with accessibility'
      ],
      colorScheme: ['#0a0a0a', '#ffffff', '#f5f5f5', '#666666'],
      typographyGuidance: ['Times New Roman headers', 'Clean sans-serif body', 'Generous white space']
    };
  }
  
  // ===== HELPER METHODS =====
  
  private determineStylePhase(interactions: number, favorites: number, successScore: number): UserStyleProfile['styleEvolutionPhase'] {
    if (interactions < 10) return 'discovery';
    if (interactions < 50 && successScore < 0.6) return 'exploration';
    if (interactions < 100 && successScore >= 0.6) return 'refinement';
    return 'mastery';
  }
  
  private calculateConfidenceLevel(interactions: number, successScore: number): number {
    return Math.min(100, Math.round((interactions * 0.5) + (successScore * 50)));
  }
  
  private calculateExperimentationWillingness(phase: UserStyleProfile['styleEvolutionPhase'], successScore: number): number {
    const phaseMultiplier = { discovery: 0.8, exploration: 1.0, refinement: 0.6, mastery: 0.4 };
    return Math.round((phaseMultiplier[phase] * 100) + (successScore * 20));
  }
  
  private predictStylesFromContext(personalBrand: any, profile: any): string[] {
    const styles = ['Professional Executive', 'Approachable Expert', 'Creative Professional'];
    
    if (personalBrand?.businessContext?.businessType) {
      styles.push(`${personalBrand.businessContext.businessType} Specialist`);
    }
    
    if (profile?.profession) {
      styles.push(`${profile.profession} Authority`);
    }
    
    return styles.slice(0, 5); // Top 5 predictions
  }
  
  private getPersonalizedTrends(predictedStyles: string[]): string[] {
    return [
      'Authentic Professional Portraits',
      'Accessible Luxury Styling',
      'Modern Executive Presence',
      'Entrepreneurial Confidence'
    ];
  }
  
  private calculateStyleConfidence(styles: string[]): Record<string, number> {
    return styles.reduce((acc, style, index) => {
      acc[style] = Math.round(85 - (index * 5)); // Decreasing confidence
      return acc;
    }, {} as Record<string, number>);
  }
  
  private getReasoningBasis(personalBrand: any, profile: any): string[] {
    return [
      'Personal brand alignment',
      'Professional context',
      'Business goals compatibility',
      'Target audience appeal'
    ];
  }
  
  private createTrendTimeline(trends: string[]): Record<string, string> {
    return trends.reduce((acc, trend, index) => {
      const timeline = ['Current', 'Next 2 weeks', 'Next month', 'Next season'][index] || 'Future';
      acc[trend] = timeline;
      return acc;
    }, {} as Record<string, string>);
  }
  
  private findTrendMixingOpportunities(styles: string[], trends: string[]): string[] {
    return [
      `Combine ${styles[0]} with ${trends[0]}`,
      `Integrate ${styles[1]} and ${trends[1]}`,
      `Blend ${styles[2]} with modern elements`
    ];
  }
  
  private createStyleEvolutionPath(styles: string[]): string[] {
    return [
      `Start with ${styles[0]}`,
      `Develop comfort with ${styles[1]}`,
      `Master ${styles[2]}`,
      'Explore advanced variations'
    ];
  }
  
  private suggestComfortZoneExpansions(styles: string[]): string[] {
    return [
      'Try one bold color accent',
      'Experiment with different settings',
      'Add personality through accessories',
      'Incorporate trending styling elements'
    ];
  }
  
  private generateExpertRecommendations(styles: string[]): string[] {
    return [
      `Focus on ${styles[0]} for maximum impact`,
      'Build style consistency across sessions',
      'Document your favorite results',
      'Plan seasonal style evolution'
    ];
  }
  
  // ===== SUPPORTING INTELLIGENCE METHODS =====
  
  private extractStylePreferences(profile: UserStyleProfile): StylePreferences {
    return {
      weights: profile.preferredCategories.reduce((acc, cat, i) => {
        acc[cat] = 100 - (i * 10);
        return acc;
      }, {} as Record<string, number>),
      categories: profile.preferredCategories,
      colors: profile.colorPreferences,
      settings: profile.settingPreferences,
      keywords: profile.stylingKeywords
    };
  }
  
  private generateLearningInsights(profile: UserStyleProfile): LearningInsights {
    return {
      topPatterns: profile.favoritePromptPatterns.slice(0, 3),
      successFactors: ['Consistent style preferences', 'Clear vision', 'Professional focus'],
      improvementAreas: profile.successScore < 70 ? ['Style exploration', 'Concept refinement'] : [],
      nextLevelSuggestions: this.getNextLevelSuggestions(profile.styleEvolutionPhase)
    };
  }
  
  private getNextLevelSuggestions(phase: UserStyleProfile['styleEvolutionPhase']): string[] {
    const suggestions = {
      discovery: ['Try different categories', 'Experiment with Maya suggestions'],
      exploration: ['Focus on favorites', 'Build style consistency'],
      refinement: ['Master advanced techniques', 'Develop signature style'],
      mastery: ['Mentor others', 'Innovate new approaches']
    };
    return suggestions[phase] || [];
  }
  
  private buildTrendIntelligence(predictions: StylePredictions, profile: UserStyleProfile): TrendIntelligence {
    return {
      currentTrends: predictions.personalizedTrends,
      emergingTrends: ['Sustainable Professional Styling', 'Hybrid Work Presence', 'Authentic Authority'],
      personalTrendFit: predictions.personalizedTrends.reduce((acc, trend, i) => {
        acc[trend] = 90 - (i * 10);
        return acc;
      }, {} as Record<string, number>),
      trendAdoptionStrategy: ['Start with one trend', 'Integrate gradually', 'Make it personal']
    };
  }
  
  private generateSeasonalInsights(): SeasonalInsights {
    const currentSeason = this.getCurrentSeason();
    return {
      currentSeasonOptimal: this.getSeasonalStyles(currentSeason),
      upcomingSeasonPrep: this.getSeasonalStyles(this.getNextSeason(currentSeason)),
      weatherConsiderations: ['Indoor professional settings', 'Natural lighting optimization'],
      eventOpportunities: ['Conference season', 'Networking events', 'Speaking engagements']
    };
  }
  
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }
  
  private getSeasonalStyles(season: string): string[] {
    const styles = {
      Spring: ['Fresh professional looks', 'Light layering', 'Renewed energy styling'],
      Summer: ['Confident warm weather presence', 'Natural lighting optimization'],
      Fall: ['Executive authority', 'Rich professional tones', 'Conference ready'],
      Winter: ['Sophisticated indoor presence', 'Holiday networking ready']
    };
    return styles[season as keyof typeof styles] || [];
  }
  
  private getNextSeason(current: string): string {
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const index = seasons.indexOf(current);
    return seasons[(index + 1) % 4];
  }
  
  private getVoiceGuidance(brandAlignment: BrandAlignment): VoiceGuidance {
    return {
      conversationalTone: brandAlignment.messagingStyle,
      messagingApproach: ['Empowering but grounded', 'Bold and direct', 'Relatable struggles'],
      encouragementStyle: ['Best friend energy', 'No toxic positivity', 'Real experience'],
      expertiseLevel: ['Lived experience authority', 'Practical wisdom', 'Supportive guidance']
    };
  }
  
  private getEditorialDirection(): EditorialDirection {
    return {
      visualHierarchy: ['Large serif headers', 'Editorial spacing', 'Magazine proportions'],
      componentStyling: ['Clean borders', 'Hover transformations', 'Luxury transitions'],
      colorPalette: ['Editorial blacks', 'Pure whites', 'Soft grays'],
      layoutPrinciples: ['12-column grid', 'Generous white space', 'Professional elegance']
    };
  }
  
  private calculateIntelligenceConfidence(profile: UserStyleProfile, predictions: StylePredictions): number {
    const dataPoints = profile.totalInteractions + profile.totalFavorites;
    const successWeight = profile.successScore;
    const predictionWeight = predictions.predictedStyles.length * 10;
    
    return Math.min(100, Math.round((dataPoints * 0.5) + (successWeight * 0.3) + (predictionWeight * 0.2)));
  }
  
  // ===== FALLBACK METHODS =====
  
  private createFallbackIntelligence(userId: string): UnifiedStyleIntelligence {
    return {
      userProfile: this.getDefaultStyleProfile(),
      stylePreferences: { weights: {}, categories: [], colors: [], settings: [], keywords: [] },
      learningInsights: { topPatterns: [], successFactors: [], improvementAreas: [], nextLevelSuggestions: [] },
      stylePredictions: this.getDefaultStylePredictions(),
      trendIntelligence: { currentTrends: [], emergingTrends: [], personalTrendFit: {}, trendAdoptionStrategy: [] },
      seasonalInsights: { currentSeasonOptimal: [], upcomingSeasonPrep: [], weatherConsiderations: [], eventOpportunities: [] },
      brandAlignment: this.getBrandAlignment({} as UnifiedMayaContext),
      voiceGuidance: { conversationalTone: [], messagingApproach: [], encouragementStyle: [], expertiseLevel: [] },
      editorialDirection: this.getEditorialDirection(),
      intelligenceConfidence: 0,
      processingTime: 0,
      cacheStatus: 'miss'
    };
  }
  
  private getDefaultStyleProfile(): UserStyleProfile {
    return {
      preferredCategories: ['Professional', 'Business', 'Executive'],
      favoritePromptPatterns: [],
      colorPreferences: [],
      settingPreferences: [],
      stylingKeywords: [],
      totalInteractions: 0,
      totalFavorites: 0,
      averageSessionLength: 0,
      successScore: 0,
      styleEvolutionPhase: 'discovery',
      confidenceLevel: 0,
      experimentationWillingness: 80
    };
  }
  
  private getDefaultStylePredictions(): StylePredictions {
    return {
      predictedStyles: ['Professional Executive', 'Approachable Expert'],
      confidenceScores: { 'Professional Executive': 85, 'Approachable Expert': 80 },
      reasoningBasis: ['New user defaults', 'Professional context'],
      personalizedTrends: ['Authentic Professional Presence'],
      trendAdoptionTimeline: { 'Authentic Professional Presence': 'Current' },
      trendMixingOpportunities: [],
      styleEvolutionPath: ['Start with professional basics'],
      comfortZoneExpansions: ['Try Maya suggestions'],
      expertRecommendations: ['Focus on building confidence']
    };
  }
  
  /**
   * 🎯 PHASE 3: Clear intelligence cache for user
   */
  clearUserIntelligenceCache(userId: string): void {
    const keysToDelete = Array.from(this.intelligenceCache.keys()).filter(key => key.startsWith(userId));
    keysToDelete.forEach(key => this.intelligenceCache.delete(key));
    console.log(`🗑️ UNIFIED INTELLIGENCE: Cleared cache for user ${userId}`);
  }
  
  /**
   * 🎯 PHASE 3: Get intelligence cache statistics
   */
  getIntelligenceCacheStats(): { totalCached: number; hitRate: number; avgProcessingTime: number } {
    const totalCached = this.intelligenceCache.size;
    // TODO: Implement hit rate and processing time tracking
    return {
      totalCached,
      hitRate: 0, // Will be implemented with usage tracking
      avgProcessingTime: 0 // Will be implemented with performance tracking
    };
  }
}

// Export singleton instance
export const unifiedMayaIntelligenceService = new UnifiedMayaIntelligenceService();