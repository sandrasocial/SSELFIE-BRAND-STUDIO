// User Style Memory Service - Safe learning system for Maya preferences
// This service tracks user patterns and preferences without affecting concept generation

import { db } from '../db';
import { userStyleMemory, promptAnalysis, aiImages } from '../../shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

export interface UserStyleMemory {
  preferredCategories: string[];
  favoritePromptPatterns: string[];
  colorPreferences: string[];
  settingPreferences: string[];
  stylingKeywords: string[];
  totalInteractions: number;
  totalFavorites: number;
  averageSessionLength: number;
  mostActiveHours: number[];
  highPerformingPrompts: string[];
  rejectedPrompts: string[];
}

export interface PromptAnalysisData {
  originalPrompt: string;
  generatedPrompt?: string;
  conceptTitle?: string;
  category?: string;
  wasGenerated: boolean;
  wasFavorited: boolean;
  wasSaved: boolean;
  viewDuration?: number;
  promptLength: number;
  keywordDensity: Record<string, number>;
  technicalSpecs: Record<string, any>;
  generationTime?: number;
  successScore: number;
}

export class UserStyleMemoryService {
  // Initialize or get user's style memory
  static async initializeUserMemory(userId: string): Promise<UserStyleMemory> {
    try {
      const [existingMemory] = await db
        .select()
        .from(userStyleMemory)
        .where(eq(userStyleMemory.userId, userId))
        .limit(1);

      if (existingMemory) {
        return {
          preferredCategories: existingMemory.preferredCategories as string[] || [],
          favoritePromptPatterns: existingMemory.favoritePromptPatterns as string[] || [],
          colorPreferences: existingMemory.colorPreferences as string[] || [],
          settingPreferences: existingMemory.settingPreferences as string[] || [],
          stylingKeywords: existingMemory.stylingKeywords as string[] || [],
          totalInteractions: existingMemory.totalInteractions || 0,
          totalFavorites: existingMemory.totalFavorites || 0,
          averageSessionLength: existingMemory.averageSessionLength || 0,
          mostActiveHours: existingMemory.mostActiveHours as number[] || [],
          highPerformingPrompts: existingMemory.highPerformingPrompts as string[] || [],
          rejectedPrompts: existingMemory.rejectedPrompts as string[] || [],
        };
      }

      // Create new memory record
      const newMemory = {
        preferredCategories: [],
        favoritePromptPatterns: [],
        colorPreferences: [],
        settingPreferences: [],
        stylingKeywords: [],
        totalInteractions: 0,
        totalFavorites: 0,
        averageSessionLength: 0,
        mostActiveHours: [],
        highPerformingPrompts: [],
        rejectedPrompts: [],
      };

      await db.insert(userStyleMemory).values({
        userId,
        ...newMemory,
      });

      console.log(`🧠 USER MEMORY: Initialized for user ${userId}`);
      return newMemory;
    } catch (error) {
      console.error('❌ USER MEMORY: Failed to initialize:', error);
      // Return default structure if database fails
      return {
        preferredCategories: [],
        favoritePromptPatterns: [],
        colorPreferences: [],
        settingPreferences: [],
        stylingKeywords: [],
        totalInteractions: 0,
        totalFavorites: 0,
        averageSessionLength: 0,
        mostActiveHours: [],
        highPerformingPrompts: [],
        rejectedPrompts: [],
      };
    }
  }

  // Track prompt analysis (zero-risk logging)
  static async logPromptAnalysis(userId: string, data: PromptAnalysisData): Promise<void> {
    try {
      // Calculate keyword density
      const words = data.originalPrompt.toLowerCase().split(/\s+/);
      const keywordDensity: Record<string, number> = {};
      words.forEach(word => {
        if (word.length > 3) { // Only track meaningful words
          keywordDensity[word] = (keywordDensity[word] || 0) + 1;
        }
      });

      // Calculate success score based on user actions
      let successScore = 0.0;
      if (data.wasGenerated) successScore += 0.3;
      if (data.wasSaved) successScore += 0.4;
      if (data.wasFavorited) successScore += 0.3;

      await db.insert(promptAnalysis).values({
        userId,
        originalPrompt: data.originalPrompt,
        generatedPrompt: data.generatedPrompt,
        conceptTitle: data.conceptTitle,
        category: data.category,
        wasGenerated: data.wasGenerated,
        wasFavorited: data.wasFavorited,
        wasSaved: data.wasSaved,
        viewDuration: data.viewDuration,
        promptLength: data.promptLength,
        keywordDensity,
        technicalSpecs: data.technicalSpecs,
        generationTime: data.generationTime,
        successScore,
      });

      console.log(`📊 PROMPT ANALYSIS: Logged for user ${userId} - Score: ${successScore}`);
    } catch (error) {
      console.error('❌ PROMPT ANALYSIS: Failed to log:', error);
      // Silent fail - don't break the user experience
    }
  }

