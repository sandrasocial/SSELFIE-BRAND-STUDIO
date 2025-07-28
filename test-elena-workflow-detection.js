#!/usr/bin/env node

/**
 * Elena Workflow Detection Test
 * Tests if Elena properly detects workflows and assigns tasks to Aria
 */

async function testElenaWorkflowDetection() {
  console.log('🧪 Testing Elena Workflow Detection System...\n');

  // Test workflow detection with design request that should assign to Aria
  const testWorkflowContent = "Create a beautiful design component for the luxury editorial layout";
  
  console.log('📝 Test Input:', testWorkflowContent);
  console.log('🎯 Expected: Should detect design workflow and assign to Aria\n');

  try {
    // Test the Elena workflow detection API endpoint
    const response = await fetch('http://localhost:5000/api/elena/trigger-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: testWorkflowContent,
        userId: '42585527'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Elena Workflow Detection WORKING');
      console.log(`   - Workflow ID: ${result.workflowId}`);
      console.log(`   - Elena Status: ${result.elena_status}`);
      console.log('\n🔍 Checking if Aria received structured task...\n');
      
      // Check Elena status to see active workflows
      const statusResponse = await fetch('http://localhost:5000/api/elena/status');
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        console.log('✅ Elena Status Check:');
        console.log(`   - Active workflows: ${statusData.elena.activeWorkflows}`);
        console.log(`   - Pattern types: ${statusData.elena.patterns.join(', ')}`);
        
        if (statusData.elena.activeWorkflows > 0) {
          console.log('\n🎉 SUCCESS: Elena detected workflow and should have assigned task to Aria');
          console.log('   - Check server logs to verify Aria received structured task');
        } else {
          console.log('\n❌ ISSUE: No active workflows detected');
        }
      }
      
    } else {
      console.log('❌ Elena Workflow Detection FAILED');
      console.log(`   - Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure your server is running on port 5000');
    console.log('   Run: npm run dev');
  }
}

// Run the test
testElenaWorkflowDetection();