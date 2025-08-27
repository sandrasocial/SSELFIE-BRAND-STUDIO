import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  userPersonalBrand,
  userStyleProfile,
  mayaPersonalMemory,
  type UserPersonalBrand,
  type UserStyleProfile,
  type MayaPersonalMemory,
  type InsertUserPersonalBrand,
  type InsertUserStyleProfile,
  type InsertMayaPersonalMemory,
  type MayaUserContext,
  type OnboardingStep
} from "../shared/schema-maya-onboarding";

// =============================================================================
// MAYA STORAGE EXTENSIONS - NEW METHODS ONLY
// =============================================================================
// These methods extend existing storage without modifying current storage.ts
// Provides comprehensive personal brand and Maya memory management

export class MayaStorageExtensions {
  
  // =============================================================================
  // PERSONAL BRAND STORAGE
  // =============================================================================
  
  /**
   * Get user's personal brand data
   */
  static async getUserPersonalBrand(userId: string): Promise<UserPersonalBrand | null> {
    try {
      const [brand] = await db
        .select()
        .from(userPersonalBrand)
        .where(eq(userPersonalBrand.userId, userId));
      
      return brand || null;
    } catch (error) {
      console.error('Error fetching user personal brand:', error);
      return null;
    }
  }
  
  /**
   * Create or update user's personal brand
   */
  static async saveUserPersonalBrand(data: InsertUserPersonalBrand): Promise<UserPersonalBrand> {
    try {
      // Check if brand already exists
      const existing = await this.getUserPersonalBrand(data.userId);
      
      if (existing) {
        // Update existing record
        const [updated] = await db
          .update(userPersonalBrand)
          .set({
            ...data,
            updatedAt: new Date(),
            // Mark as completed if all required fields are present
            isCompleted: data.onboardingStep === 6 && 
                        !!data.transformationStory && 
                        !!data.dreamOutcome && 
                        !!data.businessGoals,
            completedAt: data.onboardingStep === 6 ? new Date() : existing.completedAt
          })
          .where(eq(userPersonalBrand.userId, data.userId))
          .returning();
        
        return updated;
      } else {
        // Create new record
        const [created] = await db
          .insert(userPersonalBrand)
          .values(data)
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('Error saving user personal brand:', error);
      throw error;
    }
  }
  
  /**
   * Update onboarding step progress
   */
  static async updateOnboardingStep(userId: string, step: OnboardingStep): Promise<void> {
    try {
      await db
        .update(userPersonalBrand)
        .set({ 
          onboardingStep: step,
          updatedAt: new Date()
        })
        .where(eq(userPersonalBrand.userId, userId));
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      throw error;
    }
  }
  
  // =============================================================================
  // STYLE PROFILE STORAGE
  // =============================================================================
  
  /**
   * Get user's style profile
   */
  static async getUserStyleProfile(userId: string): Promise<UserStyleProfile | null> {
    try {
      const [profile] = await db
        .select()
        .from(userStyleProfile)
        .where(eq(userStyleProfile.userId, userId));
      
      return profile || null;
    } catch (error) {
      console.error('Error fetching user style profile:', error);
      return null;
    }
  }
  
  /**
   * Create or update user's style profile
   */
  static async saveUserStyleProfile(data: InsertUserStyleProfile): Promise<UserStyleProfile> {
    try {
      // Check if profile already exists
      const existing = await this.getUserStyleProfile(data.userId);
      
      if (existing) {
        // Update existing record
        const [updated] = await db
          .update(userStyleProfile)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(userStyleProfile.userId, data.userId))
          .returning();
        
        return updated;
      } else {
        // Create new record
        const [created] = await db
          .insert(userStyleProfile)
          .values(data)
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('Error saving user style profile:', error);
      throw error;
    }
  }
  
  // =============================================================================
  // MAYA PERSONAL MEMORY STORAGE
  // =============================================================================
  
  /**
   * Get Maya's personal memory for a user
   */
  static async getMayaPersonalMemory(userId: string): Promise<MayaPersonalMemory | null> {
    try {
      const [memory] = await db
        .select()
        .from(mayaPersonalMemory)
        .where(eq(mayaPersonalMemory.userId, userId));
      
      return memory || null;
    } catch (error) {
      console.error('Error fetching Maya personal memory:', error);
      return null;
    }
  }
  
  /**
   * Create or update Maya's personal memory for a user
   */
  static async saveMayaPersonalMemory(data: InsertMayaPersonalMemory): Promise<MayaPersonalMemory> {
    try {
      // Check if memory already exists
      const existing = await this.getMayaPersonalMemory(data.userId);
      
      if (existing) {
        // Update existing record
        const [updated] = await db
          .update(mayaPersonalMemory)
          .set({
            ...data,
            memoryVersion: (existing.memoryVersion || 1) + 1,
            lastMemoryUpdate: new Date(),
            updatedAt: new Date()
          })
          .where(eq(mayaPersonalMemory.userId, data.userId))
          .returning();
        
        return updated;
      } else {
        // Create new record
        const [created] = await db
          .insert(mayaPersonalMemory)
          .values({
            ...data,
            memoryVersion: 1
          })
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('Error saving Maya personal memory:', error);
      throw error;
    }
  }
  
  /**
   * Update Maya's insights about a user (incremental updates)
   */
  static async updateMayaInsights(
    userId: string, 
    insights: Partial<any>
  ): Promise<void> {
    try {
      const existing = await this.getMayaPersonalMemory(userId);
      
      if (existing) {
        const updatedInsights = {
          ...existing.personalInsights,
          ...insights
        };
        
        await db
          .update(mayaPersonalMemory)
          .set({
            personalInsights: updatedInsights,
            lastMemoryUpdate: new Date(),
            updatedAt: new Date(),
            memoryVersion: (existing.memoryVersion || 1) + 1
          })
          .where(eq(mayaPersonalMemory.userId, userId));
      }
    } catch (error) {
      console.error('Error updating Maya insights:', error);
      throw error;
    }
  }
  
  // =============================================================================
  // COMPREHENSIVE CONTEXT RETRIEVAL
  // =============================================================================
  
  /**
   * Get complete Maya context for a user (all onboarding + memory data)
   */
  static async getMayaUserContext(userId: string): Promise<MayaUserContext> {
    try {
      const [personalBrand, styleProfile, mayaMemory] = await Promise.all([
        this.getUserPersonalBrand(userId),
        this.getUserStyleProfile(userId),
        this.getMayaPersonalMemory(userId)
      ]);
      
      const hasCompletedOnboarding = personalBrand?.isCompleted || false;
      const currentOnboardingStep = (personalBrand?.onboardingStep || 1) as OnboardingStep;
      
      return {
        personalBrand,
        styleProfile,
        mayaMemory,
        hasCompletedOnboarding,
        currentOnboardingStep
      };
    } catch (error) {
      console.error('Error fetching Maya user context:', error);
      
      // Return safe default context
      return {
        personalBrand: null,
        styleProfile: null,
        mayaMemory: null,
        hasCompletedOnboarding: false,
        currentOnboardingStep: 1
      };
    }
  }
  
  /**
   * Check if user has completed Maya onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const personalBrand = await this.getUserPersonalBrand(userId);
      return personalBrand?.isCompleted || false;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }
  
  /**
   * Get onboarding progress summary
   */
  static async getOnboardingProgress(userId: string): Promise<{
    currentStep: OnboardingStep;
    isCompleted: boolean;
    completedAt: Date | null;
    progressPercentage: number;
  }> {
    try {
      const personalBrand = await this.getUserPersonalBrand(userId);
      
      if (!personalBrand) {
        return {
          currentStep: 1,
          isCompleted: false,
          completedAt: null,
          progressPercentage: 0
        };
      }
      
      const progressPercentage = ((personalBrand.onboardingStep || 1) / 6) * 100;
      
      return {
        currentStep: (personalBrand.onboardingStep || 1) as OnboardingStep,
        isCompleted: personalBrand.isCompleted || false,
        completedAt: personalBrand.completedAt,
        progressPercentage
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return {
        currentStep: 1,
        isCompleted: false,
        completedAt: null,
        progressPercentage: 0
      };
    }
  }
  
  // =============================================================================
  // CLEANUP & MAINTENANCE
  // =============================================================================
  
  /**
   * Delete all Maya onboarding data for a user (for testing/cleanup)
   */
  static async deleteUserOnboardingData(userId: string): Promise<void> {
    try {
      await Promise.all([
        db.delete(mayaPersonalMemory).where(eq(mayaPersonalMemory.userId, userId)),
        db.delete(userStyleProfile).where(eq(userStyleProfile.userId, userId)),
        db.delete(userPersonalBrand).where(eq(userPersonalBrand.userId, userId))
      ]);
      
      console.log(`Deleted all Maya onboarding data for user ${userId}`);
    } catch (error) {
      console.error('Error deleting user onboarding data:', error);
      throw error;
    }
  }
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const {
  getUserPersonalBrand,
  saveUserPersonalBrand,
  updateOnboardingStep,
  getUserStyleProfile,
  saveUserStyleProfile,
  getMayaPersonalMemory,
  saveMayaPersonalMemory,
  updateMayaInsights,
  getMayaUserContext,
  hasCompletedOnboarding,
  getOnboardingProgress,
  deleteUserOnboardingData
} = MayaStorageExtensions;