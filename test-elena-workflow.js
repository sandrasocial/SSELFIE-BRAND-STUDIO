#!/usr/bin/env node

/**
 * Test Elena Workflow Detection System
 * This script tests if Elena properly detects workflows and assigns tasks to agents like Aria
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testElenaWorkflowDetection() {
  console.log('🧪 Testing Elena Workflow Detection System...\n');

  try {
    // Test 1: Check Elena status
    console.log('1️⃣ Testing Elena status endpoint...');
    const statusResponse = await fetch(`${BASE_URL}/api/elena/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ Elena workflow detection system is operational');
      console.log(`   - Active workflows: ${statusData.elena.activeWorkflows}`);
      console.log(`   - Pattern types: ${statusData.elena.patterns.join(', ')}\n`);
    } else {
      console.log('❌ Elena status check failed\n');
      return;
    }

    // Test 2: Trigger a design workflow that should assign to Aria
    console.log('2️⃣ Testing design workflow detection (should assign to Aria)...');
    const designWorkflowResponse = await fetch(`${BASE_URL}/api/elena/trigger-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Create a beautiful design component for the luxury editorial layout',
        userId: '42585527'
      })
    });

    const designWorkflowData = await designWorkflowResponse.json();
    
    if (designWorkflowData.success) {
      console.log('✅ Design workflow successfully triggered');
      console.log(`   - Workflow ID: ${designWorkflowData.workflowId}`);
      console.log(`   - Elena status: ${designWorkflowData.elena_status}`);
      console.log('   - Expected: Aria should receive design task\n');
    } else {
      console.log('❌ Design workflow trigger failed');
      console.log(`   - Error: ${designWorkflowData.error}\n`);
    }

    // Test 3: Trigger a technical workflow that should assign to Zara
    console.log('3️⃣ Testing technical workflow detection (should assign to Zara)...');
    const techWorkflowResponse = await fetch(`${BASE_URL}/api/elena/trigger-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Fix the API performance issue and optimize database queries',
        userId: '42585527'
      })
    });

    const techWorkflowData = await techWorkflowResponse.json();
    
    if (techWorkflowData.success) {
      console.log('✅ Technical workflow successfully triggered');
      console.log(`   - Workflow ID: ${techWorkflowData.workflowId}`);
      console.log(`   - Elena status: ${techWorkflowData.elena_status}`);
      console.log('   - Expected: Zara should receive technical task\n');
    } else {
      console.log('❌ Technical workflow trigger failed');
      console.log(`   - Error: ${techWorkflowData.error}\n`);
    }

    // Test 4: Check Elena status after workflows
    console.log('4️⃣ Checking Elena status after workflow triggers...');
    const finalStatusResponse = await fetch(`${BASE_URL}/api/elena/status`);
    const finalStatusData = await finalStatusResponse.json();
    
    if (finalStatusData.success) {
      console.log('✅ Elena final status check');
      console.log(`   - Active workflows: ${finalStatusData.elena.activeWorkflows}`);
      console.log('   - Workflows should now be assigned to agents\n');
    }

    console.log('🎉 Elena Workflow Detection Test Complete!');
    console.log('   - Check your server logs to see task assignments to Aria and other agents');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your server is running on port 5000');
    console.log('   Run: npm run dev');
  }
}

// Run the test
testElenaWorkflowDetection();