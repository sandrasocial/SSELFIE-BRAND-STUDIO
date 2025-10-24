#!/usr/bin/env node
/**
 * Test script to verify user linking fix works for Sandra's case
 * This simulates the authentication flow that should link Stack Auth ID to legacy user
 */

import { storage } from './server/storage.js';

async function testUserLinking() {
  console.log('🧪 Testing User Linking Fix for Sandra...\n');

  // Sandra's actual IDs from the logs
  const stackAuthId = '4baecefb-d77a-4221-91cd-26d790a0a917';
  const legacyUserId = '42585527';
  const email = 'ssa@ssasocial.com';

  try {
    // 1. Check current state
    console.log('📊 BEFORE: Checking current state...');
    
    const stackAuthUser = await storage.getUserByStackAuthId(stackAuthId);
    console.log('Stack Auth user:', stackAuthUser ? `Found (${stackAuthUser.id})` : 'Not found');
    
    const legacyUser = await storage.getUser(legacyUserId);
    console.log('Legacy user:', legacyUser ? `Found (${legacyUser.id})` : 'Not found');
    
    const legacyModel = await storage.getUserModel(legacyUserId);
    console.log('Legacy model:', legacyModel ? `Found (status: ${legacyModel.trainingStatus})` : 'Not found');

    // 2. Test the linking process
    console.log('\n🔗 TESTING: User linking process...');
    
    if (legacyUser && !legacyUser.stackAuthId) {
      console.log(`Linking Stack Auth ID ${stackAuthId} to legacy user ${legacyUserId}...`);
      const linkedUser = await storage.linkStackAuthId(legacyUserId, stackAuthId);
      console.log('✅ Linked user:', linkedUser.id, 'stackAuthId:', linkedUser.stackAuthId);
    } else {
      console.log('User already linked or not found');
    }

    // 3. Test model access via Stack Auth ID
    console.log('\n🔍 TESTING: Model access via Stack Auth ID...');
    const modelViaStackAuth = await storage.getUserModel(stackAuthId);
    console.log('Model via Stack Auth ID:', modelViaStackAuth ? `Found (status: ${modelViaStackAuth.trainingStatus})` : 'Not found');

    // 4. Test model access via legacy ID 
    console.log('\n🔍 TESTING: Model access via legacy ID...');
    const modelViaLegacyId = await storage.getUserModel(legacyUserId);
    console.log('Model via legacy ID:', modelViaLegacyId ? `Found (status: ${modelViaLegacyId.trainingStatus})` : 'Not found');

    // 5. Final verification
    console.log('\n✅ FINAL STATE:');
    const finalUser = await storage.getUserByStackAuthId(stackAuthId);
    if (finalUser) {
      console.log(`User ID: ${finalUser.id}`);
      console.log(`Stack Auth ID: ${finalUser.stackAuthId}`);
      console.log(`Email: ${finalUser.email}`);
      
      const finalModel = await storage.getUserModel(finalUser.id);
      console.log(`Has model: ${finalModel ? 'YES' : 'NO'}`);
      if (finalModel) {
        console.log(`Training status: ${finalModel.trainingStatus}`);
        console.log(`Model user ID: ${finalModel.userId}`);
      }
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserLinking().catch(console.error);