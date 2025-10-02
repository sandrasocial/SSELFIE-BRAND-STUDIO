/**
 * Database diagnostic script to investigate existing user data access issues
 */

import { storage } from './server/storage.js';

async function diagnoseUserDataAccess() {
  console.log('🔍 === DIAGNOSING EXISTING USER DATA ACCESS ISSUES ===');
  
  try {
    // 1. Check total users in database
    const allUsers = await storage.getAllUsers();
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    // 2. Analyze existing users structure
    console.log('\n🔍 === USER DATA ANALYSIS ===');
    for (let i = 0; i < Math.min(allUsers.length, 15); i++) {
      const user = allUsers[i];
      console.log(`User ${i + 1}:`, {
        id: user.id,
        email: user.email,
        stackAuthId: user.stackAuthId || 'NULL',
        hasStackAuthId: !!user.stackAuthId,
        plan: user.plan,
        createdAt: user.createdAt.toISOString().split('T')[0],
        monthlyLimit: user.monthlyGenerationLimit
      });
      
      // Check if user has trained models
      try {
        const userModel = await storage.getUserModel(user.id);
        console.log(`  └─ Model: ${userModel ? `${userModel.trainingStatus} (${userModel.id})` : 'NONE'}`);
        
        // Check if user has generated images
        const userImages = await storage.getUserAIImages(user.id);
        console.log(`  └─ Images: ${userImages.length} total`);
      } catch (error) {
        console.log(`  └─ Error checking user data: ${(error as Error).message}`);
      }
    }
    
    // 3. Check Stack Auth ID distribution
    const usersWithStackAuth = allUsers.filter(u => u.stackAuthId);
    const usersWithoutStackAuth = allUsers.filter(u => !u.stackAuthId);
    
    console.log(`\n📈 Stack Auth ID Distribution:`);
    console.log(`  - With Stack Auth ID: ${usersWithStackAuth.length}`);
    console.log(`  - Without Stack Auth ID: ${usersWithoutStackAuth.length}`);
    
    // 4. Check recent login activity
    const recentUsers = allUsers
      .filter(u => u.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())
      .slice(0, 10);
    
    console.log(`\n🕒 Recent Login Activity (last 10):`);
    recentUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} - ${user.lastLoginAt?.toISOString()} - Stack ID: ${user.stackAuthId ? 'YES' : 'NO'}`);
    });
    
    // 5. Simulate authentication for users without Stack Auth ID
    console.log(`\n🧪 === SIMULATING AUTH FOR USERS WITHOUT STACK AUTH ID ===`);
    
    const problematicUsers = usersWithoutStackAuth.slice(0, 3); // Test first 3
    
    for (const user of problematicUsers) {
      console.log(`\nTesting user: ${user.email} (ID: ${user.id})`);
      
      // Test email lookup
      try {
        const foundByEmail = await storage.getUserByEmail(user.email || '');
        console.log(`✅ Found by email: ${foundByEmail ? 'YES' : 'NO'}`);
        
        if (foundByEmail) {
          // Test what happens when we try to link a mock Stack Auth ID
          console.log(`🔗 Testing Stack Auth ID linking...`);
          
          // Simulate the linking process (don't actually link)
          console.log(`Would link user ${foundByEmail.id} to Stack Auth ID: mock-stack-id-${foundByEmail.id}`);
          
          // Check user's data accessibility
          const userModel = await storage.getUserModel(foundByEmail.id);
          const userImages = await storage.getUserAIImages(foundByEmail.id);
          
          console.log(`📊 User data status:`);
          console.log(`  - Model: ${userModel ? `${userModel.trainingStatus}` : 'NONE'}`);
          console.log(`  - Images: ${userImages.length}`);
          console.log(`  - Plan: ${foundByEmail.plan}`);
          console.log(`  - Monthly Limit: ${foundByEmail.monthlyGenerationLimit}`);
        }
      } catch (error) {
        console.log(`❌ Error testing user ${user.email}: ${(error as Error).message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run the diagnostic
diagnoseUserDataAccess().catch(console.error);