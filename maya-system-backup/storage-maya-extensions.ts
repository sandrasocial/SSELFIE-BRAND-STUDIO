/**
 * Maya Storage Extensions
 * Specialized storage functions for Maya's onboarding and personal brand data
 * Conservative approach - extends existing storage without modifications
 */

import { storage } from './storage';
import { personalBrandService } from './services/personal-brand-service';
import { db } from './db';
import { onboardingData, userPersonalBrand, mayaPersonalMemory } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
      console.log(`🔍 Maya: Getting user context for ${userId}`);
      
      // Get real onboarding data from database
      const [onboardingRecord] = await db
        .select()
        .from(onboardingData)
        .where(eq(onboardingData.userId, userId))
        .limit(1);
      
      // Get personal brand data if exists
      const [personalBrandRecord] = await db
        .select()
        .from(userPersonalBrand)
        .where(eq(userPersonalBrand.userId, userId))
        .limit(1);
      
      const context: MayaUserContext = {
        userId,
        personalBrand: {
          transformationStory: personalBrandRecord?.transformationStory || onboardingRecord?.brandStory,
          currentSituation: personalBrandRecord?.currentSituation,
          futureVision: personalBrandRecord?.futureVision,
          businessGoals: personalBrandRecord?.businessGoals || onboardingRecord?.businessGoals,
          onboardingStep: personalBrandRecord?.onboardingStep || onboardingRecord?.currentStep || 1,
          isCompleted: personalBrandRecord?.isCompleted || onboardingRecord?.completed || false,
          completedAt: personalBrandRecord?.completedAt || onboardingRecord?.completedAt,
          updatedAt: personalBrandRecord?.updatedAt || onboardingRecord?.updatedAt || new Date()
        }
      };
      
      console.log(`✅ Maya: Context loaded - Step ${context.personalBrand?.onboardingStep}, Completed: ${context.personalBrand?.isCompleted}`);
      return context;
    } catch (error) {
      console.error('❌ Error getting Maya user context:', error);
      return null;
    }
  }
  
  /**
   * Save user's personal brand data during onboarding
   */
  static async saveUserPersonalBrand(data: PersonalBrandData): Promise<boolean> {
    try {
      console.log(`💾 Maya: Saving personal brand data for user ${data.userId}:`, {
        step: data.onboardingStep,
        hasStory: !!data.transformationStory,
        hasVision: !!data.futureVision,
        isCompleted: data.isCompleted
      });
      
      // Save to user_personal_brand table
      const saveData = {
        userId: data.userId,
        transformationStory: data.transformationStory,
        currentSituation: data.currentSituation,
        futureVision: data.futureVision,
        businessGoals: data.businessGoals,
        onboardingStep: data.onboardingStep || 1,
        isCompleted: data.isCompleted || false,
        completedAt: data.isCompleted ? new Date() : null,
        updatedAt: new Date()
      };
      
      // Check if record exists
      const [existing] = await db
        .select()
        .from(userPersonalBrand)
        .where(eq(userPersonalBrand.userId, data.userId))
        .limit(1);
      
      if (existing) {
        // Update existing record
        await db
          .update(userPersonalBrand)
          .set(saveData)
          .where(eq(userPersonalBrand.userId, data.userId));
        console.log(`✅ Maya: Updated personal brand data for user ${data.userId}`);
      } else {
        // Insert new record
        await db
          .insert(userPersonalBrand)
          .values(saveData);
        console.log(`✅ Maya: Created personal brand data for user ${data.userId}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error saving personal brand:', error);
      return false;
    }
  }
  
  /**
   * Save user's onboarding data during discovery flow
   */
  static async saveOnboardingData(userId: string, stepData: any, step: number): Promise<boolean> {
    try {
      console.log(`🔥 CRITICAL FIX: Saving onboarding data for user ${userId}, step ${step}`);
      
      // Update personal brand data with current step
      const personalBrandData = {
        userId,
        transformationStory: stepData.transformationStory || '',
        currentSituation: stepData.currentSituation || '',
        futureVision: stepData.futureVision || '',
        businessGoals: stepData.businessGoals || '',
        onboardingStep: step,
        isCompleted: step === 6,
        completedAt: step === 6 ? new Date() : null,
        updatedAt: new Date()
      };

      // FIXED: Check if user record exists, then update or insert
      const [existing] = await db
        .select()
        .from(userPersonalBrand)
        .where(eq(userPersonalBrand.userId, userId))
        .limit(1);

      if (existing) {
        // Update existing record
        await db
          .update(userPersonalBrand)
          .set({
            transformationStory: personalBrandData.transformationStory,
            currentSituation: personalBrandData.currentSituation,
            futureVision: personalBrandData.futureVision,
            businessGoals: personalBrandData.businessGoals,
            onboardingStep: personalBrandData.onboardingStep,
            isCompleted: personalBrandData.isCompleted,
            completedAt: personalBrandData.completedAt,
            updatedAt: personalBrandData.updatedAt
          })
          .where(eq(userPersonalBrand.userId, userId));
        console.log(`📝 FIXED: Updated existing personal brand record for user ${userId}`);
      } else {
        // Insert new record
        await db
          .insert(userPersonalBrand)
          .values(personalBrandData);
        console.log(`🆕 FIXED: Created new personal brand record for user ${userId}`);
      }

      console.log(`✅ FIXED: Onboarding data saved successfully for user ${userId}`);
      return true;
      
    } catch (error) {
      console.error('🚨 CRITICAL ERROR: Failed to save onboarding data:', error);
      throw error;
    }
  }

  /**
   * Save user's style profile data
   */
  static async saveUserStyleProfile(data: StyleProfileData): Promise<boolean> {
    try {
      console.log(`💾 Maya: Saving style profile for user ${data.userId}:`, {
        categories: data.styleCategories?.length || 0,
        colors: data.colorPreferences?.length || 0,
        personality: data.brandPersonality
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error saving style profile:', error);
      return false;
    }
  }
  
  /**
   * Get Maya's personal memory for this user
   */
  static async getMayaPersonalMemory(userId: string): Promise<MayaPersonalMemoryData | null> {
    try {
      console.log(`🧠 Maya: Getting personal memory for user ${userId}`);
      
      const [memoryRecord] = await db
        .select()
        .from(mayaPersonalMemory)
        .where(eq(mayaPersonalMemory.userId, userId))
        .limit(1);
      
      if (!memoryRecord) {
        console.log(`📝 Maya: No memory found for user ${userId}`);
        return null;
      }
      
      const memory: MayaPersonalMemoryData = {
        userId,
        personalInsights: memoryRecord.personalInsights as any || {
          coreMotivations: [],
          transformationJourney: '',
          strengthsIdentified: [],
          growthAreas: [],
          personalityNotes: '',
          communicationStyle: ''
        },
        ongoingGoals: memoryRecord.ongoingGoals as any || {
          shortTermGoals: [],
          longTermVision: [],
          milestonesToCelebrate: [],
          challengesToSupport: []
        },
        conversationStyle: memoryRecord.conversationStyle as any || {
          energyLevel: '',
          supportType: '',
          communicationTone: '',
          motivationApproach: ''
        },
        userFeedbackPatterns: memoryRecord.userFeedbackPatterns as any || {
          lovedElements: [],
          dislikedElements: [],
          requestPatterns: []
        },
        preferredTopics: (memoryRecord.preferredTopics as string[]) || [],
        personalizedStylingNotes: memoryRecord.personalizedStylingNotes || '',
        successfulPromptPatterns: (memoryRecord.successfulPromptPatterns as string[]) || [],
        lastMemoryUpdate: memoryRecord.lastMemoryUpdate,
        memoryVersion: memoryRecord.memoryVersion || 1
      };
      
      console.log(`✅ Maya: Memory loaded for user ${userId} - version ${memory.memoryVersion}`);
      return memory;
    } catch (error) {
      console.error('❌ Error getting Maya personal memory:', error);
      return null;
    }
  }
  
  /**
   * Save Maya's personal memory for this user
   */
  static async saveMayaPersonalMemory(data: MayaPersonalMemoryData): Promise<MayaPersonalMemoryData> {
    try {
      console.log(`🧠 Maya: Saving personal memory for user ${data.userId}:`, {
        insights: Object.keys(data.personalInsights || {}).length,
        goals: Object.keys(data.ongoingGoals || {}).length,
        topics: data.preferredTopics?.length || 0
      });
      
      const saveData = {
        userId: data.userId,
        personalInsights: data.personalInsights,
        ongoingGoals: data.ongoingGoals,
        conversationStyle: data.conversationStyle,
        userFeedbackPatterns: data.userFeedbackPatterns,
        preferredTopics: data.preferredTopics,
        personalizedStylingNotes: data.personalizedStylingNotes,
        successfulPromptPatterns: data.successfulPromptPatterns,
        lastMemoryUpdate: new Date(),
        memoryVersion: (data.memoryVersion || 0) + 1,
        updatedAt: new Date()
      };
      
      // Check if record exists
      const [existing] = await db
        .select()
        .from(mayaPersonalMemory)
        .where(eq(mayaPersonalMemory.userId, data.userId))
        .limit(1);
      
      if (existing) {
        // Update existing memory
        await db
          .update(mayaPersonalMemory)
          .set(saveData)
          .where(eq(mayaPersonalMemory.userId, data.userId));
        console.log(`✅ Maya: Updated memory for user ${data.userId} - version ${saveData.memoryVersion}`);
      } else {
        // Create new memory
        await db
          .insert(mayaPersonalMemory)
          .values(saveData);
        console.log(`✅ Maya: Created memory for user ${data.userId} - version ${saveData.memoryVersion}`);
      }
      
      return {
        ...data,
        lastMemoryUpdate: saveData.lastMemoryUpdate,
        memoryVersion: saveData.memoryVersion
      };
    } catch (error) {
      console.error('❌ Error saving Maya personal memory:', error);
      throw error;
    }
  }
}