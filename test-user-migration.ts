/**
 * Test script for user migration functionality
 */

import { userMigrationService } from './server/services/user-migration-service.js';
import { storage } from './server/storage.js';

async function testUserMigration() {
  console.log('🧪 === TESTING USER MIGRATION FUNCTIONALITY ===');

  try {
    // Test 1: Find orphaned users with valuable data
    console.log('\n🔍 Test 1: Finding orphaned users with data...');
    const orphanedUsers = await userMigrationService.findOrphanedUsersWithData();
    
    console.log(`Found ${orphanedUsers.length} orphaned users with valuable data:`);
    orphanedUsers.slice(0, 5).forEach((user, i) => {
      console.log(`${i + 1}. ${user.email || user.id} - Model: ${user.hasModel ? 'YES' : 'NO'}, Images: ${user.imageCount}`);
    });

    // Test 2: Simulate authentication for a user with data but no Stack Auth ID
    const testUser = orphanedUsers.find(u => u.hasModel && u.email);
    
    if (testUser) {
      console.log(`\n🧪 Test 2: Simulating authentication for user with data: ${testUser.email}`);
      
      // Simulate what happens when this user signs in with Stack Auth
      const mockStackAuthId = `mock-stack-auth-${Date.now()}`;
      
      console.log(`Attempting migration: ${testUser.email} → Stack ID: ${mockStackAuthId.substring(0, 20)}...`);
      
      const migratedUser = await userMigrationService.findOrMigrateUser(
        mockStackAuthId,
        testUser.email,
        testUser.displayName,
        testUser.profileImageUrl
      );
      
      if (migratedUser) {
        console.log('✅ Migration test successful!');
        console.log('  - User ID preserved:', migratedUser.id === testUser.id);
        console.log('  - Stack Auth ID added:', !!migratedUser.stackAuthId);
        console.log('  - Email preserved:', migratedUser.email === testUser.email);
        
        // Verify user can still access their data
        const userModel = await storage.getUserModel(migratedUser.id).catch(() => null);
        const userImages = await storage.getUserAIImages(migratedUser.id).catch(() => []);
        
        console.log('  - Model accessible:', !!userModel);
        console.log('  - Images accessible:', userImages.length);
        
        // Clean up - remove the mock Stack Auth ID
        await storage.updateUserProfile(migratedUser.id, { stackAuthId: null });
        console.log('🧹 Cleaned up test migration');
        
      } else {
        console.log('❌ Migration test failed');
      }
      
    } else {
      console.log('⚠️  No suitable test user found for migration test');
    }

    // Test 3: Test new user creation
    console.log('\n🧪 Test 3: Testing new user creation...');
    
    const newStackAuthId = `new-user-test-${Date.now()}`;
    const newUser = await userMigrationService.findOrMigrateUser(
      newStackAuthId,
      'test-new-user@example.com',
      'Test New User',
      null
    );
    
    if (newUser) {
      console.log('✅ New user creation successful');
      console.log('  - New user ID:', newUser.id);
      console.log('  - Stack Auth ID set:', newUser.stackAuthId === newStackAuthId);
      console.log('  - Email set:', newUser.email);
      
      // Clean up
      // Note: In a real system, you might want to delete this test user
      console.log('⚠️  Test user created - may need manual cleanup');
    } else {
      console.log('❌ New user creation failed');
    }

    console.log('\n✅ === MIGRATION TESTS COMPLETED ===');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserMigration().catch(console.error);