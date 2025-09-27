/**
 * Maya Memory Cleanup Utility
 * 🚫 ZERO TOLERANCE ANTI-HARDCODE: Clear restrictive business/professional categorizations
 * 
 * This utility clears any cached memory data that contains restrictive
 * business/professional assumptions, allowing Maya's natural intelligence
 * to detect user needs through authentic conversation.
 */

import { MayaMemoryService } from './services/maya-memory-service.js';
import { storage } from './storage.js'

/**
 * Clear restrictive categorizations for all users
 * Use this after removing hardcoded keyword matching to ensure clean slate
 */
export async function cleanupAllRestrictiveMemory(): Promise<void> {
  console.log('🧠 MAYA MEMORY CLEANUP: Starting cleanup of restrictive categorizations...');
  
  try {
    // Get all users
    const allUsers = await storage.getAllUsers();
    console.log(`🔍 Found ${allUsers.length} users to clean up`);

    let cleanedCount = 0;
    
    for (const user of allUsers) {
      try {
        await MayaMemoryService.clearRestrictiveCategorizations(user.id);
        cleanedCount++;
        
        if (cleanedCount % 10 === 0) {
          console.log(`🧹 Progress: ${cleanedCount}/${allUsers.length} users cleaned`);
        }
      } catch (error) {
        console.error(`❌ Failed to clean memory for user ${user.id}:`, error);
      }
    }

    console.log(`✅ MAYA MEMORY CLEANUP COMPLETE: Cleaned ${cleanedCount}/${allUsers.length} users`);
    console.log('🎯 Maya can now use natural intelligence instead of restrictive keyword matching');
    
  } catch (error) {
    console.error('❌ MAYA MEMORY CLEANUP FAILED:', error);
    throw error;
  }
}

/**
 * Clear restrictive categorizations for a specific user
 */
export async function cleanupUserRestrictiveMemory(userId: string): Promise<void> {
  console.log(`🧠 MAYA MEMORY CLEANUP: Cleaning restrictive categorizations for user ${userId}`);
  
  try {
      await MayaMemoryService.clearRestrictiveCategorizations(userId);
    console.log(`✅ Successfully cleaned restrictive memory for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to clean memory for user ${userId}:`, error);
    throw error;
  }
}

// Export for direct usage if needed
export { mayaMemoryService };