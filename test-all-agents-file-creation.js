#!/usr/bin/env node

console.log('🧪 TESTING ALL 9 AGENTS FILE CREATION CAPABILITIES...\n');

const agents = [
  'maya', 'victoria', 'rachel', 'ava', 'quinn', 
  'sophia', 'martha', 'diana', 'wilma'
];

async function testAgentFileCreation(agentId) {
  try {
    console.log(`📝 Testing ${agentId.toUpperCase()}...`);
    
    const testMessage = `create a test file ${agentId}TestComponent.tsx with a React component`;
    
    const response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId,
        message: testMessage,
        adminToken: 'sandra-admin-2025'
      })
    });

    const result = await response.json();
    
    if (result.fileCreated) {
      console.log(`✅ ${agentId.toUpperCase()}: File creation successful`);
      return { agentId, success: true, filePath: result.filePath };
    } else {
      console.log(`❌ ${agentId.toUpperCase()}: File creation failed - ${result.message}`);
      return { agentId, success: false, error: result.message };
    }
    
  } catch (error) {
    console.log(`❌ ${agentId.toUpperCase()}: Error - ${error.message}`);
    return { agentId, success: false, error: error.message };
  }
}

async function testAllAgents() {
  const results = [];
  
  for (const agentId of agents) {
    const result = await testAgentFileCreation(agentId);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 FINAL RESULTS:');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${agents.length}`);
  successful.forEach(r => console.log(`   • ${r.agentId}: ${r.filePath}`));
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${agents.length}`);
    failed.forEach(r => console.log(`   • ${r.agentId}: ${r.error}`));
  }
  
  // Clean up test files
  console.log('\n🧹 Cleaning up test files...');
  const fs = await import('fs');
  for (const result of successful) {
    try {
      if (result.filePath && fs.existsSync(result.filePath)) {
        fs.unlinkSync(result.filePath);
        console.log(`   Removed: ${result.filePath}`);
      }
    } catch (err) {
      console.log(`   Failed to remove: ${result.filePath}`);
    }
  }
  
  console.log(`\n🎯 AGENT FILE CREATION TEST COMPLETE: ${successful.length}/${agents.length} agents working`);
  return results;
}

testAllAgents().catch(console.error);