  // Learn from user favorites (safe pattern detection)
  static async learnFromFavorites(userId: string): Promise<void> {
    try {
      // Get user's recent favorites
      const favorites = await db
        .select()
        .from(aiImages)
        .where(and(
          eq(aiImages.userId, userId),
          eq(aiImages.isFavorite, true)
        ))
        .orderBy(desc(aiImages.createdAt))
        .limit(50);

      if (favorites.length === 0) return;

      // Analyze patterns
      const categoryCount: Record<string, number> = {};
      const keywordCount: Record<string, number> = {};
      
      favorites.forEach(image => {
        // Count categories
        if (image.category) {
          categoryCount[image.category] = (categoryCount[image.category] || 0) + 1;
        }

        // Extract keywords from prompts
        if (image.prompt) {
          const words = image.prompt.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 3 && !['with', 'that', 'this', 'from', 'they', 'were', 'have'].includes(word)) {
              keywordCount[word] = (keywordCount[word] || 0) + 1;
            }
          });
        }
      });

      // Update user memory with patterns
      const preferredCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      const stylingKeywords = Object.entries(keywordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([keyword]) => keyword);

      await db
        .update(userStyleMemory)
        .set({
          preferredCategories,
          stylingKeywords,
          totalFavorites: favorites.length,
          updatedAt: new Date(),
        })
        .where(eq(userStyleMemory.userId, userId));

      console.log(`🎯 USER LEARNING: Updated preferences for user ${userId} - ${preferredCategories.length} categories, ${stylingKeywords.length} keywords`);
    } catch (error) {
      console.error('❌ USER LEARNING: Failed to learn from favorites:', error);
      // Silent fail - don't break the user experience
    }
  }

  // Get user's successful prompt patterns (for potential future enhancement)
  static async getSuccessfulPatterns(userId: string): Promise<{
    topPrompts: string[];
    preferredCategories: string[];
    stylingKeywords: string[];
    averageSuccessScore: number;
  }> {
    try {
      // Get top performing prompts
      const topPrompts = await db
        .select()
        .from(promptAnalysis)
        .where(and(
          eq(promptAnalysis.userId, userId),
          gte(promptAnalysis.successScore, 0.5)
        ))
        .orderBy(desc(promptAnalysis.successScore))
        .limit(10);

      // Get user memory
      const memory = await this.initializeUserMemory(userId);

      // Calculate average success score
      const allAnalysis = await db
        .select({ successScore: promptAnalysis.successScore })
        .from(promptAnalysis)
        .where(eq(promptAnalysis.userId, userId));

      const averageSuccessScore = allAnalysis.length > 0
        ? allAnalysis.reduce((sum, item) => sum + (parseFloat(item.successScore as string) || 0), 0) / allAnalysis.length
        : 0;

      return {
        topPrompts: topPrompts.map(p => p.originalPrompt),
        preferredCategories: memory.preferredCategories,
        stylingKeywords: memory.stylingKeywords,
        averageSuccessScore,
      };
    } catch (error) {
      console.error('❌ USER PATTERNS: Failed to get patterns:', error);
      return {
        topPrompts: [],
        preferredCategories: [],
        stylingKeywords: [],
        averageSuccessScore: 0,
      };
    }
  }

  // Update interaction count (safe tracking)
  static async trackInteraction(userId: string): Promise<void> {
    try {
      await db
        .update(userStyleMemory)
        .set({
          totalInteractions: sql`total_interactions + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userStyleMemory.userId, userId));
    } catch (error) {
      console.error('❌ USER TRACKING: Failed to track interaction:', error);
      // Silent fail
    }
  }
}