import { storage } from './storage.js';

/**
 * User Synchronization Repair Service
 * Fixes issues with users not properly synced between Stack Auth and Maya systems
 */
export class UserSyncRepairService {
  
  /**
   * Repair all users - ensure Maya profiles and user models exist
   */
  async repairAllUsers(): Promise<{ repaired: number; errors: string[] }> {
    console.log('🔧 Starting user synchronization repair...');
    
    const errors: string[] = [];
    let repaired = 0;

    try {
      // Get all users from the database
      const allUsers = await storage.getAllUsers();
      console.log(`📊 Found ${allUsers.length} users to check`);

      for (const user of allUsers) {
        try {
          console.log(`🔍 Checking user: ${user.email} (${user.id})`);
          
          // 1. Ensure Maya profile exists
          const mayaProfile = await storage.getMayaProfile(user.id);
          if (!mayaProfile) {
            console.log(`➕ Creating Maya profile for ${user.email}`);
            await storage.ensureMayaProfile(user.id);
            repaired++;
          }

          // 2. Ensure user model exists (if user should have one)
          const userModel = await storage.getUserModel(user.id);
          if (!userModel && (user.plan === 'sselfie-studio' || user.role === 'admin')) {
            console.log(`➕ Creating user model for ${user.email}`);
            await storage.ensureUserModel(user.id);
            repaired++;
          }

          // 3. Check Stack Auth ID linkage
          if (!user.stackAuthId && user.email) {
            console.log(`⚠️  User ${user.email} missing Stack Auth ID - may need manual linking`);
          }

        } catch (userError) {
          const errorMsg = `Failed to repair user ${user.email}: ${userError}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(`✅ User sync repair completed. Repaired: ${repaired}, Errors: ${errors.length}`);
      return { repaired, errors };

    } catch (error) {
      console.error('❌ User sync repair failed:', error);
      throw error;
    }
  }

  /**
   * Repair specific user by email or ID
   */
  async repairUser(identifier: string): Promise<boolean> {
    try {
      console.log(`🔧 Repairing user: ${identifier}`);

      // Find user by email or ID
      let user = await storage.getUser(identifier);
      if (!user) {
        user = await storage.getUserByEmail(identifier);
      }

      if (!user) {
        console.error(`❌ User not found: ${identifier}`);
        return false;
      }

      // Ensure Maya profile
      await storage.ensureMayaProfile(user.id);
      
      // Ensure user model if needed
      if (user.plan === 'sselfie-studio' || user.role === 'admin') {
        await storage.ensureUserModel(user.id);
      }

      console.log(`✅ User ${user.email} repaired successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to repair user ${identifier}:`, error);
      return false;
    }
  }

  /**
   * Check user sync status without making changes
   */
  async checkUserSyncStatus(): Promise<{
    totalUsers: number;
    usersWithMayaProfile: number;
    usersWithUserModel: number;
    usersWithStackAuth: number;
    issuesFound: string[];
  }> {
    console.log('📊 Checking user synchronization status...');

    const allUsers = await storage.getAllUsers();
    const issues: string[] = [];
    
    let usersWithMayaProfile = 0;
    let usersWithUserModel = 0;
    let usersWithStackAuth = 0;

    for (const user of allUsers) {
      // Check Maya profile
      const mayaProfile = await storage.getMayaProfile(user.id);
      if (mayaProfile) {
        usersWithMayaProfile++;
      } else {
        issues.push(`User ${user.email} missing Maya profile`);
      }

      // Check user model (only for paid users)
      if (user.plan === 'sselfie-studio' || user.role === 'admin') {
        const userModel = await storage.getUserModel(user.id);
        if (userModel) {
          usersWithUserModel++;
        } else {
          issues.push(`User ${user.email} missing user model`);
        }
      }

      // Check Stack Auth ID
      if (user.stackAuthId) {
        usersWithStackAuth++;
      } else {
        issues.push(`User ${user.email} missing Stack Auth ID`);
      }
    }

    const status = {
      totalUsers: allUsers.length,
      usersWithMayaProfile,
      usersWithUserModel,
      usersWithStackAuth,
      issuesFound: issues
    };

    console.log('📊 User sync status:', status);
    return status;
  }
}

export const userSyncRepair = new UserSyncRepairService();