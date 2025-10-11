/**
 * Maya Profile Service
 * Handles user profile management and model tracking for Maya AI system
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { 
  MayaProfile,
  InsertMayaProfile
} from '../../../shared/schema-maya.js';
import { UserModel } from '../../../shared/schema.js';

export class MayaProfileService {
  private db: IStorage;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
  }

  /**
   * Get or create Maya profile for user
   */
  async getOrCreateUserProfile(stackAuthId: string): Promise<MayaProfile> {
    try {
      // Get user data first to get database user ID
      let user = await this.db.getUserByStackAuthId(stackAuthId);
      
      if (!user) {
        console.log(`🔍 MAYA PROFILE: User not found by Stack Auth ID: ${stackAuthId}, attempting auto-linking...`);
        
        // Try to find user by the Stack Auth ID as primary ID (legacy users)
        user = await this.db.getUser(stackAuthId);
        
        if (user) {
          // Link the Stack Auth ID to this user
          console.log(`🔗 MAYA PROFILE: Linking Stack Auth ID ${stackAuthId} to user ${user.id}`);
          user = await this.db.linkStackAuthId(user.id, stackAuthId);
        } else {
          throw new Error(`User not found with Stack Auth ID: ${stackAuthId}. User may need to complete registration.`);
        }
      }

      // Check if Maya profile exists
      let mayaProfile = await this.db.getMayaProfile(user.id);
      
      if (!mayaProfile) {
        // Create Maya profile with defaults
        console.log(`✨ MAYA PROFILE: Creating new Maya profile for user ${user.id}`);
        
        const defaultProfile: InsertMayaProfile = {
          userId: user.id,
          onboardingStatus: 'pending',
          onboardingStep: 1,
          completedSteps: [],
          preferences: {},
          billingInfo: {},
          totalGenerations: 0,
          monthlyGenerations: 0,
          lastResetDate: new Date(),
          featureAccess: {
            mayaChat: true,
            imageGeneration: true,
            modelTraining: true
          }
        } as any;

        const profileId = await this.db.insertMayaProfile(defaultProfile);
        mayaProfile = await this.db.getMayaProfile(user.id);
        
        if (!mayaProfile) {
          throw new Error('Failed to create Maya profile');
        }
        
        console.log(`✅ MAYA PROFILE: Created profile ${profileId} for user ${user.id}`);
      }

      return mayaProfile;
    } catch (error) {
      console.error('❌ MAYA PROFILE: Failed to get or create user profile:', error);
      throw error;
    }
  }

  /**
   * Get user's trained model information
   */
  async getUserModel(userId: string): Promise<UserModel | null> {
    try {
      return await this.db.getUserModelByUserId(userId) || null;
    } catch (error) {
      console.error('❌ MAYA PROFILE: Failed to get user model:', error);
      return null;
    }
  }

  /**
   * Update Maya profile preferences
   */
  async updateProfilePreferences(userId: string, preferences: any): Promise<void> {
    try {
      await this.db.updateMayaProfile(userId, { preferences });
      console.log(`✅ MAYA PROFILE: Updated preferences for user ${userId}`);
    } catch (error) {
      console.error('❌ MAYA PROFILE: Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * Update generation counters
   */
  async updateGenerationStats(userId: string, increment: number = 1): Promise<void> {
    try {
      const profile = await this.db.getMayaProfile(userId);
      if (!profile) {
        throw new Error('Maya profile not found');
      }

      await this.db.updateMayaProfile(userId, {
        totalGenerations: (profile.totalGenerations || 0) + increment,
        monthlyGenerations: (profile.monthlyGenerations || 0) + increment
      });
      
      console.log(`📊 MAYA PROFILE: Updated generation stats for user ${userId}`);
    } catch (error) {
      console.error('❌ MAYA PROFILE: Failed to update generation stats:', error);
      throw error;
    }
  }

  /**
   * Reset monthly generation counter (called monthly)
   */
  async resetMonthlyGenerations(userId: string): Promise<void> {
    try {
      await this.db.updateMayaProfile(userId, {
        monthlyGenerations: 0,
        lastResetDate: new Date()
      });
      
      console.log(`🔄 MAYA PROFILE: Reset monthly generations for user ${userId}`);
    } catch (error) {
      console.error('❌ MAYA PROFILE: Failed to reset monthly generations:', error);
      throw error;
    }
  }

  /**
   * Check if user has feature access
   */
  async hasFeatureAccess(userId: string, feature: 'mayaChat' | 'imageGeneration' | 'modelTraining'): Promise<boolean> {
    try {
      const profile = await this.db.getMayaProfile(userId);
      return (profile?.featureAccess as any)?.[feature] ?? false;
    } catch (error) {
      console.error('❌ MAYA PROFILE: Failed to check feature access:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mayaProfileService = new MayaProfileService();