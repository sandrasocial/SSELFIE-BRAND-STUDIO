// Debug script to check user data and Stack Auth linking
import { storage } from './server/storage.ts';

async function debugUserData() {
  console.log('🔍 Debugging user data and Stack Auth linking...\n');
  
  try {
    // Check for admin user by email
    const adminUser = await storage.getUserByEmail('ssa@ssasocial.com');
    console.log('📧 Admin user by email (ssa@ssasocial.com):', {
      found: !!adminUser,
      id: adminUser?.id,
      stackAuthId: adminUser?.stackAuthId,
      email: adminUser?.email,
      role: adminUser?.role,
      plan: adminUser?.plan,
      monthlyGenerationLimit: adminUser?.monthlyGenerationLimit,
      mayaAiAccess: adminUser?.mayaAiAccess
    });
    
    if (adminUser) {
      console.log('\n✅ Found existing admin user! This should be linked to Stack Auth.');
      
      if (!adminUser.stackAuthId) {
        console.log('⚠️  Admin user exists but has NO stackAuthId - this is the problem!');
        console.log('   The auth system will create a new user instead of using existing one.');
      } else {
        console.log('✅ Admin user already has stackAuthId:', adminUser.stackAuthId);
      }
    } else {
      console.log('❌ No admin user found with email ssa@ssasocial.com');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugUserData();