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

      const sanitizedUpdates = this.sanitizeInput(updates) as UpdateUserProfileRequest;

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
      ...overrides
    };
  }

  async createUser(email: string, userData: Partial<UserProfile> = {}): Promise<UserProfile | null> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      const sanitizedData = this.sanitizeInput(userData) as Partial<UserProfile>;
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
   * ✅ ENHANCED USER LINKING: Find or create user with migration support
   * This implements enhanced lookup with migration for users without Stack Auth IDs
   */
  async getOrCreateUser(stackAuthId: string, email: string, displayName?: string | null, profileImageUrl?: string | null) {
    try {
      if (!stackAuthId) {
        throw new Error('Stack Auth ID is required for user lookup');
      }

      this.log('info', 'Enhanced user lookup with migration support starting', {
        stackAuthId: stackAuthId.substring(0, 8) + '...',
        email,
        operation: 'getOrCreateUser'
      });

      // Use the migration service for enhanced user lookup
      const { UserMigrationService } = await import('./user-migration-service.js');
      const userMigrationService = new UserMigrationService();
      const userRecord = await userMigrationService.findOrMigrateUser(
        stackAuthId,
        email,
        displayName || null,
        profileImageUrl || null
      );

      if (!userRecord) {
        throw new Error('Failed to find, migrate, or create user');
      }

      this.log('info', '✅ User lookup completed successfully', {
        userId: userRecord.id,
        email: userRecord.email,
        hasStackAuthId: !!userRecord.stackAuthId
      });

      return this.normalizeUserProfile(userRecord);

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