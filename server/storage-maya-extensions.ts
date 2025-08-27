/**
 * Maya Storage Extensions
 * Specialized storage functions for Maya's onboarding and personal brand data
 * Conservative approach - extends existing storage without modifications
 */

import { storage } from './storage';
import { personalBrandService } from './services/personal-brand-service';

interface MayaUserContext {
  userId: string;
  personalBrand?: {
    transformationStory?: string;
    currentSituation?: string;
    futureVision?: string;
    businessGoals?: string;
    onboardingStep?: number;
    isCompleted?: boolean;
    completedAt?: Date;
    updatedAt?: Date;
  };
  styleProfile?: {
    styleCategories?: string[];
    colorPreferences?: string[];
    settingsPreferences?: string[];
    brandPersonality?: string;
    updatedAt?: Date;
  };
  personalMemory?: {
    personalInsights?: {
      coreMotivations: string[];
      transformationJourney: string;
      strengthsIdentified: string[];
      growthAreas: string[];
      personalityNotes: string;
      communicationStyle: string;
    };
    ongoingGoals?: {
      shortTermGoals: string[];
      longTermVision: string[];
      milestonesToCelebrate: string[];
      challengesToSupport: string[];
    };
    conversationStyle?: {
      energyLevel: string;
      supportType: string;
      communicationTone: string;
      motivationApproach: string;
    };
    userFeedbackPatterns?: {
      lovedElements: string[];
      dislikedElements: string[];
      requestPatterns: string[];
    };
    preferredTopics?: string[];
    personalizedStylingNotes?: string;
    successfulPromptPatterns?: string[];
    lastMemoryUpdate?: Date;
    memoryVersion?: number;
  };
}

interface PersonalBrandData {
  userId: string;
  transformationStory?: string;
  currentSituation?: string;
  futureVision?: string;
  businessGoals?: string;
  onboardingStep?: number;
  isCompleted?: boolean;
  completedAt?: Date;
  updatedAt: Date;
}

interface StyleProfileData {
  userId: string;
  styleCategories?: string[];
  colorPreferences?: string[];
  settingsPreferences?: string[];
  brandPersonality?: string;
  updatedAt: Date;
}

interface MayaPersonalMemoryData {
  userId: string;
  personalInsights: {
    coreMotivations: string[];
    transformationJourney: string;
    strengthsIdentified: string[];
    growthAreas: string[];
    personalityNotes: string;
    communicationStyle: string;
  };
  ongoingGoals: {
    shortTermGoals: string[];
    longTermVision: string[];
    milestonesToCelebrate: string[];
    challengesToSupport: string[];
  };
  conversationStyle: {
    energyLevel: string;
    supportType: string;
    communicationTone: string;
    motivationApproach: string;
  };
  userFeedbackPatterns: {
    lovedElements: string[];
    dislikedElements: string[];
    requestPatterns: string[];
  };
  preferredTopics: string[];
  personalizedStylingNotes: string;
  successfulPromptPatterns: string[];
  lastMemoryUpdate?: Date;
  memoryVersion?: number;
}

export class MayaStorageExtensions {
  
  /**
   * Get comprehensive Maya user context for personalized responses
   */
  static async getMayaUserContext(userId: string): Promise<MayaUserContext | null> {
    try {
      // This is a simplified version that uses localStorage-style memory
      // In production, would integrate with actual database
      const context: MayaUserContext = {
        userId,
        personalBrand: {
          onboardingStep: 1,
          isCompleted: false,
          updatedAt: new Date()
        }
      };
      
      return context;
    } catch (error) {
      console.error('Error getting Maya user context:', error);
      return null;
    }
  }
  
  /**
   * Save user's personal brand data during onboarding
   */
  static async saveUserPersonalBrand(data: PersonalBrandData): Promise<boolean> {
    try {
      // For now, just log the data - would save to database in production
      console.log(`Maya: Saving personal brand data for user ${data.userId}:`, {
        step: data.onboardingStep,
        hasStory: !!data.transformationStory,
        hasVision: !!data.futureVision,
        isCompleted: data.isCompleted
      });
      
      return true;
    } catch (error) {
      console.error('Error saving personal brand:', error);
      return false;
    }
  }
  
  /**
   * Save user's style profile data
   */
  static async saveUserStyleProfile(data: StyleProfileData): Promise<boolean> {
    try {
      console.log(`Maya: Saving style profile for user ${data.userId}:`, {
        categories: data.styleCategories?.length || 0,
        colors: data.colorPreferences?.length || 0,
        personality: data.brandPersonality
      });
      
      return true;
    } catch (error) {
      console.error('Error saving style profile:', error);
      return false;
    }
  }
  
  /**
   * Get Maya's personal memory for this user
   */
  static async getMayaPersonalMemory(userId: string): Promise<MayaPersonalMemoryData | null> {
    try {
      // Return null for now - would fetch from database in production
      return null;
    } catch (error) {
      console.error('Error getting Maya personal memory:', error);
      return null;
    }
  }
  
  /**
   * Save Maya's personal memory for this user
   */
  static async saveMayaPersonalMemory(data: MayaPersonalMemoryData): Promise<MayaPersonalMemoryData> {
    try {
      console.log(`Maya: Saving personal memory for user ${data.userId}:`, {
        insights: Object.keys(data.personalInsights || {}).length,
        goals: Object.keys(data.ongoingGoals || {}).length,
        topics: data.preferredTopics?.length || 0
      });
      
      return {
        ...data,
        lastMemoryUpdate: new Date(),
        memoryVersion: (data.memoryVersion || 0) + 1
      };
    } catch (error) {
      console.error('Error saving Maya personal memory:', error);
      throw error;
    }
  }
}