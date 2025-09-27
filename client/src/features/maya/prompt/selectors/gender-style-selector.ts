/**
 * Gender-Style Selector
 * Intelligently matches aesthetic recipes based on style preferences and user characteristics
 */

import { AestheticRecipe, GenderVariant, RecipeLook } from '../recipes/types';
import { AESTHETIC_RECIPES } from '../recipes/index';

export interface RecipeMatchCriteria {
  styleKey?: string;
  tags?: string[];
  mood?: string;
  userGender?: GenderVariant | null;
  userIntent?: string;
  fallbackCount?: number;
}

export interface MatchedRecipe {
  recipe: AestheticRecipe;
  look: RecipeLook;
  matchScore: number;
  matchReasons: string[];
}

export class GenderStyleSelector {
  
  /**
   * Select matching recipes based on criteria
   * Returns 1-2 candidates as specified
   */
  static selectRecipes(criteria: RecipeMatchCriteria): MatchedRecipe[] {
    const { styleKey, tags = [], mood, userGender, userIntent, fallbackCount = 2 } = criteria;
    
    console.log('🎯 Recipe Selection Criteria:', { styleKey, tags, mood, userGender, userIntent });
    
    let candidates: MatchedRecipe[] = [];
    
    // Primary match: exact styleKey match
    if (styleKey) {
      const exactMatch = AESTHETIC_RECIPES.find(recipe => recipe.styleKey === styleKey);
      if (exactMatch) {
        const lookVariant = this.selectGenderLook(exactMatch, userGender);
        if (lookVariant) {
          candidates.push({
            recipe: exactMatch,
            look: lookVariant,
            matchScore: 100,
            matchReasons: [`Exact style match: ${styleKey}`]
          });
        }
      }
    }
    
    // Secondary matches: tag-based matching
    if (candidates.length < fallbackCount) {
      const tagMatches = this.findTagMatches(tags, userGender, candidates);
      candidates.push(...tagMatches);
    }
    
    // Tertiary matches: mood-based matching
    if (candidates.length < fallbackCount && mood) {
      const moodMatches = this.findMoodMatches(mood, userGender, candidates);
      candidates.push(...moodMatches);
    }
    
    // Intent-based matching
    if (candidates.length < fallbackCount && userIntent) {
      const intentMatches = this.findIntentMatches(userIntent, userGender, candidates);
      candidates.push(...intentMatches);
    }
    
    // Fallback: select diverse high-quality recipes
    if (candidates.length < fallbackCount) {
      const fallbackMatches = this.getFallbackMatches(userGender, candidates, fallbackCount);
      candidates.push(...fallbackMatches);
    }
    
    // Sort by match score and return top candidates
    candidates.sort((a, b) => b.matchScore - a.matchScore);
    const selected = candidates.slice(0, Math.max(fallbackCount, 1));
    
    console.log(`✅ Selected ${selected.length} recipes:`, selected.map(s => ({ 
      name: s.recipe.name, 
      score: s.matchScore, 
      reasons: s.matchReasons 
    })));
    
    return selected;
  }
  
  /**
   * Select appropriate gender look variant from recipe
   */
  static selectGenderLook(recipe: AestheticRecipe, userGender?: GenderVariant | null): RecipeLook | null {
    if (!userGender) {
      // Default to female look if available, otherwise first available
      return recipe.femaleLook || recipe.maleLook || recipe.nonbinaryLook || null;
    }
    
    switch (userGender) {
      case 'woman':
        return recipe.femaleLook || recipe.nonbinaryLook || recipe.maleLook || null;
      case 'man':
        return recipe.maleLook || recipe.nonbinaryLook || recipe.femaleLook || null;
      case 'non-binary':
        return recipe.nonbinaryLook || recipe.femaleLook || recipe.maleLook || null;
      default:
        return recipe.femaleLook || recipe.maleLook || recipe.nonbinaryLook || null;
    }
  }
  
  /**
   * Find recipes matching specified tags
   */
  private static findTagMatches(tags: string[], userGender?: GenderVariant | null, existingCandidates: MatchedRecipe[] = []): MatchedRecipe[] {
    const existingIds = new Set(existingCandidates.map(c => c.recipe.id));
    const matches: MatchedRecipe[] = [];
    
    for (const recipe of AESTHETIC_RECIPES) {
      if (existingIds.has(recipe.id)) continue;
      
      const matchingTags = recipe.tags.filter(tag => 
        tags.some(userTag => 
          tag.toLowerCase().includes(userTag.toLowerCase()) ||
          userTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      
      if (matchingTags.length > 0) {
        const lookVariant = this.selectGenderLook(recipe, userGender);
        if (lookVariant) {
          const matchScore = Math.min(90, 60 + (matchingTags.length * 10));
          matches.push({
            recipe,
            look: lookVariant,
            matchScore,
            matchReasons: [`Tag matches: ${matchingTags.join(', ')}`]
          });
        }
      }
    }
    
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 2);
  }
  
  /**
   * Find recipes matching mood/atmosphere
   */
  private static findMoodMatches(mood: string, userGender?: GenderVariant | null, existingCandidates: MatchedRecipe[] = []): MatchedRecipe[] {
    const existingIds = new Set(existingCandidates.map(c => c.recipe.id));
    const matches: MatchedRecipe[] = [];
    const moodLower = mood.toLowerCase();
    
    for (const recipe of AESTHETIC_RECIPES) {
      if (existingIds.has(recipe.id)) continue;
      
      const moodScore = this.calculateMoodScore(recipe, moodLower);
      if (moodScore > 0) {
        const lookVariant = this.selectGenderLook(recipe, userGender);
        if (lookVariant) {
          matches.push({
            recipe,
            look: lookVariant,
            matchScore: 50 + moodScore,
            matchReasons: [`Mood match for: ${mood}`]
          });
        }
      }
    }
    
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 2);
  }
  
