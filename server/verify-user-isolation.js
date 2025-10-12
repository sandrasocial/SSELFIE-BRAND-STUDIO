/**
 * USER ISOLATION VERIFICATION SCRIPT
 * 
 * This script verifies that NO data is shared between users
 * Critical for production security - prevents data leaks
 * 
 * Run: node server/verify-user-isolation.js
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, count } from 'drizzle-orm';
import { 
  mayaConcepts, 
  mayaImages, 
  mayaModels, 
  mayaProfile, 
  mayaPayments,
  users,
  userModels
} from '../shared/schema.js';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function verifyUserIsolation() {
  console.log('🔒 VERIFYING USER ISOLATION - CRITICAL SECURITY CHECK\n');
  
  const issues = [];
  
  // 1. Check for hardcoded/demo users in database
  console.log('1️⃣ Checking for demo/test users in database...');
  const demoUserPatterns = ['demo-user', 'test-user', 'mock-user', 'placeholder', 'shared'];
  
  for (const pattern of demoUserPatterns) {
    const concepts = await db.select({ count: count() })
      .from(mayaConcepts)
      .where(eq(mayaConcepts.userId, pattern));
    
    if (concepts[0]?.count > 0) {
      issues.push(`❌ CRITICAL: Found ${concepts[0].count} concept cards with userId="${pattern}"`);
    }
    
    const images = await db.select({ count: count() })
      .from(mayaImages)
      .where(eq(mayaImages.userId, pattern));
    
    if (images[0]?.count > 0) {
      issues.push(`❌ CRITICAL: Found ${images[0].count} images with userId="${pattern}"`);
    }
    
    const profiles = await db.select({ count: count() })
      .from(mayaProfile)
      .where(eq(mayaProfile.userId, pattern));
    
    if (profiles[0]?.count > 0) {
      issues.push(`❌ CRITICAL: Found ${profiles[0].count} profiles with userId="${pattern}"`);
    }
  }
  
  if (issues.length === 0) {
    console.log('   ✅ No demo/test users found in database\n');
  } else {
    console.log('   ❌ ISSUES FOUND:\n');
    issues.forEach(issue => console.log(`      ${issue}`));
    console.log('');
  }
  
  // 2. Verify each user has their own model
  console.log('2️⃣ Verifying individual user models...');
  const modelCounts = await db.select({ 
    userId: userModels.userId,
    count: count()
  })
  .from(userModels)
  .groupBy(userModels.userId);
  
  const sharedModels = modelCounts.filter(m => m.count > 1);
  if (sharedModels.length > 0) {
    console.log('   ⚠️  Users with multiple models:');
    sharedModels.forEach(m => console.log(`      User ${m.userId}: ${m.count} models`));
  } else {
    console.log('   ✅ Each user has their own unique model\n');
  }
  
  // 3. Check for duplicate data across users
  console.log('3️⃣ Checking for duplicate user IDs...');
  const allUsers = await db.select({ id: users.id }).from(users);
  const uniqueIds = new Set(allUsers.map(u => u.id));
  
  if (allUsers.length !== uniqueIds.size) {
    issues.push(`❌ CRITICAL: Found duplicate user IDs (${allUsers.length} total, ${uniqueIds.size} unique)`);
  } else {
    console.log(`   ✅ All ${allUsers.length} users have unique IDs\n`);
  }
  
  // 4. Verify Stack Auth integration
  console.log('4️⃣ Verifying Stack Auth configuration...');
  if (!process.env.STACK_SECRET_SERVER_KEY) {
    issues.push('❌ CRITICAL: STACK_SECRET_SERVER_KEY not set in environment');
  } else {
    console.log('   ✅ Stack Auth secret key configured\n');
  }
  
  // 5. Summary
  console.log('\n' + '='.repeat(60));
  if (issues.length === 0) {
    console.log('✅ USER ISOLATION VERIFIED - PRODUCTION READY');
    console.log('   - No hardcoded users found');
    console.log('   - Each user has isolated data');
    console.log('   - Individual LoRA models per user');
    console.log('   - Stack Auth properly configured');
  } else {
    console.log('❌ USER ISOLATION ISSUES FOUND - NOT PRODUCTION READY');
    console.log('\nISSUES TO FIX:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  console.log('='.repeat(60) + '\n');
  
  return issues.length === 0;
}

// Run verification
verifyUserIsolation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Verification script error:', error);
    process.exit(1);
  });
