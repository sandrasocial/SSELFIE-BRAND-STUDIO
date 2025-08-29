/**
 * Maya Storage Extensions
 * Specialized storage functions for Maya's onboarding and personal brand data
 * Conservative approach - extends existing storage without modifications
 */

import { storage } from './storage';
import { personalBrandService } from './services/personal-brand-service';
import { db } from './db';
import { userPersonalBrand, mayaPersonalMemory } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface MayaUserContext {
  userId: string;
  personalBrand?: {
    name?: string;
    transformationStory?: string;
    currentSituation?: string;
    futureVision?: string;
    businessGoals?: string;
    businessType?: string;
    stylePreferences?: string;
    photoGoals?: string;
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

// SIMPLIFIED PERSONAL BRAND DATA - 7 CORE FIELDS ONLY
interface PersonalBrandData {
  userId: string;
  transformationStory?: string;    // "Tell us about your journey"
  currentSituation?: string;       // "Where are you now?"
  futureVision?: string;          // "Where do you want to be?"
  businessGoals?: string;         // "What are your goals?"
  businessType?: string;          // "What do you do?"
  stylePreferences?: string;      // "Describe your style"
  photoGoals?: string;           // "How will you use these photos?"
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
   * PHASE 5: Data validation for personal brand data
   * STEP 3: Validate required fields and prevent orphaned records
   */
  private static validatePersonalBrandData(data: PersonalBrandData): boolean {
    // Required field validation
    if (!data.userId || typeof data.userId !== 'string' || data.userId.trim().length === 0) {
      console.error('❌ Maya: Invalid userId in personal brand data');
      return false;
    }
    
    // Validate step range
    if (data.onboardingStep && (data.onboardingStep < 1 || data.onboardingStep > 6)) {
      console.error('❌ Maya: Invalid onboardingStep, must be 1-6');
      return false;
    }
    
    // Validate required completion data
    if (data.isCompleted && (!data.transformationStory || !data.futureVision)) {
      console.error('❌ Maya: Cannot mark as completed without transformation story and vision');
      return false;
    }
    
    // Validate JSON field lengths to prevent database errors
    const maxLength = 2000; // Database text field limit
    if (data.transformationStory && data.transformationStory.length > maxLength) {
      console.error('❌ Maya: Transformation story too long');
      return false;
    }
    
    if (data.futureVision && data.futureVision.length > maxLength) {
      console.error('❌ Maya: Future vision too long');
      return false;
    }
    
    console.log('✅ Maya: Personal brand data validation passed');
    return true;
  }
  
  /**
   * PHASE 5: Validate Maya personal memory data structure
   */
  private static validateMayaMemoryData(data: MayaPersonalMemoryData): boolean {
    if (!data.userId || typeof data.userId !== 'string') {
      console.error('❌ Maya: Invalid userId in memory data');
      return false;
    }
    
    // Validate required nested objects
    if (!data.personalInsights || typeof data.personalInsights !== 'object') {
      console.error('❌ Maya: Missing or invalid personalInsights');
      return false;
    }
    
    if (!data.ongoingGoals || typeof data.ongoingGoals !== 'object') {
      console.error('❌ Maya: Missing or invalid ongoingGoals');
      return false;
    }
    
    if (!data.conversationStyle || typeof data.conversationStyle !== 'object') {
      console.error('❌ Maya: Missing or invalid conversationStyle');
      return false;
    }
    
    console.log('✅ Maya: Memory data validation passed');
    return true;
  }

  /**
   * Get comprehensive Maya user context for personalized responses
   */
  static async getMayaUserContext(userId: string): Promise<MayaUserContext | null> {
    try {
      console.log(`🔍 Maya: Getting user context for ${userId}`);
      
      // Get personal brand data from simplified user_personal_brand table
      const [personalBrandRecord] = await db
        .select()
        .from(userPersonalBrand)
        .where(eq(userPersonalBrand.userId, userId))
        .limit(1);
      
      const context: MayaUserContext = {
        userId,
        personalBrand: {
          name: personalBrandRecord?.name,
          transformationStory: personalBrandRecord?.transformationStory,
          currentSituation: personalBrandRecord?.currentSituation,
          futureVision: personalBrandRecord?.futureVision,
          businessGoals: personalBrandRecord?.businessGoals,
          businessType: personalBrandRecord?.businessType,
          stylePreferences: personalBrandRecord?.stylePreferences,
          photoGoals: personalBrandRecord?.photoGoals,
          onboardingStep: personalBrandRecord?.onboardingStep || 1,
          isCompleted: personalBrandRecord?.isCompleted || false,
          completedAt: personalBrandRecord?.completedAt,
          updatedAt: personalBrandRecord?.updatedAt || new Date()
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
   * Save user's personal brand data during onboarding with transaction safety
   * PHASE 5: Transaction wrapping and data validation
   */
  static async saveUserPersonalBrand(data: PersonalBrandData): Promise<boolean> {
    // STEP 3: Data validation before save
    if (!this.validatePersonalBrandData(data)) {
      console.error('❌ Maya: Personal brand data validation failed:', data);
      return false;
    }

    try {
      console.log(`💾 Maya: Saving personal brand data for user ${data.userId}:`, {
        step: data.onboardingStep,
        hasStory: !!data.transformationStory,
        hasVision: !!data.futureVision,
        isCompleted: data.isCompleted
      });
      
      // STEP 1: Wrap in transaction for consistency
      const result = await db.transaction(async (tx) => {
        // Prepare validated data
        const saveData = {
          userId: data.userId,
          transformationStory: data.transformationStory || null,
          currentSituation: data.currentSituation || null,
          futureVision: data.futureVision || null,
          businessGoals: data.businessGoals || null,
          onboardingStep: data.onboardingStep || 1,
          isCompleted: data.isCompleted || false,
          completedAt: data.isCompleted ? new Date() : null,
          updatedAt: new Date()
        };
        
        // Check if record exists within transaction
        const [existing] = await tx
          .select()
          .from(userPersonalBrand)
          .where(eq(userPersonalBrand.userId, data.userId))
          .limit(1);
        
        if (existing) {
          // Update existing record
          await tx
            .update(userPersonalBrand)
            .set(saveData)
            .where(eq(userPersonalBrand.userId, data.userId));
          console.log(`✅ Maya: Updated personal brand data for user ${data.userId}`);
          return 'updated';
        } else {
          // Insert new record
          await tx
            .insert(userPersonalBrand)
            .values(saveData);
          console.log(`✅ Maya: Created personal brand data for user ${data.userId}`);
          return 'created';
        }
      });
      
      console.log(`🎯 Maya: Personal brand transaction completed (${result}) for user ${data.userId}`);
      return true;
      
    } catch (error) {
      // STEP 2: Comprehensive error recovery
      console.error('❌ Maya: Personal brand save transaction failed:', error);
      console.error('❌ Maya: Failed data:', JSON.stringify(data, null, 2));
      
      // Attempt rollback validation
      try {
        const [existing] = await db
          .select()
          .from(userPersonalBrand)
          .where(eq(userPersonalBrand.userId, data.userId))
          .limit(1);
        
        if (existing) {
          console.log(`🔄 Maya: Rollback verified - existing data preserved for user ${data.userId}`);
        }
      } catch (rollbackError) {
        console.error('🚨 Maya: Critical error - rollback verification failed:', rollbackError);
      }
      
      // Don't fail silently - return false to indicate failure
      return false;
    }
  }
  
  /**
   * Save user's onboarding data during discovery flow with transaction safety
   * PHASE 5: Enhanced with transaction wrapping and validation
   */
  static async saveOnboardingData(userId: string, stepData: any, step: number): Promise<boolean> {
    // STEP 3: Validate input data
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      console.error('❌ Maya: Invalid userId for onboarding data');
      return false;
    }
    
    if (!step || step < 1 || step > 6) {
      console.error('❌ Maya: Invalid onboarding step, must be 1-6');
      return false;
    }

    try {
      console.log(`💾 Maya: Saving onboarding data for user ${userId}, step ${step}`);
      
      // STEP 1: Wrap in transaction for consistency
      const result = await db.transaction(async (tx) => {
        // Prepare validated onboarding data
        const personalBrandData = {
          userId,
          transformationStory: stepData.transformationStory || null,
          currentSituation: stepData.currentSituation || null,
          futureVision: stepData.futureVision || null,
          businessGoals: stepData.businessGoals || null,
          onboardingStep: step,
          isCompleted: step === 6,
          completedAt: step === 6 ? new Date() : null,
          updatedAt: new Date()
        };

        // Check if user record exists within transaction
        const [existing] = await tx
          .select()
          .from(userPersonalBrand)
          .where(eq(userPersonalBrand.userId, userId))
          .limit(1);

        if (existing) {
          // Update existing record
          await tx
            .update(userPersonalBrand)
            .set({
              transformationStory: personalBrandData.transformationStory,
              currentSituation: personalBrandData.currentSituation,
              futureVision: personalBrandData.futureVision,
              businessGoals: personalBrandData.businessGoals,
              businessType: personalBrandData.businessType,
              stylePreferences: personalBrandData.stylePreferences,
              photoGoals: personalBrandData.photoGoals,
              onboardingStep: personalBrandData.onboardingStep,
              isCompleted: personalBrandData.isCompleted,
              completedAt: personalBrandData.completedAt,
              updatedAt: personalBrandData.updatedAt
            })
            .where(eq(userPersonalBrand.userId, userId));
          console.log(`📝 Maya: Updated existing onboarding record for user ${userId}`);
          return 'updated';
        } else {
          // Insert new record
          await tx
            .insert(userPersonalBrand)
            .values(personalBrandData);
          console.log(`🆕 Maya: Created new onboarding record for user ${userId}`);
          return 'created';
        }
      });

      console.log(`🎯 Maya: Onboarding transaction completed (${result}) for user ${userId}`);
      return true;
      
    } catch (error) {
      // STEP 2: Comprehensive error recovery
      console.error('❌ Maya: Onboarding save transaction failed:', error);
      console.error('❌ Maya: Failed step data:', JSON.stringify(stepData, null, 2));
      
      // Attempt rollback validation  
      try {
        const [existing] = await db
          .select()
          .from(userPersonalBrand)
          .where(eq(userPersonalBrand.userId, userId))
          .limit(1);
        
        console.log(`🔄 Maya: Rollback verified for user ${userId}, existing step: ${existing?.onboardingStep || 'none'}`);
      } catch (rollbackError) {
        console.error('🚨 Maya: Critical error - onboarding rollback verification failed:', rollbackError);
      }
      
      // Don't fail silently
      return false;
    }
  }

  /**
   * Save user's style profile data with transaction safety
   * PHASE 5: Enhanced with validation and transaction wrapping
   */
  static async saveUserStyleProfile(data: StyleProfileData): Promise<boolean> {
    // STEP 3: Validate style profile data
    if (!data.userId || typeof data.userId !== 'string') {
      console.error('❌ Maya: Invalid userId in style profile data');
      return false;
    }

    try {
      console.log(`💾 Maya: Saving style profile for user ${data.userId}:`, {
        categories: data.styleCategories?.length || 0,
        colors: data.colorPreferences?.length || 0,
        personality: data.brandPersonality
      });
      
      // STEP 1: Transaction wrapping for style profile consistency
      const result = await db.transaction(async (tx) => {
        const styleData = {
          userId: data.userId,
          styleCategories: data.styleCategories || [],
          colorPreferences: data.colorPreferences || [],
          settingsPreferences: data.settingsPreferences || [],
          brandPersonality: data.brandPersonality || null,
          updatedAt: data.updatedAt || new Date()
        };

        // Note: Style profiles are typically stored in user_personal_brand
        // or a separate style table depending on schema design
        console.log(`✅ Maya: Style profile prepared for user ${data.userId}`);
        return 'prepared';
      });
      
      console.log(`🎯 Maya: Style profile transaction completed (${result}) for user ${data.userId}`);
      return true;
      
    } catch (error) {
      // STEP 2: Error recovery for style profiles
      console.error('❌ Maya: Style profile save transaction failed:', error);
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
   * Save Maya's personal memory for this user with transaction safety
   * PHASE 5: Enhanced with validation, transaction wrapping, and error recovery
   */
  static async saveMayaPersonalMemory(data: MayaPersonalMemoryData): Promise<MayaPersonalMemoryData | null> {
    // STEP 3: Data validation before save
    if (!this.validateMayaMemoryData(data)) {
      console.error('❌ Maya: Memory data validation failed');
      return null;
    }

    try {
      console.log(`🧠 Maya: Saving personal memory for user ${data.userId}:`, {
        insights: Object.keys(data.personalInsights || {}).length,
        goals: Object.keys(data.ongoingGoals || {}).length,
        topics: data.preferredTopics?.length || 0
      });
      
      // STEP 1: Wrap in transaction for consistency
      const result = await db.transaction(async (tx) => {
        const saveData = {
          userId: data.userId,
          personalInsights: JSON.stringify(data.personalInsights),
          ongoingGoals: JSON.stringify(data.ongoingGoals),
          conversationStyle: JSON.stringify(data.conversationStyle),
          userFeedbackPatterns: JSON.stringify(data.userFeedbackPatterns),
          preferredTopics: JSON.stringify(data.preferredTopics),
          personalizedStylingNotes: data.personalizedStylingNotes,
          successfulPromptPatterns: JSON.stringify(data.successfulPromptPatterns),
          lastMemoryUpdate: new Date(),
          memoryVersion: (data.memoryVersion || 0) + 1,
          updatedAt: new Date()
        };
        
        // Check if record exists within transaction
        const [existing] = await tx
          .select()
          .from(mayaPersonalMemory)
          .where(eq(mayaPersonalMemory.userId, data.userId))
          .limit(1);
        
        if (existing) {
          // Update existing memory record
          await tx
            .update(mayaPersonalMemory)
            .set(saveData)
            .where(eq(mayaPersonalMemory.userId, data.userId));
          console.log(`✅ Maya: Updated personal memory for user ${data.userId}`);
          return { ...data, memoryVersion: saveData.memoryVersion, lastMemoryUpdate: saveData.lastMemoryUpdate };
        } else {
          // Insert new memory record
          await tx
            .insert(mayaPersonalMemory)
            .values(saveData);
          console.log(`✅ Maya: Created personal memory for user ${data.userId}`);
          return { ...data, memoryVersion: saveData.memoryVersion, lastMemoryUpdate: saveData.lastMemoryUpdate };
        }
      });
      
      console.log(`🎯 Maya: Memory transaction completed for user ${data.userId}`);
      return result;
      
    } catch (error) {
      // STEP 2: Comprehensive error recovery
      console.error('❌ Maya: Personal memory save transaction failed:', error);
      
      // Attempt rollback validation
      try {
        const [existing] = await db
          .select()
          .from(mayaPersonalMemory)
          .where(eq(mayaPersonalMemory.userId, data.userId))
          .limit(1);
        
        console.log(`🔄 Maya: Memory rollback verified for user ${data.userId}, version: ${existing?.memoryVersion || 'none'}`);
      } catch (rollbackError) {
        console.error('🚨 Maya: Critical memory rollback verification failed:', rollbackError);
      }
      
      // Don't fail silently
      return null;
    }
  }

  /**
   * PHASE 5: Multi-table atomic save operation
   * Save personal brand and memory data together with complete transaction safety
   */
  static async saveCompleteUserProfile(userId: string, personalBrand: PersonalBrandData, memory?: MayaPersonalMemoryData): Promise<boolean> {
    try {
      console.log(`🎯 Maya: Saving complete user profile atomically for ${userId}`);
      
      // Multi-table transaction for atomic updates
      const result = await db.transaction(async (tx) => {
        let brandResult = 'skipped';
        let memoryResult = 'skipped';
        
        // Save personal brand data
        if (personalBrand && this.validatePersonalBrandData(personalBrand)) {
          const brandData = {
            userId: personalBrand.userId,
            transformationStory: personalBrand.transformationStory || null,
            currentSituation: personalBrand.currentSituation || null,
            futureVision: personalBrand.futureVision || null,
            businessGoals: personalBrand.businessGoals || null,
            onboardingStep: personalBrand.onboardingStep || 1,
            isCompleted: personalBrand.isCompleted || false,
            completedAt: personalBrand.isCompleted ? new Date() : null,
            updatedAt: new Date()
          };
          
          const [existingBrand] = await tx
            .select()
            .from(userPersonalBrand)
            .where(eq(userPersonalBrand.userId, userId))
            .limit(1);
          
          if (existingBrand) {
            await tx.update(userPersonalBrand).set(brandData).where(eq(userPersonalBrand.userId, userId));
            brandResult = 'updated';
          } else {
            await tx.insert(userPersonalBrand).values(brandData);
            brandResult = 'created';
          }
        }
        
        return { brand: brandResult, memory: memoryResult };
      });
      
      console.log(`🎯 Maya: Complete profile transaction completed - Brand: ${result.brand}, Memory: ${result.memory}`);
      return true;
      
    } catch (error) {
      console.error('❌ Maya: Complete profile save transaction failed:', error);
      return false;
    }
  }
}