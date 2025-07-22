// Authentication and Database Storage Audit Service
// Identifies and fixes gaps between authenticated users and database storage

import { storage } from './storage';

export class AuthAuditService {
  
  /**
   * Comprehensive audit of authentication vs database storage
   * Identifies users who can access system but aren't properly stored
   */
  static async auditAuthenticationGaps() {
    console.log('🔍 Starting comprehensive authentication audit...');
    
    try {
      // Get all users from database
      const databaseUsers = await storage.getAllUsers();
      console.log(`📊 Found ${databaseUsers.length} users in database`);
      
      // Get all email captures (these represent user signup attempts)
      const emailCaptures = await storage.getAllEmailCaptures();
      console.log(`📧 Found ${emailCaptures.length} email captures`);
      
      // Analysis: Find email captures without corresponding database users
      const orphanedSignups = emailCaptures.filter(capture => 
        !databaseUsers.some(user => user.email === capture.email)
      );
      
      console.log(`\n🚨 AUDIT RESULTS:`);
      console.log(`   Database Users: ${databaseUsers.length}`);
      console.log(`   Email Captures: ${emailCaptures.length}`);
      console.log(`   Orphaned Signups: ${orphanedSignups.length}`);
      
      if (orphanedSignups.length > 0) {
        console.log(`\n📋 ORPHANED SIGNUPS (Email captured but no database user):`);
        orphanedSignups.forEach((capture, index) => {
          console.log(`   ${index + 1}. ${capture.email} (${capture.plan}) - Captured: ${capture.captured}`);
        });
      }
      
      // Check for users with missing essential data
      const incompleteUsers = databaseUsers.filter(user => 
        !user.email || !user.plan || !user.role
      );
      
      if (incompleteUsers.length > 0) {
        console.log(`\n⚠️ INCOMPLETE USER RECORDS:`);
        incompleteUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email || 'MISSING'}, Plan: ${user.plan || 'MISSING'}, Role: ${user.role || 'MISSING'}`);
        });
      }
      
      return {
        databaseUsers: databaseUsers.length,
        emailCaptures: emailCaptures.length,
        orphanedSignups: orphanedSignups.length,
        incompleteUsers: incompleteUsers.length,
        orphanedSignupsList: orphanedSignups,
        incompleteUsersList: incompleteUsers
      };
      
    } catch (error) {
      console.error('❌ Authentication audit failed:', error);
      throw error;
    }
  }
  
  /**
   * Fix orphaned signups by creating proper database users
   * Called when email captures exist but no corresponding database user
   */
  static async fixOrphanedSignups(orphanedSignups: any[]) {
    console.log(`🔧 Fixing ${orphanedSignups.length} orphaned signups...`);
    
    const fixedUsers = [];
    const failedFixes = [];
    
    for (const capture of orphanedSignups) {
      try {
        // Generate a temporary Replit user ID for these orphaned signups
        // This simulates what would happen during proper OAuth flow
        const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`🔄 Creating database user for orphaned signup: ${capture.email}`);
        
        const userData = {
          id: tempUserId,
          email: capture.email,
          firstName: null,
          lastName: null,
          profileImageUrl: null,
          plan: capture.plan || 'free',
          role: 'user' as const,
          monthlyGenerationLimit: capture.plan === 'sselfie-studio' ? -1 : 6,
          mayaAiAccess: true,
          victoriaAiAccess: true
        };
        
        const createdUser = await storage.upsertUser(userData);
        fixedUsers.push({ email: capture.email, userId: createdUser.id });
        
        console.log(`✅ Created database user for: ${capture.email} (ID: ${createdUser.id})`);
        
      } catch (error) {
        console.error(`❌ Failed to fix orphaned signup for ${capture.email}:`, error);
        failedFixes.push({ email: capture.email, error: error.message });
      }
    }
    
    return { fixedUsers, failedFixes };
  }
  
  /**
   * Complete authentication gap fix workflow
   * Audits and repairs all authentication/storage inconsistencies
   */
  static async fixAuthenticationGaps() {
    console.log('🚀 Starting complete authentication gap fix...');
    
    try {
      // Step 1: Audit current state
      const auditResults = await this.auditAuthenticationGaps();
      
      // Step 2: Fix orphaned signups if any exist
      let fixResults = null;
      if (auditResults.orphanedSignups > 0) {
        fixResults = await this.fixOrphanedSignups(auditResults.orphanedSignupsList);
      }
      
      // Step 3: Final audit to verify fixes
      const finalAudit = await this.auditAuthenticationGaps();
      
      console.log(`\n✅ AUTHENTICATION GAP FIX COMPLETE:`);
      console.log(`   Initial gaps: ${auditResults.orphanedSignups}`);
      console.log(`   Fixed users: ${fixResults?.fixedUsers.length || 0}`);
      console.log(`   Failed fixes: ${fixResults?.failedFixes.length || 0}`);
      console.log(`   Remaining gaps: ${finalAudit.orphanedSignups}`);
      
      return {
        initialAudit: auditResults,
        fixResults,
        finalAudit,
        success: finalAudit.orphanedSignups === 0
      };
      
    } catch (error) {
      console.error('❌ Authentication gap fix failed:', error);
      throw error;
    }
  }
  
  /**
   * Enhanced user session validation
   * Ensures all authenticated users have proper database records
   */
  static async validateUserSession(userId: string, userEmail?: string) {
    try {
      // Check if user exists in database
      const databaseUser = await storage.getUser(userId);
      
      if (!databaseUser) {
        console.error(`🚨 CRITICAL: Authenticated user ${userId} (${userEmail}) not found in database`);
        
        // If we have email, try to find by email and link
        if (userEmail) {
          const userByEmail = await storage.getUserByEmail(userEmail);
          if (userByEmail) {
            console.log(`🔄 Found user by email, updating ID linkage...`);
            // Update the existing record with the authenticated user ID
            await storage.upsertUser({
              id: userId,
              email: userEmail,
              firstName: userByEmail.firstName,
              lastName: userByEmail.lastName,
              profileImageUrl: userByEmail.profileImageUrl,
              plan: userByEmail.plan,
              role: userByEmail.role,
              monthlyGenerationLimit: userByEmail.monthlyGenerationLimit,
              mayaAiAccess: userByEmail.mayaAiAccess,
              victoriaAiAccess: userByEmail.victoriaAiAccess
            });
            return true;
          }
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ User session validation failed:', error);
      return false;
    }
  }
}