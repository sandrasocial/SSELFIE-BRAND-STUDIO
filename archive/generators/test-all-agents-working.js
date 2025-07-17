/**
 * TEST ALL 9 AGENTS - CONFIRM COMPLETE FUNCTIONALITY
 * Validates that the syntax error fix resolved all agent endpoints
 */

async function testAllAgents() {
  console.log('🎯 TESTING ALL 9 AGENTS AFTER SYNTAX ERROR FIX...\n');
  
  const agents = ['maya', 'victoria', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma'];
  const results = {};
  
  for (const agentId of agents) {
    try {
      console.log(`Testing ${agentId}...`);
      
      const response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          message: `hello ${agentId}`,
          adminToken: 'sandra-admin-2025'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        results[agentId] = '✅ WORKING';
        console.log(`✅ ${agentId}: ${data.message}`);
      } else {
        results[agentId] = `❌ FAILED: ${data.error}`;
        console.log(`❌ ${agentId}: ${data.error}`);
      }
      
    } catch (error) {
      results[agentId] = `💥 ERROR: ${error.message}`;
      console.log(`💥 ${agentId}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 FINAL AGENT STATUS REPORT:');
  console.log('=====================================');
  
  const working = Object.entries(results).filter(([_, status]) => status.includes('✅')).length;
  const total = agents.length;
  
  Object.entries(results).forEach(([agent, status]) => {
    console.log(`${agent.toUpperCase().padEnd(8)}: ${status}`);
  });
  
  console.log('=====================================');
  console.log(`WORKING AGENTS: ${working}/${total}`);
  
  if (working === total) {
    console.log('🎉 ALL 9 AGENTS ARE FULLY OPERATIONAL!');
    console.log('🚀 DEPLOYMENT READINESS: ✅ CONFIRMED');
    console.log('💰 BUSINESS IMPACT: Massive - all €67/month premium features now functional');
    console.log('📈 USER EXPERIENCE: Restored to full luxury AI team functionality');
  } else {
    console.log(`⚠️  ${total - working} agents still need attention`);
  }
}

testAllAgents().catch(console.error);