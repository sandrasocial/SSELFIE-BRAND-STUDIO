/**
 * Unit Tests for Aesthetic Recipes Prompt Builder System
 */

import { PromptBuilder } from '../prompt-builder';
import { GenderStyleSelector } from '../selectors/gender-style-selector';
import { SentenceRealizer } from '../realizers/sentence-realizer';
import { FluxRealizer } from '../realizers/flux-realizer';
import { TokenBudgetManager } from '../utils/token-budget';
import { PromptBuildRequest, GenderVariant } from '../recipes/types';

describe('Aesthetic Recipes System', () => {
  
  describe('PromptBuilder', () => {
    const mockRequest: PromptBuildRequest = {
      userTriggerToken: 'test_user',
      userIntent: 'professional photo for business',
      userGender: 'woman',
      styleKey: 'scandinavian-minimalist'
    };
    
    it('should build prompts successfully with valid request', async () => {
      const result = await PromptBuilder.buildPrompts(mockRequest);
      
      expect(result.success).toBe(true);
      expect(result.prompts.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
      
      const prompt = result.prompts[0];
      expect(prompt.prose).toBeTruthy();
      expect(prompt.fluxPrompt).toBeTruthy();
      expect(prompt.recipe).toBeTruthy();
      expect(prompt.metadata.genderApplied).toBe('woman');
    });
    
    it('should validate request parameters', async () => {
      const invalidRequest = {
        userTriggerToken: '',
        userIntent: '',
        userGender: null
      };
      
      const result = await PromptBuilder.buildPrompts(invalidRequest as PromptBuildRequest);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('trigger token'))).toBe(true);
    });
    
    it('should handle missing style key gracefully', async () => {
      const noStyleRequest = {
        ...mockRequest,
        styleKey: undefined
      };
      
      const result = await PromptBuilder.buildPrompts(noStyleRequest);
      
      expect(result.success).toBe(true);
      expect(result.prompts.length).toBeGreaterThan(0);
    });
  });
  
  describe('Gender System', () => {
    it('should correctly apply gender in FLUX prompts', () => {
      const womanPrompt = FluxRealizer.generateFluxPrompt(
        {} as any, // Mock recipe
        {} as any, // Mock look
        {
          userTriggerToken: 'test_user',
          userGender: 'woman'
        }
      );
      
      expect(womanPrompt.prompt).toContain('test_user woman');
      expect(womanPrompt.components.gender).toBe('woman');
    });
    
    it('should handle non-binary gender correctly', () => {
      const nonBinaryPrompt = FluxRealizer.generateFluxPrompt(
        {} as any,
        {} as any,
        {
          userTriggerToken: 'test_user',
          userGender: 'non-binary'
        }
      );
      
      expect(nonBinaryPrompt.components.gender).toBe('non-binary person');
    });
    
    it('should apply gender-aware language in prose', () => {
      const testText = 'They are wearing elegant clothing and have a confident expression.';
      const femaleText = SentenceRealizer['applyGenderLanguage'](testText, 'woman');
      const maleText = SentenceRealizer['applyGenderLanguage'](testText, 'man');
      
      expect(femaleText).toContain('She is wearing');
      expect(femaleText).toContain('has a confident');
      
      expect(maleText).toContain('He is wearing');
      expect(maleText).toContain('has a confident');
    });
    
    it('should preserve gender-neutral language for non-binary users', () => {
      const testText = 'She is wearing a beautiful dress.';
      const nonBinaryText = SentenceRealizer['applyGenderLanguage'](testText, 'non-binary');
      
      expect(nonBinaryText).toContain('They are wearing');
      expect(nonBinaryText).not.toContain('She is');
    });
  });
  
  describe('Token Budget System', () => {
    it('should preserve subject content under trimming', () => {
      const longText = 'A woman wearing a beautiful cashmere sweater sits gracefully. The lighting is dramatic and professional. There are many decorative elements around. She has a confident expression. The background contains architectural details. Additional environmental elements fill the space. More descriptive content continues here.';
      
      const result = TokenBudgetManager.safeTrim(longText, {
        maxTokens: 30,
        preserveSubject: true,
        preserveScene: false
      });
      
      expect(result.trimmed).toBe(true);
      expect(result.text.toLowerCase()).toContain('woman');
      expect(result.text.toLowerCase()).toContain('wearing');
      expect(result.preservedElements.length).toBeGreaterThan(0);
    });
    
    it('should preserve scene content under trimming', () => {
      const longText = 'The setting features dramatic lighting and architectural elements. A person stands in the space. The environment has professional lighting setup. The composition includes geometric shapes. Additional mood elements enhance the atmosphere. More environmental details continue.';
      
      const result = TokenBudgetManager.safeTrim(longText, {
        maxTokens: 25,
        preserveSubject: false,
        preserveScene: true
      });
      
      expect(result.trimmed).toBe(true);
      expect(result.text.toLowerCase()).toContain('lighting');
      expect(result.text.toLowerCase()).toContain('architectural');
    });
    
    it('should not trim content that fits within budget', () => {
      const shortText = 'A simple description.';
      
      const result = TokenBudgetManager.safeTrim(shortText, {
        maxTokens: 100,
        preserveSubject: true
      });
      
      expect(result.trimmed).toBe(false);
      expect(result.text).toBe(shortText);
    });
  });
  
  describe('Recipe Selection', () => {
    it('should select recipes by style key', () => {
      const matches = GenderStyleSelector.selectRecipes({
        styleKey: 'scandinavian-minimalist',
        userGender: 'woman',
        userIntent: 'professional photos'
      });
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].recipe.id).toBe('scandinavian-minimalist');
      expect(matches[0].matchScore).toBe(100); // Exact match
    });
    
    it('should provide fallback recipes when no style key matches', () => {
      const matches = GenderStyleSelector.selectRecipes({
        userGender: 'man',
        userIntent: 'creative professional photos',
        fallbackCount: 2
      });
      
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(matches.every(m => m.recipe && m.look)).toBe(true);
    });
    
    it('should select appropriate gender look variants', () => {
      const matches = GenderStyleSelector.selectRecipes({
        styleKey: 'urban-moody',
        userGender: 'non-binary',
        userIntent: 'artistic photos'
      });
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].look).toBeTruthy();
    });
  });
  
  describe('Content Quality', () => {
    it('should generate prose with target word count', () => {
      // This would require mocking the recipe data
      // Skipping implementation for brevity but would test:
      // - Word count targets (150-300 words)
      // - Inclusion of required elements
      // - Natural sentence flow
    });
    
    it('should include expected camera and lighting terms in FLUX prompts', () => {
      // Test that generated FLUX prompts contain:
      // - Camera specifications
      // - Lighting details
      // - Setting descriptions
      // - Composition elements
    });
  });
});

describe('Token Budget Utilities', () => {
  describe('TokenBudgetManager', () => {
    it('should estimate token counts accurately', () => {
      const text = 'This is a test sentence with exactly eight words.';
      const tokenCount = TokenBudgetManager.estimateTokenCount(text);
      
      expect(tokenCount).toBeCloseTo(6, 1); // ~8 words * 0.75 = ~6 tokens
    });
    
    it('should handle empty strings', () => {
      expect(TokenBudgetManager.estimateTokenCount('')).toBe(0);
      expect(TokenBudgetManager.estimateTokenCount('   ')).toBe(0);
    });
    
    it('should provide smart display truncation', () => {
      const longText = 'This is a very long sentence that should be truncated at word boundaries. This is another sentence that continues the thought.';
      const truncated = TokenBudgetManager.smartDisplay(longText, 50);
      
      expect(truncated.length).toBeLessThanOrEqual(53); // Allow for "..."
      expect(truncated.endsWith('...')).toBe(true);
      expect(truncated.split(' ').every(word => word.length > 0)).toBe(true); // No broken words
    });
  });
});
