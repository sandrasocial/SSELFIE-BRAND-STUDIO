/**
 * Prompt Builder v2 - Aesthetic Recipes System
 * Orchestrates recipe selection, prose generation, and FLUX prompt creation
 */

import { GenderStyleSelector } from './selectors/gender-style-selector';
import { SentenceRealizer } from './realizers/sentence-realizer';
import { FluxRealizer } from './realizers/flux-realizer';
import { 
  PromptBuildRequest, 
  GeneratedPrompt, 
  GenderVariant 
} from './recipes/types';

export interface TokenBudgetOptions {
  maxTokens?: number;
  preserveSubject?: boolean;
  preserveScene?: boolean;
}

export interface PromptBuilderResult {
  success: boolean;
  prompts: GeneratedPrompt[];
  errors: string[];
  metadata: {
    recipesConsidered: number;
    selectedRecipes: string[];
    totalProcessingTime: number;
    budgetApplied: boolean;
  };
}

export class PromptBuilder {
  
  private static readonly DEFAULT_MAX_TOKENS = 2000; // Generous limit
  private static readonly TARGET_WORD_COUNT = 200; // Rich prose target
  
  /**
   * Build prompts using the Aesthetic Recipes system
   */
  static async buildPrompts(request: PromptBuildRequest): Promise<PromptBuilderResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const prompts: GeneratedPrompt[] = [];
    
    console.log('🏗️ Building prompts with Aesthetic Recipes system:', request);
    
