/**
 * User Service
 * Handles user management and profile operations
 */

import { BaseService } from './base-service';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  profileImageUrl?: string;
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
      
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      this.handleError(error, 'getUser');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UpdateUserProfileRequest): Promise<UserProfile> {
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
    }
  }

  /**
   * Create new user
   */
  async createUser(email: string, userData: Partial<UserProfile> = {}): Promise<UserProfile> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      
      const sanitizedData = this.sanitizeInput(userData);
      // Use provided ID (for Stack Auth users) or generate new one
      const userId = sanitizedData.id || this.generateId('user');
      
      this.log('info', 'Creating new user', { email, userId, isStackAuthUser: !!sanitizedData.id });
      
      const newUser = await this.storage.createUser({
        id: userId,
        email,
        displayName: sanitizedData.displayName || email.split('@')[0],
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        gender: sanitizedData.gender,
        profileImageUrl: sanitizedData.profileImageUrl,
        // Stack Auth users get basic plan by default
        plan: sanitizedData.id ? 'sselfie-studio' : null,
        role: sanitizedData.id ? 'user' : null,
        monthlyGenerationLimit: sanitizedData.id ? 100 : 0,
        mayaAiAccess: sanitizedData.id ? true : false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        gender: newUser.gender,
        profileImageUrl: newUser.profileImageUrl,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };
    } catch (error) {
      this.handleError(error, 'createUser');
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
      
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      this.handleError(error, 'getUserByEmail');
    }
  }
}

// Export singleton instance
export const userService = new UserService();
