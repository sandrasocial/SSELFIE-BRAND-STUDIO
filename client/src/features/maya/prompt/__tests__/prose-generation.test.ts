/**
 * Snapshot Tests for Prose Generation Quality
 * Ensures generated prose contains expected elements and maintains quality
 */

import { SentenceRealizer } from '../realizers/sentence-realizer';
import { FluxRealizer } from '../realizers/flux-realizer';
import { AESTHETIC_RECIPES } from '../recipes/index';
import { GenderStyleSelector } from '../selectors/gender-style-selector';

describe('Prose Generation Quality', () => {
  
  describe('Generated Prose Content', () => {
    it('should contain expected camera/light/setting terms', () => {
      const recipe = AESTHETIC_RECIPES[0]; // Scandinavian Minimalist
      const look = GenderStyleSelector.selectGenderLook(recipe, 'woman');
      
      if (!look) {
        fail('No look selected for recipe');
        return;
      }
      
      const prose = SentenceRealizer.generateProse(recipe, look, {
        targetWordCount: 200,
        userGender: 'woman'
      });
      
      // Check for camera-related terms
      const cameraTerms = ['composition', 'frame', 'shot', 'photography', 'lens', 'focus'];
      const hasCameraTerms = cameraTerms.some(term => 
        prose.text.toLowerCase().includes(term)
      );
      expect(hasCameraTerms).toBe(true);
      
      // Check for lighting terms
      const lightingTerms = ['light', 'lighting', 'glow', 'illumination', 'shadows', 'brightness'];
      const hasLightingTerms = lightingTerms.some(term => 
        prose.text.toLowerCase().includes(term)
      );
      expect(hasLightingTerms).toBe(true);
      
      // Check for setting terms
      const settingTerms = ['space', 'environment', 'setting', 'room', 'interior', 'architecture'];
      const hasSettingTerms = settingTerms.some(term => 
        prose.text.toLowerCase().includes(term)
      );
      expect(hasSettingTerms).toBe(true);
      
      // Verify word count is in target range
      expect(prose.wordCount).toBeGreaterThanOrEqual(150);
      expect(prose.wordCount).toBeLessThanOrEqual(300);
    });
    
    it('should generate different prose for different recipes', () => {
      const recipes = [
        AESTHETIC_RECIPES.find(r => r.id === 'scandinavian-minimalist'),
        AESTHETIC_RECIPES.find(r => r.id === 'urban-moody'),
        AESTHETIC_RECIPES.find(r => r.id === 'golden-hour-glow')
      ].filter(Boolean);
      
      const proseTexts = recipes.map(recipe => {
        const look = GenderStyleSelector.selectGenderLook(recipe!, 'woman');
        if (!look) return '';
        
        const prose = SentenceRealizer.generateProse(recipe!, look, {
          targetWordCount: 150,
          userGender: 'woman'
        });
        return prose.text;
      });
      
      // Each prose should be unique
      expect(new Set(proseTexts).size).toBe(proseTexts.length);
      
      // Each prose should reflect its recipe's characteristics
      expect(proseTexts[0]).toMatch(/minimalist|clean|bright|nordic|scandinavian/i);
      expect(proseTexts[1]).toMatch(/urban|moody|dramatic|sophisticated|city/i);
      expect(proseTexts[2]).toMatch(/golden|warm|hour|natural|authentic/i);
    });
    
    it('should maintain narrative flow and readability', () => {
      const recipe = AESTHETIC_RECIPES.find(r => r.id === 'high-end-coastal');
      const look = GenderStyleSelector.selectGenderLook(recipe!, 'man');
      
      if (!look || !recipe) {
        fail('Recipe or look not found');
        return;
      }
      
      const prose = SentenceRealizer.generateProse(recipe, look, {
        targetWordCount: 200,
        userGender: 'man'
      });
      
      const text = prose.text;
      
      // Should be proper sentences (not fragments)
      const sentences = text.split(/\.\s+/);
      expect(sentences.length).toBeGreaterThan(3);
      
      // Each sentence should be reasonably long (not just keywords)
      const avgSentenceLength = text.length / sentences.length;
      expect(avgSentenceLength).toBeGreaterThan(20);
      
      // Should start with capital letter and end with period
      expect(text.charAt(0)).toMatch(/[A-Z]/);
      expect(text.trim().endsWith('.')).toBe(true);
      
      // Should contain connecting words for flow
      const connectors = ['and', 'while', 'with', 'through', 'creating', 'featuring'];
      const hasConnectors = connectors.some(connector => 
        text.toLowerCase().includes(connector)
      );
      expect(hasConnectors).toBe(true);
    });
  });
  
  describe('FLUX Prompt Quality', () => {
    it('should generate properly structured FLUX prompts', () => {
      const recipe = AESTHETIC_RECIPES.find(r => r.id === 'white-space-executive');
      const look = GenderStyleSelector.selectGenderLook(recipe!, 'non-binary');
      
      if (!look || !recipe) {
        fail('Recipe or look not found');
        return;
      }
      
      const fluxPrompt = FluxRealizer.generateFluxPrompt(recipe, look, {
        userTriggerToken: 'test_user',
        userGender: 'non-binary',
        includeQualityHints: true,
        includeNegativePrompts: true
      });
      
      const prompt = fluxPrompt.prompt;
      
      // Should start with trigger token and gender
      expect(prompt).toMatch(/^test_user\s+(non-binary person|person)/);
      
      // Should contain quality indicators
      expect(prompt.toLowerCase()).toMatch(/raw photo|editorial quality|professional/);
      
      // Should contain camera specs
      expect(prompt.toLowerCase()).toMatch(/camera|lens|shot|composition|focus/);
      
      // Should contain lighting specs
      expect(prompt.toLowerCase()).toMatch(/light|lighting|illumination|shadows/);
      
      // Should contain setting description
      expect(prompt.toLowerCase()).toMatch(/space|environment|setting|interior|room/);
      
      // Should have negative prompts if enabled
      if (recipe.negativePrompts && recipe.negativePrompts.length > 0) {
        expect(prompt).toContain('--no');
      }
    });
    
    it('should adapt FLUX prompts for different genders', () => {
      const recipe = AESTHETIC_RECIPES[0]; // Any recipe
      const look = GenderStyleSelector.selectGenderLook(recipe, 'woman');
      
      if (!look) {
        fail('No look found');
        return;
      }
      
      const womanPrompt = FluxRealizer.generateFluxPrompt(recipe, look, {
        userTriggerToken: 'user123',
        userGender: 'woman'
      });
      
      const manPrompt = FluxRealizer.generateFluxPrompt(recipe, look, {
        userTriggerToken: 'user123',
        userGender: 'man'
      });
      
      expect(womanPrompt.prompt).toContain('user123 woman');
      expect(manPrompt.prompt).toContain('user123 man');
      
      // Prompts should be different but similar structure
      expect(womanPrompt.prompt.length).toBeCloseTo(manPrompt.prompt.length, 50);
    });
  });
  
  describe('Content Validation', () => {
    it('should validate all recipes have required components', () => {
      for (const recipe of AESTHETIC_RECIPES) {
        // Each recipe should have basic structure
        expect(recipe.id).toBeTruthy();
        expect(recipe.name).toBeTruthy();
        expect(recipe.description).toBeTruthy();
        expect(recipe.tags.length).toBeGreaterThan(0);
        
        // Should have atmosphere details
        expect(recipe.atmosphere).toBeTruthy();
        expect(recipe.lighting).toBeTruthy();
        expect(recipe.composition).toBeTruthy();
        
        // Should have at least one gender look
        const hasLook = recipe.femaleLook || recipe.maleLook || recipe.nonbinaryLook;
        expect(hasLook).toBeTruthy();
        
        // Quality hints should be present
        expect(recipe.qualityHints.length).toBeGreaterThan(0);
      }
    });
    
    it('should generate consistent prose elements across multiple runs', () => {
      const recipe = AESTHETIC_RECIPES.find(r => r.id === 'night-time-luxe');
      const look = GenderStyleSelector.selectGenderLook(recipe!, 'woman');
      
      if (!look || !recipe) {
        fail('Recipe or look not found');
        return;
      }
      
      const runs = Array.from({ length: 3 }, () => 
        SentenceRealizer.generateProse(recipe, look, {
          targetWordCount: 180,
          userGender: 'woman'
        })
      );
      
      // All runs should have similar word counts (within 20% variance)
      const wordCounts = runs.map(r => r.wordCount);
      const avgWordCount = wordCounts.reduce((a, b) => a + b) / wordCounts.length;
      
      for (const count of wordCounts) {
        expect(count).toBeGreaterThan(avgWordCount * 0.8);
        expect(count).toBeLessThan(avgWordCount * 1.2);
      }
      
      // All runs should contain recipe-specific characteristics
      const nightLuxeKeywords = ['night', 'luxe', 'city', 'lights', 'sophisticated', 'glamorous'];
      
      for (const run of runs) {
        const hasKeywords = nightLuxeKeywords.some(keyword => 
          run.text.toLowerCase().includes(keyword)
        );
        expect(hasKeywords).toBe(true);
      }
    });
  });
});
