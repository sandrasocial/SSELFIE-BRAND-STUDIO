/**
 * User Migration Service - Links existing users to Stack Auth accounts
 *
 * ✅ OPTIMIZED: Removed expensive getAllUsers() calls that were causing slow deployments
 * Now uses direct database queries for fast, efficient user migration
 */

import { storage } from '../storage.js';
import { userService } from './user-service.js';
import { users } from '../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export class UserMigrationService {
  /**
   * Finds an existing user by Stack Auth ID or email, and links the account if necessary.
   * If no existing user is found, it creates a new one.
   *
   * ✅ OPTIMIZED: Uses direct database queries instead of loading all users into memory
   */
  async findOrMigrateUser(
    stackAuthId: string,
    email: string | null,
    displayName: string | null,
    profileImageUrl: string | null
  ) {
    if (!stackAuthId) {
      throw new Error('Stack Auth ID is required for migration.');
    }

    // 1. Find user by Stack Auth ID (the ideal case - fastest)
    console.log('🔍 MIGRATION: Checking for existing Stack Auth ID:', stackAuthId.substring(0, 8) + '...');
    const userByStackAuthId = await storage.getUserByStackAuthId(stackAuthId);

    if (userByStackAuthId) {
      console.log(`✅ MIGRATION: Found user by Stack Auth ID: ${userByStackAuthId.id}`);
      return await this.updateUserProfile(userByStackAuthId, displayName, profileImageUrl);
    }

    // 2. Find user by email (the migration case - for existing users)
    if (email) {
      console.log('🔍 MIGRATION: Checking for existing email:', email);
      const userByEmail = await storage.getUserByEmail(email);

      if (userByEmail) {
        console.log(`🔄 MIGRATION: Migrating user by email: ${userByEmail.id}`);
        // Link the existing account to the new Stack Auth ID
        const linkedUser = await storage.linkStackAuthId(userByEmail.id, stackAuthId);
        return await this.updateUserProfile(linkedUser, displayName, profileImageUrl);
      }
    }

    // 3. No existing user found, create a new one
    console.log(`✨ MIGRATION: No existing user found. Creating new user for email: ${email}`);
    return await this.createNewStackAuthUser(stackAuthId, email, displayName, profileImageUrl);
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