  /**
   * Find recipes matching user intent
   */
  private static findIntentMatches(intent: string, userGender?: GenderVariant | null, existingCandidates: MatchedRecipe[] = []): MatchedRecipe[] {
    const existingIds = new Set(existingCandidates.map(c => c.recipe.id));
    const matches: MatchedRecipe[] = [];
    const intentLower = intent.toLowerCase();
    
    // Intent keyword mapping
    const intentMappings = {
      'professional': ['executive', 'business', 'corporate', 'work'],
      'casual': ['relaxed', 'natural', 'comfortable', 'everyday'],
      'glamorous': ['luxe', 'evening', 'sophisticated', 'elegant'],
      'creative': ['artistic', 'unique', 'innovative', 'expressive'],
      'natural': ['organic', 'authentic', 'outdoors', 'simple'],
      'urban': ['city', 'modern', 'metropolitan', 'street'],
      'coastal': ['beach', 'ocean', 'seaside', 'breezy'],
      'minimal': ['clean', 'simple', 'minimal', 'understated']
    };
    
    for (const recipe of AESTHETIC_RECIPES) {
      if (existingIds.has(recipe.id)) continue;
      
      let intentScore = 0;
      
      // Check description and tags for intent matches
      const searchText = `${recipe.name} ${recipe.description} ${recipe.tags.join(' ')}`.toLowerCase();
      
      for (const [key, keywords] of Object.entries(intentMappings)) {
        if (intentLower.includes(key) || keywords.some(keyword => intentLower.includes(keyword))) {
          if (keywords.some(keyword => searchText.includes(keyword))) {
            intentScore += 20;
          }
        }
      }
      
      // Direct keyword matches in intent
      const intentWords = intentLower.split(' ');
      for (const word of intentWords) {
        if (word.length > 3 && searchText.includes(word)) {
          intentScore += 10;
        }
      }
      
      if (intentScore > 0) {
        const lookVariant = this.selectGenderLook(recipe, userGender);
        if (lookVariant) {
          matches.push({
            recipe,
            look: lookVariant,
            matchScore: 40 + Math.min(intentScore, 30),
            matchReasons: [`Intent match: ${intent}`]
          });
        }
      }
    }
    
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 2);
  }
  
  /**
   * Get diverse fallback matches when no specific criteria match
   */
  private static getFallbackMatches(userGender?: GenderVariant | null, existingCandidates: MatchedRecipe[] = [], count: number = 2): MatchedRecipe[] {
    const existingIds = new Set(existingCandidates.map(c => c.recipe.id));
    const fallbacks: MatchedRecipe[] = [];
    
    // Define high-quality fallback recipes in order of preference
    const fallbackOrder = [
      'golden-hour-glow',        // Universal appeal
      'scandinavian-minimalist', // Clean and professional
      'urban-moody',            // Sophisticated and modern
      'high-end-coastal',       // Elegant and relaxed
      'white-space-executive',  // Professional and clean
      'night-time-luxe'         // Glamorous option
    ];
    
    for (const recipeId of fallbackOrder) {
      if (fallbacks.length >= count) break;
      if (existingIds.has(recipeId)) continue;
      
      const recipe = AESTHETIC_RECIPES.find(r => r.id === recipeId);
      if (recipe) {
        const lookVariant = this.selectGenderLook(recipe, userGender);
        if (lookVariant) {
          fallbacks.push({
            recipe,
            look: lookVariant,
            matchScore: 30,
            matchReasons: ['High-quality fallback selection']
          });
        }
      }
    }
    
    return fallbacks;
  }
  
  /**
   * Calculate mood compatibility score
   */
  private static calculateMoodScore(recipe: AestheticRecipe, mood: string): number {
    let score = 0;
    
    // Check recipe mood
    if (recipe.atmosphere.mood.toLowerCase().includes(mood)) {
      score += 30;
    }
    
    // Check recipe tags
    for (const tag of recipe.tags) {
      if (tag.toLowerCase().includes(mood) || mood.includes(tag.toLowerCase())) {
        score += 15;
      }
    }
    
    // Check description
    if (recipe.description.toLowerCase().includes(mood)) {
      score += 20;
    }
    
    return Math.min(score, 40);
  }
  
  /**
   * Get all available style keys
   */
  static getAvailableStyleKeys(): string[] {
    return AESTHETIC_RECIPES
      .map(recipe => recipe.styleKey)
      .filter((key): key is string => !!key);
  }
  
  /**
   * Get recipe by style key
   */
  static getRecipeByStyleKey(styleKey: string): AestheticRecipe | null {
    return AESTHETIC_RECIPES.find(recipe => recipe.styleKey === styleKey) || null;
  }
  
  /**
   * Get all available tags for filtering
   */
  static getAvailableTags(): string[] {
    const allTags = AESTHETIC_RECIPES.flatMap(recipe => recipe.tags);
    return Array.from(new Set(allTags)).sort();
  }
}
