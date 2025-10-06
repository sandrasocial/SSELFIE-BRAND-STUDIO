/**
 * User Migration Service - Links existing users to Stack Auth accounts
 *
 * Handles cases where existing users have:
 * - No Stack Auth ID
 * - Null email addresses
 * - Trained models and images that need to be preserved
 */

import { storage } from '../storage.js';

export class UserMigrationService {

  /**
   * Enhanced user lookup with migration support
   * This replaces the existing getOrCreateUser logic with better migration handling
   */
  async findOrMigrateUser(
    stackAuthId: string,
    email: string | null,
    displayName: string | null,
    profileImageUrl: string | null
  ) {
      stackAuthId: stackAuthId.substring(0, 8) + '...',
      email,
      displayName
    });

    // Step 1: Try Stack Auth ID first (normal case)
    let user = await storage.getUserByStackAuthId(stackAuthId);
    if (user) {
      return await this.updateUserProfile(user, displayName, profileImageUrl);
    }

    // Step 2: Try email lookup (for existing users)
    if (email) {
      user = await storage.getUserByEmail(email);
      if (user) {
        const linkedUser = await storage.linkStackAuthId(user.id, stackAuthId);
        return await this.updateUserProfile(linkedUser, displayName, profileImageUrl);
      }
    }

    // Step 3: MIGRATION STRATEGY - Find users by similar attributes

    // Strategy A: Match by display name (for users with null emails)
    if (displayName && !email) {
      const candidateUsers = await this.findUsersByDisplayName(displayName);

      for (const candidate of candidateUsers) {
        if (!candidate.stackAuthId && this.shouldMigrateUser(candidate)) {

          // Ask user for confirmation in production (for now, auto-migrate)
          const migratedUser = await this.migrateUserToStackAuth(
            candidate,
            stackAuthId,
            email,
            displayName,
            profileImageUrl
          );

          if (migratedUser) {
            return migratedUser;
          }
        }
      }
    }

    // Strategy B: Find orphaned users with trained models (high-value users)
    const orphanedUsers = await this.findOrphanedUsersWithData();

    if (orphanedUsers.length > 0) {

      // For now, create new user but log potential migration candidates
      for (const orphan of orphanedUsers) {
      }
    }

    // Step 4: Create new user (fallback)
    return await this.createNewStackAuthUser(stackAuthId, email, displayName, profileImageUrl);
  }

  /**
   * Find users by display name for migration
   */
  async findUsersByDisplayName(displayName: string) {
    try {
      const allUsers = await storage.getAllUsers();
      return allUsers.filter(user =>
        user.displayName === displayName &&
        !user.stackAuthId &&
        this.shouldMigrateUser(user)
      );
    } catch (error) {
      console.error('Error finding users by display name:', error);
      return [];
    }
  }

  /**
   * Find orphaned users who have valuable data but no Stack Auth ID
   */
  async findOrphanedUsersWithData() {
    try {
      const allUsers = await storage.getAllUsers();
      const orphanedUsers = [];

      for (const user of allUsers) {
        if (!user.stackAuthId && this.shouldMigrateUser(user)) {
          // Check if user has valuable data
          const userModel = await storage.getUserModel(user.id).catch(() => null);
          const userImages = await storage.getUserAIImages(user.id).catch(() => []);

          if (userModel?.trainingStatus === 'completed' || userImages.length > 0) {
            orphanedUsers.push({
              ...user,
              hasModel: userModel?.trainingStatus === 'completed',
              imageCount: userImages.length
            });
          }
        }
      }

      return orphanedUsers.sort((a, b) => b.imageCount - a.imageCount); // Sort by image count
    } catch (error) {
      console.error('Error finding orphaned users:', error);
      return [];
    }
  }

  /**
   * Determine if a user should be considered for migration
   */
  shouldMigrateUser(user: any): boolean {
    // Don't migrate test users or users with suspicious data
    if (user.email?.includes('test') || user.email?.includes('example')) {
      return false;
    }

    // Don't migrate users created very recently (might be duplicates)
    const daysSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) {
      return false;
    }

    return true;
  }

  /**
   * Migrate an existing user to Stack Auth
   */
  async migrateUserToStackAuth(
    existingUser: any,
    stackAuthId: string,
    email: string | null,
    displayName: string | null,
    profileImageUrl: string | null
  ) {
    try {

      // Link to Stack Auth ID
      const linkedUser = await storage.linkStackAuthId(existingUser.id, stackAuthId);

      // Update profile with new information
      const updatedUser = await storage.updateUserProfile(linkedUser.id, {
        email: email || linkedUser.email,
        displayName: displayName || linkedUser.displayName,
        profileImageUrl: profileImageUrl || linkedUser.profileImageUrl,
        lastLoginAt: new Date()
      });

      return updatedUser;

    } catch (error) {
      console.error('❌ User migration failed:', error);
      return null;
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(user: any, displayName: string | null, profileImageUrl: string | null) {
    return await storage.updateUserProfile(user.id, {
      displayName: displayName || user.displayName,
      profileImageUrl: profileImageUrl || user.profileImageUrl,
      lastLoginAt: new Date()
    });
  }

  /**
   * Create new Stack Auth user
   */
  async createNewStackAuthUser(
    stackAuthId: string,
    email: string | null,
    displayName: string | null,
    profileImageUrl: string | null
  ) {
    return await storage.syncStackAuthUser({
      id: stackAuthId,
      primaryEmail: email || undefined,
      displayName: displayName || undefined,
      profileImageUrl: profileImageUrl || undefined
    });
  }

  /**
   * Manual migration tool for specific users
   */
  async manualMigrateUser(existingUserId: string, stackAuthId: string) {
    try {

      const existingUser = await storage.getUser(existingUserId);
      if (!existingUser) {
        throw new Error(`User ${existingUserId} not found`);
      }

      if (existingUser.stackAuthId) {
        return existingUser;
      }

      const linkedUser = await storage.linkStackAuthId(existingUserId, stackAuthId);
      return linkedUser;

    } catch (error) {
      console.error('❌ Manual migration failed:', error);
      throw error;
    }
  }
}

// Export singleton instance