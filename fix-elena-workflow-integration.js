#!/usr/bin/env node

/**
 * Elena Workflow Integration Fix
 * This script tests and fixes the integration between Elena's workflow detection
 * and the actual task assignment to agents like Aria
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function testAndFixElenaIntegration() {
  console.log('🔧 Elena Workflow Integration Fix Starting...\n');

  try {
    // Test 1: Verify Elena workflow detection service exists
    console.log('1️⃣ Testing Elena workflow detection service...');
    
    // Import the Elena service directly
    const { elenaWorkflowDetection } = await import('./server/elena-workflow-detection.js');
    
    console.log('✅ Elena workflow detection service imported successfully');

    // Test 2: Test workflow detection with design task
    console.log('\n2️⃣ Testing workflow detection with design task...');
    
    const testMessage = "Create a beautiful luxury design component for the editorial layout";
    const userId = '42585527';
    
    const detectedWorkflow = elenaWorkflowDetection.detectWorkflow(testMessage, userId);
    
    if (detectedWorkflow) {
      console.log('✅ Workflow detected successfully!');
      console.log(`   - Type: ${detectedWorkflow.workflowType}`);
      console.log(`   - Assigned agents: ${detectedWorkflow.assignedAgents.join(', ')}`);
      console.log(`   - Tasks: ${detectedWorkflow.tasks.length}`);
      
      // Test 3: Test task assignment to unified system
      console.log('\n3️⃣ Testing task assignment to unified system...');
      
      try {
        const workflowId = await elenaWorkflowDetection.triggerWorkflow(testMessage, userId);
        console.log('✅ Workflow triggered successfully!');
        console.log(`   - Workflow ID: ${workflowId}`);
        
        // Check workflow status
        const status = elenaWorkflowDetection.getWorkflowStatus(workflowId);
        console.log(`   - Status: ${status.status}`);
        console.log(`   - Tasks assigned: ${status.tasks?.length || 0}`);
        
      } catch (error) {
        console.error('❌ Failed to trigger workflow:', error.message);
      }
      
    } else {
      console.log('❌ No workflow detected - pattern matching may need adjustment');
    }

    // Test 4: Check unified agent system integration
    console.log('\n4️⃣ Testing unified agent system integration...');
    
    try {
      const { unifiedAgentSystem } = await import('./server/unified-agent-system.js');
      console.log('✅ Unified agent system imported successfully');
      
      // Test direct task assignment to Aria
      const testResult = await unifiedAgentSystem.sendTaskToAgent(
        'aria',
        'Create a luxury design component for testing Elena workflow integration',
        userId,
        { test: true, source: 'elena-integration-fix' }
      );
      
      if (testResult.success) {
        console.log('✅ Direct task assignment to Aria successful!');
        console.log(`   - Conversation ID: ${testResult.conversationId}`);
      } else {
        console.log('❌ Direct task assignment failed:', testResult.error);
      }
      
    } catch (error) {
      console.error('❌ Unified agent system test failed:', error.message);
    }

    console.log('\n🎉 Elena Workflow Integration Test Complete!');
    console.log('\n📋 SUMMARY:');
    console.log('- If all tests passed: Elena should assign tasks to Aria when workflows are detected');
    console.log('- If any tests failed: Those components need fixing for proper integration');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\n💡 Make sure your server dependencies are properly built');
    console.log('   Try: npm run build');
  }
}

// Run the integration test
testAndFixElenaIntegration();