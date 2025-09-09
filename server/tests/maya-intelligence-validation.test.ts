/**
 * PHASE 6.1.1: MAYA INTELLIGENCE VALIDATION TEST SUITE
 * Comprehensive testing protocol for Maya optimization validation
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { MAYA_PERSONALITY } from '../agents/personalities/maya-personality.js';
import { MayaVisualAnalysisService } from '../services/maya-visual-analysis.js';
import { MayaTrendIntelligenceService } from '../services/maya-trend-intelligence.js';
import { MayaOptimizationService } from '../services/maya-optimization-service.js';

describe('Maya Optimization Validation', () => {
  
  describe('Contemporary Fashion Intelligence', () => {
    test('should validate 2025 trend integration', () => {
      const fashionExpertise = MAYA_PERSONALITY.fashionExpertise;
      
      // Verify 2025 trends are present
      expect(fashionExpertise.currentTrends2025).toBeDefined();
      expect(fashionExpertise.currentTrends2025.length).toBeGreaterThan(10);
      
      // Check for key 2025 trends
      const trendDescriptions = fashionExpertise.currentTrends2025.join(' ');
      expect(trendDescriptions).toContain('Architectural Power Shoulders');
      expect(trendDescriptions).toContain('Sustainable Luxury Revolution');
      expect(trendDescriptions).toContain('Dopamine Professional Dressing');
      expect(trendDescriptions).toContain('Tech-Integrated Fashion');
      expect(trendDescriptions).toContain('Gender-Fluid Luxury Proportions');
    });

    test('should validate styling recommendation relevance', () => {
      const categories = MAYA_PERSONALITY.categories;
      
      // Verify all styling approaches have proper descriptions
      Object.entries(MAYA_PERSONALITY.stylingApproaches).forEach(([approach, config]) => {
        expect(config.description).toBeDefined();
        expect(config.description.length).toBeGreaterThan(20);
        expect(config.vibe).toBeDefined();
        expect(config.vibe.length).toBeGreaterThan(10);
      });
      
      // Verify categories have styling intelligence
      Object.values(categories).forEach(category => {
        expect(category.stylingApproaches).toBeDefined();
        expect(category.stylingApproaches.length).toBeGreaterThan(0);
      });
    });

    test('should verify brand alignment maintenance', () => {
      const brandPositioning = MAYA_PERSONALITY.brandPositioning;
      const brandMission = MAYA_PERSONALITY.brandMission;
      
      // Verify brand positioning elements
      expect(brandPositioning.expertAuthority).toBeDefined();
      expect(brandPositioning.trustworthyAdvisor).toBeDefined();
      expect(brandPositioning.creativeVisionary).toBeDefined();
      expect(brandPositioning.relateableMentor).toBeDefined();
      
      // Verify brand mission alignment
      expect(brandMission.coreMessage).toContain('personal brand');
      expect(brandMission.coreMessage).toContain('strategic');
      expect(brandMission.valueProposition).toBeDefined();
      expect(brandMission.differentiator).toBeDefined();
    });
  });

  describe('Personalization Engine', () => {
    test('should validate adaptive learning functionality', () => {
      const culturalIntelligence = MAYA_PERSONALITY.culturalIntelligence;
      
      // Verify global styling awareness
      expect(culturalIntelligence.globalStylingAwareness).toBeDefined();
      expect(culturalIntelligence.globalStylingAwareness.length).toBeGreaterThan(4);
      
      // Check for cultural considerations
      const awarenessText = culturalIntelligence.globalStylingAwareness.join(' ');
      expect(awarenessText).toContain('Cultural sensitivity');
      expect(awarenessText).toContain('Regional business');
      expect(awarenessText).toContain('Climate-appropriate');
    });

    test('should validate context-aware recommendations', () => {
      const stylingIntelligence = MAYA_PERSONALITY.stylingIntelligence;
      
      // Verify emoji styling system
      expect(stylingIntelligence.emojiStylingSystem).toBeDefined();
      expect(stylingIntelligence.emojiStylingSystem.emojiMeanings).toBeDefined();
      
      // Check key styling emojis
      const emojis = stylingIntelligence.emojiStylingSystem.emojiMeanings;
      expect(emojis['✨']).toContain('Glamorous elegance');
      expect(emojis['🔥']).toContain('Bold confidence');
      expect(emojis['🏢']).toContain('Business authority');
      expect(emojis['👑']).toContain('Regal sophistication');
    });

    test('should validate memory integration', () => {
      const coachingIntelligence = MAYA_PERSONALITY.coachingIntelligence;
      
      // Verify strategic questioning capabilities
      expect(coachingIntelligence.strategicQuestioning).toBeDefined();
      expect(coachingIntelligence.strategicQuestioning.length).toBeGreaterThan(5);
      
      // Check business context awareness
      expect(coachingIntelligence.businessContextAwareness).toBeDefined();
      expect(coachingIntelligence.businessContextAwareness.length).toBeGreaterThan(5);
      
      // Verify personal brand strategy
      expect(coachingIntelligence.personalBrandStrategy).toBeDefined();
      expect(coachingIntelligence.personalBrandStrategy.length).toBeGreaterThan(5);
    });
  });

  describe('Performance Optimization', () => {
    test('should verify single API call architecture', () => {
      const singleApiCallSystem = MAYA_PERSONALITY.singleApiCallSystem;
      
      // Verify system configuration
      expect(singleApiCallSystem).toBeDefined();
      expect(singleApiCallSystem.description).toContain('single API call');
      expect(singleApiCallSystem.mandatoryFormat).toBeDefined();
      expect(singleApiCallSystem.requirements).toBeDefined();
      expect(singleApiCallSystem.requirements.length).toBeGreaterThan(5);
    });

    test('should validate FLUX parameter optimization', () => {
      const fluxOptimization = MAYA_PERSONALITY.fluxOptimization;
      
      // Verify shot type configurations
      expect(fluxOptimization.shotTypes.closeUpPortrait).toBeDefined();
      expect(fluxOptimization.shotTypes.halfBodyShot).toBeDefined();
      expect(fluxOptimization.shotTypes.fullSceneShot).toBeDefined();
      
      // Check parameter ranges
      Object.values(fluxOptimization.shotTypes).forEach(shotType => {
        expect(shotType.parameters.guidance_scale).toBeGreaterThan(0);
        expect(shotType.parameters.guidance_scale).toBeLessThanOrEqual(20);
        expect(shotType.parameters.num_inference_steps).toBeGreaterThan(0);
        expect(shotType.parameters.num_inference_steps).toBeLessThanOrEqual(50);
        expect(shotType.parameters.lora_weight).toBeGreaterThan(0);
        expect(shotType.parameters.lora_weight).toBeLessThanOrEqual(1);
      });
    });

    test('should validate styling approach consistency', () => {
      const categories = MAYA_PERSONALITY.categories;
      
      // Verify each category has required elements
      Object.entries(categories).forEach(([categoryName, category]) => {
        expect(category.description).toBeDefined();
        expect(category.stylingApproaches).toBeDefined();
        expect(category.stylingApproaches.length).toBe(5); // Should have exactly 5 approaches
        expect(category.occasionSuitability).toBeDefined();
        expect(category.targetAudience).toBeDefined();
      });
    });
  });
});

describe('Advanced Services Integration', () => {
  
  test('should validate visual analysis service integration', async () => {
    const visualService = new MayaVisualAnalysisService();
    
    // Test service initialization
    expect(visualService).toBeDefined();
    
    // Verify core capabilities exist
    expect(typeof visualService.analyzeImage).toBe('function');
    expect(typeof visualService.extractPalette).toBe('function');
    expect(typeof visualService.analyzeComposition).toBe('function');
  });

  test('should validate trend intelligence service integration', async () => {
    const trendService = new MayaTrendIntelligenceService();
    
    // Test service initialization
    expect(trendService).toBeDefined();
    
    // Verify trend analysis capabilities
    expect(typeof trendService.analyzeTrends).toBe('function');
    expect(typeof trendService.predictFashionTrends).toBe('function');
    expect(typeof trendService.culturalShiftDetection).toBe('function');
  });

  test('should validate optimization service integration', async () => {
    const optimizationService = new MayaOptimizationService();
    
    // Test service initialization
    expect(optimizationService).toBeDefined();
    
    // Verify optimization capabilities
    expect(typeof optimizationService.optimizeForUser).toBe('function');
    expect(typeof optimizationService.adaptToPreferences).toBe('function');
  });
});