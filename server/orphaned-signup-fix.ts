// Emergency fix for orphaned signup: jonajohanns@yahoo.com
// This user captured email but never got proper database record

import { storage } from './storage';

export class OrphanedSignupFix {
  
  /**
   * Create database user record for orphaned email capture
   * CRITICAL: This simulates what should have happened during OAuth flow
   */
  static async fixOrphanedSignup() {
    console.log('🔧 EMERGENCY FIX: Creating database user for orphaned signup...');
    
    try {
      const orphanedEmail = 'jonajohanns@yahoo.com';
      
      // Check if user already exists (safety check)
      const existingUser = await storage.getUserByEmail(orphanedEmail);
      if (existingUser) {
        console.log('✅ User already exists in database:', existingUser.id);
        return existingUser;
      }
      
      // Create temporary user ID (this simulates Replit OAuth ID)
      const tempUserId = `temp_${Date.now()}_orphaned_fix`;
      
      console.log(`🔄 Creating database user for: ${orphanedEmail}`);
      console.log(`🔄 Using temporary user ID: ${tempUserId}`);
      
      const userData = {
        id: tempUserId,
        email: orphanedEmail,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        plan: 'free', // Based on email capture data
        role: 'user',
        monthlyGenerationLimit: 6, // Free plan limit
        mayaAiAccess: true,
        victoriaAiAccess: true
      };
      
      const createdUser = await storage.upsertUser(userData);
      
      console.log('✅ EMERGENCY FIX COMPLETE: Database user created');
      console.log('   User ID:', createdUser.id);
      console.log('   Email:', createdUser.email);
      console.log('   Plan:', createdUser.plan);
      console.log('   Role:', createdUser.role);
      
      // Ensure user model exists
      try {
        await storage.ensureUserModel(createdUser.id);
        console.log('✅ User model ensured for fixed orphaned signup');
      } catch (modelError) {
        console.error('❌ Failed to ensure user model (non-critical):', modelError);
      }
      
      return createdUser;
      
    } catch (error) {
      console.error('❌ EMERGENCY FIX FAILED:', error);
      throw error;
    }
  }
  
  /**
   * Comprehensive verification of all users
   * Ensures no authentication gaps exist
   */
  static async verifyAllUsersHaveRecords() {
    console.log('🔍 Verifying all users have proper database records...');
    
    try {
      const emailCaptures = await storage.getAllEmailCaptures();
      const databaseUsers = await storage.getAllUsers();
      
      console.log(`📊 Email captures: ${emailCaptures.length}`);
      console.log(`📊 Database users: ${databaseUsers.length}`);
      
      // Find emails that have captures but no database user
      const orphanedEmails = [];
      
      for (const capture of emailCaptures) {
        const hasUser = databaseUsers.some(user => user.email === capture.email);
        if (!hasUser) {
          orphanedEmails.push(capture.email);
        }
      }
      
      if (orphanedEmails.length > 0) {
        console.log('🚨 ORPHANED EMAILS FOUND:');
        orphanedEmails.forEach((email, index) => {
          console.log(`   ${index + 1}. ${email}`);
        });
        return false;
      }
      
      console.log('✅ VERIFICATION PASSED: All email captures have corresponding database users');
      return true;
      
    } catch (error) {
      console.error('❌ User verification failed:', error);
      throw error;
    }
  }
}