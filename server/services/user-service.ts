/**
 * User Service
 * Handles user management and profile operations
 */

import { BaseService } from './base-service.js';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileRequest {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  profileImageUrl?: string | null;
}

export class UserService extends BaseService {
  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<UserProfile | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      this.log('info', 'Getting user', { userId });
      
      const user = await this.storage.getUser(userId);
      
      if (!user) {
        this.log('warn', 'User not found', { userId });
        return null;
      }

      // Type guard to ensure proper date handling
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
      const updatedAt = user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt);
      
      return {
        id: user.id,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        gender: user.gender ?? null,
        profileImageUrl: user.profileImageUrl ?? null,
        createdAt,
        updatedAt
      };
    } catch (error) {
      this.handleError(error, 'getUser');
      return null; // Explicit return for type safety
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UpdateUserProfileRequest): Promise<UserProfile | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const sanitizedUpdates = this.sanitizeInput(updates);
      
      // Validate gender if provided
      if (sanitizedUpdates.gender && !['man', 'woman', 'other'].includes(sanitizedUpdates.gender)) {
        throw new Error('Invalid gender value. Must be "man", "woman", or "other"');
      }
      
      this.log('info', 'Updating user profile', { userId, updates: sanitizedUpdates });
      
      await this.storage.updateUserProfile(userId, {
        ...sanitizedUpdates,
        updatedAt: new Date()
      });
      
      const updatedUser = await this.getUser(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      
      return updatedUser;
    } catch (error) {
      this.handleError(error, 'updateUserProfile');
      return null; // Explicit return for type safety
    }
  }

  /**
   * Create new user
   */
  // Utility: Default user fields for onboarding/business logic
  getDefaultUserFields(overrides: Partial<UserProfile> = {}): any {
    return {
      plan: 'sselfie-studio',
      role: 'user',
      monthlyGenerationLimit: 100,
      mayaAiAccess: true,
      victoriaAiAccess: false,
      preferredOnboardingMode: 'conversational',
      onboardingProgress: {},
      gender: '',
      profession: '',
      brandStyle: '',
      photoGoals: '',
      trainingCoachingStarted: false,
      trainingCoachingCompleted: false,
      trainingCoachingPhase: '',
      trainingCoachingStep: 0,
      brandStrategyContext: {},
      ...overrides
    };
  }

  async createUser(email: string, userData: Partial<UserProfile> = {}): Promise<UserProfile | null> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      const sanitizedData = this.sanitizeInput(userData);
      const userId = sanitizedData.id || this.generateId('user');
      this.log('info', 'Creating new user', { email, userId, isStackAuthUser: !!sanitizedData.id });
      
      const currentDate = new Date();
      const newUser = await this.storage.createUser(this.getDefaultUserFields({
        id: userId,
        email,
        displayName: sanitizedData.displayName || email.split('@')[0],
        firstName: sanitizedData.firstName ?? null,
        lastName: sanitizedData.lastName ?? null,
        gender: sanitizedData.gender ?? null,
        profileImageUrl: sanitizedData.profileImageUrl ?? null,
        createdAt: currentDate,
        updatedAt: currentDate
      }));
      
      // Type guard to ensure proper date handling
      const createdAt = newUser.createdAt instanceof Date ? newUser.createdAt : new Date(newUser.createdAt);
      const updatedAt = newUser.updatedAt instanceof Date ? newUser.updatedAt : new Date(newUser.updatedAt);
      
      return {
        id: newUser.id,
        email: newUser.email ?? null,
        displayName: newUser.displayName ?? null,
        firstName: newUser.firstName ?? null,
        lastName: newUser.lastName ?? null,
        gender: newUser.gender ?? null,
        profileImageUrl: newUser.profileImageUrl ?? null,
        createdAt,
        updatedAt
      };
    } catch (error) {
      this.handleError(error, 'createUser');
      return null; // Explicit return for type safety
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      
      this.log('info', 'Getting user by email', { email });
      
      const user = await this.storage.getUserByEmail(email);
      
      if (!user) {
        this.log('warn', 'User not found by email', { email });
        return null;
      }

      // Type guard to ensure proper date handling
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
      const updatedAt = user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt);
      
      return {
        id: user.id,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        gender: user.gender ?? null,
        profileImageUrl: user.profileImageUrl ?? null,
        createdAt,
        updatedAt
      };
    } catch (error) {
      this.handleError(error, 'getUserByEmail');
      return null; // Explicit return for type safety
    }
  }

  /**
   * 🔥 HARDENED: Get or create user with bulletproof Stack Auth ID and email linking
   * The function called by api/me.ts/withAuth middleware for authenticated requests
   * 
   * This implements the three-step lookup strategy:
   * 1. Try Stack Auth ID (primary key after migration)
   * 2. Try Email (crucial for existing users) and link to Stack Auth ID
   * 3. Create new user if neither found
   */
  async getOrCreateUser(stackAuthId: string, email: string, displayName?: string | null, profileImageUrl?: string | null) {
    try {
      if (!stackAuthId || !email) {
        throw new Error('Stack Auth ID and email are required for user lookup');
      }

      this.log('info', 'Hardened user lookup starting', { 
        stackAuthId: stackAuthId.substring(0, 8) + '...', 
        email,
        operation: 'getOrCreateUser'
      });

      // 🔍 STEP 1: Try to find the user by Stack Auth ID (primary key after migration)
      let userRecord = await this.storage.getUserByStackAuthId(stackAuthId);
      
      if (userRecord) {
        this.log('info', '✅ Found user by Stack Auth ID - success', { 
          userId: userRecord.id,
          email: userRecord.email
        });
        
        // Update last login and profile information
        const updatedUser = await this.storage.updateUserProfile(userRecord.id, {
          lastLoginAt: new Date(),
          displayName: displayName || userRecord.displayName,
          profileImageUrl: profileImageUrl || userRecord.profileImageUrl
        });
        
        return this.normalizeUserProfile(updatedUser || userRecord);
      }

      this.log('info', '� No user found by Stack Auth ID, trying email lookup');

      // 🔍 STEP 2: If not found by Stack ID, search by Email (Crucial for existing users)
      userRecord = await this.storage.getUserByEmail(email);
      
      if (userRecord) {
        this.log('info', '🔗 Found existing user by email - linking to Stack Auth ID', { 
          userId: userRecord.id,
          email: userRecord.email,
          hadPreviousStackId: !!userRecord.stackAuthId
        });
        
        // 💡 CRITICAL FIX: Link the existing user's DB record to the new Stack ID
        console.log(`🔗 Linking existing user ${userRecord.id} (Email: ${email}) to Stack ID ${stackAuthId}`);
        
        const linkedUser = await this.storage.linkStackAuthId(userRecord.id, stackAuthId);
        
        if (linkedUser) {
          // Update profile information and last login after linking
          const updatedUser = await this.storage.updateUserProfile(linkedUser.id, {
            lastLoginAt: new Date(),
            displayName: displayName || linkedUser.displayName,
            profileImageUrl: profileImageUrl || linkedUser.profileImageUrl
          });
          
          this.log('info', '✅ Successfully linked existing user to Stack Auth ID', {
            userId: linkedUser.id,
            email: linkedUser.email,
            stackAuthId: stackAuthId.substring(0, 8) + '...'
          });
          
          return this.normalizeUserProfile(updatedUser || linkedUser);
        }
        
        // Fallback: return the original user if linking failed
        this.log('warn', '⚠️ Stack Auth ID linking failed, returning original user');
        return this.normalizeUserProfile(userRecord);
      }

      this.log('info', '🔍 No existing user found by Stack Auth ID or email');

      // 🔍 STEP 3: If neither found, create a new user
      console.log(`➕ Creating new user with Stack ID ${stackAuthId} and email ${email}`);
      
      const newUser = await this.storage.syncStackAuthUser({
        id: stackAuthId,
        primaryEmail: email,
        displayName: displayName || null,
        profileImageUrl: profileImageUrl || null
      });

      if (!newUser) {
        throw new Error('Failed to create new user with Stack Auth integration');
      }

      this.log('info', '✅ Successfully created new user with Stack Auth ID', {
        userId: newUser.id,
        email: newUser.email,
        stackAuthId: stackAuthId.substring(0, 8) + '...'
      });

      return this.normalizeUserProfile(newUser);

    } catch (error) {
      this.log('error', '❌ Hardened user lookup failed', {
        stackAuthId: stackAuthId.substring(0, 8) + '...',
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      this.handleError(error, 'getOrCreateUser');
      throw error; // Re-throw for auth middleware to handle
    }
  }

  /**
   * Normalize user profile to consistent format
   */
  private normalizeUserProfile(user: any): UserProfile {
    const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
    const updatedAt = user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt);
    
    return {
      id: user.id,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      gender: user.gender ?? null,
      profileImageUrl: user.profileImageUrl ?? null,
      createdAt,
      updatedAt
    };
  }
}

// Export singleton instance
export const userService = new UserService();
