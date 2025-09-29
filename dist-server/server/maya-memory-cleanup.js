import { MayaMemoryService } from './services/maya-memory-service.js';
import { storage } from './storage.js';
export async function cleanupAllRestrictiveMemory() {
    console.log('🧠 MAYA MEMORY CLEANUP: Starting cleanup of restrictive categorizations...');
    try {
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
            }
            catch (error) {
                console.error(`❌ Failed to clean memory for user ${user.id}:`, error);
            }
        }
        console.log(`✅ MAYA MEMORY CLEANUP COMPLETE: Cleaned ${cleanedCount}/${allUsers.length} users`);
        console.log('🎯 Maya can now use natural intelligence instead of restrictive keyword matching');
    }
    catch (error) {
        console.error('❌ MAYA MEMORY CLEANUP FAILED:', error);
        throw error;
    }
}
export async function cleanupUserRestrictiveMemory(userId) {
    try {
        await MayaMemoryService.clearRestrictiveCategorizations(userId);
        console.log(`✅ Successfully cleaned restrictive memory for user ${userId}`);
    }
    catch (error) {
        console.error(`❌ Failed to clean memory for user ${userId}:`, error);
        throw error;
    }
}
//# sourceMappingURL=maya-memory-cleanup.js.map