    try {
      // Validate request
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          prompts: [],
          errors: validationErrors,
          metadata: {
            recipesConsidered: 0,
            selectedRecipes: [],
            totalProcessingTime: Date.now() - startTime,
            budgetApplied: false
          }
        };
      }
      
      // Step 1: Select matching recipes (1-2 candidates)
      const selectedRecipes = this.selectRecipes(request);
      
      if (selectedRecipes.length === 0) {
        errors.push('No matching aesthetic recipes found');
        return {
          success: false,
          prompts: [],
          errors,
          metadata: {
            recipesConsidered: 0,
            selectedRecipes: [],
            totalProcessingTime: Date.now() - startTime,
            budgetApplied: false
          }
        };
      }
      
      console.log(`📚 Selected ${selectedRecipes.length} recipes:`, selectedRecipes.map(r => r.recipe.name));
      
      // Step 2: Generate prompts for each selected recipe
      for (const selectedRecipe of selectedRecipes) {
        try {
          const generatedPrompt = await this.generateSinglePrompt(selectedRecipe, request);
          prompts.push(generatedPrompt);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to generate prompt for ${selectedRecipe.recipe.name}: ${errorMessage}`);
          console.error('❌ Prompt generation error:', error);
        }
      }
      
      // Step 3: Apply token budget safeTrim if needed
      const budgetApplied = await this.applyTokenBudget(prompts, request.maxLength);
      
      const metadata = {
        recipesConsidered: selectedRecipes.length,
        selectedRecipes: selectedRecipes.map(r => r.recipe.name),
        totalProcessingTime: Date.now() - startTime,
        budgetApplied
      };
      
      console.log('✅ Prompt building complete:', {
        promptsGenerated: prompts.length,
        errors: errors.length,
        ...metadata
      });
      
      return {
        success: prompts.length > 0,
        prompts,
        errors,
        metadata
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in prompt building';
      console.error('❌ Critical prompt building error:', error);
      
      return {
        success: false,
        prompts: [],
        errors: [errorMessage],
        metadata: {
          recipesConsidered: 0,
          selectedRecipes: [],
          totalProcessingTime: Date.now() - startTime,
          budgetApplied: false
        }
      };
    }
  }
  
  /**
   * Select appropriate recipes based on request criteria
   */
  private static selectRecipes(request: PromptBuildRequest) {
    return GenderStyleSelector.selectRecipes({
      styleKey: request.styleKey,
      userGender: request.userGender,
      userIntent: request.userIntent,
      tags: request.styleKey ? [] : this.extractTagsFromIntent(request.userIntent),
      fallbackCount: 2 // Default to 1-2 candidates as specified
    });
  }
  
  /**
   * Generate a single prompt from a matched recipe
   */
  private static async generateSinglePrompt(selectedRecipe: any, request: PromptBuildRequest): Promise<GeneratedPrompt> {
    const { recipe, look } = selectedRecipe;
    
    // Generate rich prose description (150-300 words target)
    const prose = SentenceRealizer.generateProse(recipe, look, {
      targetWordCount: this.TARGET_WORD_COUNT,
      includeAtmosphere: true,
      includeSensoryDetails: true,
      includeStoryMoments: true,
      userGender: request.userGender
    });
    
    // Generate FLUX prompt
    const fluxPrompt = FluxRealizer.generateFluxPrompt(recipe, look, {
      userTriggerToken: request.userTriggerToken,
      userGender: request.userGender,
      includeQualityHints: true,
      includeNegativePrompts: true
    });
    
    // Calculate token counts (approximate)
    const totalTokens = this.estimateTokenCount(prose.text + fluxPrompt.prompt);
    
    return {
      prose: prose.text,
      fluxPrompt: fluxPrompt.prompt,
      recipe,
      metadata: {
        wordCount: prose.wordCount,
        tokenCount: totalTokens,
        genderApplied: request.userGender || null,
        styleMatched: request.styleKey || null
      }
    };
  }
  
  /**
   * Apply token budget with safeTrim (preserves subject/scene)
   */
  private static async applyTokenBudget(
    prompts: GeneratedPrompt[], 
    maxLength?: number
  ): Promise<boolean> {
    const maxTokens = maxLength || this.DEFAULT_MAX_TOKENS;
    let budgetApplied = false;
    
    for (const prompt of prompts) {
      if (prompt.metadata.tokenCount > maxTokens) {
        console.log('🔧 Applying token budget safeTrim:', {
          original: prompt.metadata.tokenCount,
          target: maxTokens
        });
        
        // Apply safeTrim that preserves subject/scene elements
        prompt.prose = this.safeTrim(prompt.prose, maxTokens * 0.7, {
          preserveSubject: true,
          preserveScene: true
        });
        
        prompt.fluxPrompt = this.safeTrim(prompt.fluxPrompt, maxTokens * 0.3, {
          preserveSubject: true,
          preserveScene: true
        });
        
        // Recalculate token count
        prompt.metadata.tokenCount = this.estimateTokenCount(prompt.prose + prompt.fluxPrompt);
        budgetApplied = true;
      }
    }
    
    return budgetApplied;
  }
  
  /**
   * Safe trim that preserves essential elements
   */
  private static safeTrim(
    text: string, 
    maxTokens: number, 
    options: TokenBudgetOptions = {}
  ): string {
    const { preserveSubject = true, preserveScene = true } = options;
    
    const sentences = text.split(/\.\s+/);
    const essentialSentences: string[] = [];
    const optionalSentences: string[] = [];
    
    // Categorize sentences by importance
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      if (preserveSubject && this.isSubjectEssential(lowerSentence)) {
        essentialSentences.push(sentence);
      } else if (preserveScene && this.isSceneEssential(lowerSentence)) {
        essentialSentences.push(sentence);
      } else {
        optionalSentences.push(sentence);
      }
    }
    
    // Build result prioritizing essential content
    let result = essentialSentences.join('. ');
    const resultTokens = this.estimateTokenCount(result);
    
    if (resultTokens < maxTokens) {
      // Add optional sentences until budget is reached
      const remainingBudget = maxTokens - resultTokens;
      let optionalText = '';
      
      for (const sentence of optionalSentences) {
        const testText = optionalText + (optionalText ? '. ' : '') + sentence;
        if (this.estimateTokenCount(testText) <= remainingBudget) {
          optionalText = testText;
        } else {
          break;
        }
      }
      
      if (optionalText) {
        result += '. ' + optionalText;
      }
    }
    
    return result + (result.endsWith('.') ? '' : '.');
  }
  
  /**
   * Check if sentence contains subject-essential information
   */
  private static isSubjectEssential(sentence: string): boolean {
    const essentialKeywords = [
      'wearing', 'dressed', 'expression', 'pose', 'posture',
      'woman', 'man', 'person', 'individual', 'subject',
      'confidence', 'energy', 'presence'
    ];
    
    return essentialKeywords.some(keyword => sentence.includes(keyword));
  }
  
  /**
   * Check if sentence contains scene-essential information
   */
  private static isSceneEssential(sentence: string): boolean {
    const essentialKeywords = [
      'light', 'lighting', 'setting', 'environment', 'space',
      'windows', 'walls', 'architecture', 'furniture',
      'atmosphere', 'mood', 'composition'
    ];
    
    return essentialKeywords.some(keyword => sentence.includes(keyword));
  }
  
  /**
   * Extract potential tags from user intent
   */
  private static extractTagsFromIntent(intent: string): string[] {
    if (!intent) return [];
    
    const tags: string[] = [];
    const intentLower = intent.toLowerCase();
    
    // Map common intent words to tags
    const intentTagMap: Record<string, string[]> = {
      'professional': ['executive', 'business', 'corporate'],
      'creative': ['artistic', 'innovative', 'unique'],
      'relaxed': ['casual', 'natural', 'comfortable'],
      'elegant': ['sophisticated', 'luxury', 'refined'],
      'modern': ['contemporary', 'architectural', 'clean'],
      'natural': ['organic', 'authentic', 'outdoor'],
      'urban': ['city', 'metropolitan', 'street'],
      'coastal': ['beach', 'ocean', 'breezy'],
      'moody': ['dramatic', 'atmospheric', 'cinematic']
    };
    
    for (const [key, values] of Object.entries(intentTagMap)) {
      if (intentLower.includes(key)) {
        tags.push(...values);
      }
    }
    
    return tags;
  }
  
  /**
   * Validate prompt build request
   */
  private static validateRequest(request: PromptBuildRequest): string[] {
    const errors: string[] = [];
    
    if (!request.userTriggerToken || request.userTriggerToken.trim().length === 0) {
      errors.push('User trigger token is required');
    }
    
    if (!request.userIntent || request.userIntent.trim().length === 0) {
      errors.push('User intent is required');
    }
    
    if (request.userGender && !['woman', 'man', 'non-binary'].includes(request.userGender)) {
      errors.push('Invalid user gender specified');
    }
    
    if (request.maxLength && request.maxLength < 50) {
      errors.push('Maximum length too restrictive for quality prompts');
    }
    
    return errors;
  }
  
  /**
   * Estimate token count (rough approximation)
   */
  private static estimateTokenCount(text: string): number {
    // Rough estimation: ~0.75 tokens per word
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words * 0.75);
  }
  
  /**
   * Generate multiple prompt variations
   */
  static async generateVariations(
    request: PromptBuildRequest,
    count: number = 3
  ): Promise<PromptBuilderResult> {
    console.log(`🔄 Generating ${count} prompt variations`);
    
    const allPrompts: GeneratedPrompt[] = [];
    const allErrors: string[] = [];
    const selectedRecipeNames: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const variationRequest = {
        ...request,
        // Vary the intent slightly for different results
        userIntent: request.userIntent + (i > 0 ? ` variation ${i + 1}` : '')
      };
      
      const result = await this.buildPrompts(variationRequest);
      
      allPrompts.push(...result.prompts);
      allErrors.push(...result.errors);
      selectedRecipeNames.push(...result.metadata.selectedRecipes);
    }
    
    return {
      success: allPrompts.length > 0,
      prompts: allPrompts,
      errors: allErrors,
      metadata: {
        recipesConsidered: selectedRecipeNames.length,
        selectedRecipes: Array.from(new Set(selectedRecipeNames)),
        totalProcessingTime: 0, // Would need to track across all calls
        budgetApplied: true // Assume budget was applied during individual builds
      }
    };
  }
  
  /**
   * Quick prompt for testing - simplified interface
   */
  static async quickBuild(
    triggerToken: string,
    intent: string,
    styleKey?: string,
    gender?: GenderVariant
  ): Promise<GeneratedPrompt | null> {
    const request: PromptBuildRequest = {
      userTriggerToken: triggerToken,
      userIntent: intent,
      styleKey,
      userGender: gender || null
    };
    
    const result = await this.buildPrompts(request);
    return result.prompts.length > 0 ? result.prompts[0] : null;
  }
  
  /**
   * Get available style keys for UI
   */
  static getAvailableStyles(): string[] {
    return GenderStyleSelector.getAvailableStyleKeys();
  }
  
  /**
   * Get available tags for filtering
   */
  static getAvailableTags(): string[] {
    return GenderStyleSelector.getAvailableTags();
  }
}
