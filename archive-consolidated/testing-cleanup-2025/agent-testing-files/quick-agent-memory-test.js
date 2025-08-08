#!/usr/bin/env node

/**
 * QUICK TEST ALL AGENTS MEMORY STATUS
 * Fast test to check memory restoration for all agents
 */

const adminToken = 'sandra-admin-2025';
const agents = ['maya', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma'];

async function quickTestAgentMemory(agentId) {
  try {
    console.log(`Testing ${agentId}...`);
    
    const response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        message: `Hi ${agentId}! Can you continue with the work we've been doing?`,
        adminToken,
        conversationHistory: [] // Fresh conversation to trigger memory check
      })
    });
    
    const data = await response.json();
    if (!data.success) {
      return { agent: agentId, working: false, error: data.error };
    }
    
    const responseText = data.response || '';
    
    // Quick memory indicators check
    const hasMemoryContext = responseText.toLowerCase().includes('continue') || 
                             responseText.toLowerCase().includes('working on') ||
                             responseText.toLowerCase().includes('we\'ve been') ||
                             responseText.includes('✅');
    
    const asksBasicQuestions = responseText.toLowerCase().includes('what would you like') || 
                              responseText.toLowerCase().includes('help me understand') ||
                              responseText.toLowerCase().includes('tell me more');
    
    return { 
      agent: agentId, 
      working: hasMemoryContext && !asksBasicQuestions,
      hasContext: hasMemoryContext,
      asksBasicQuestions,
      responseLength: responseText.length
    };
    
  } catch (error) {
    return { agent: agentId, working: false, error: error.message };
  }
}

async function runQuickTest() {
  console.log('🧠 QUICK MEMORY TEST FOR ALL 8 AGENTS\n');
  
  const results = [];
  
  // Test all agents in parallel for speed
  const promises = agents.map(agentId => quickTestAgentMemory(agentId));
  const testResults = await Promise.all(promises);
  
  console.log('\n📊 MEMORY TEST RESULTS:');
  console.log('=========================');
  
  testResults.forEach(result => {
    if (result.working) {
      console.log(`✅ ${result.agent.toUpperCase()}: Memory working (${result.responseLength} chars)`);
    } else if (result.error) {
      console.log(`❌ ${result.agent.toUpperCase()}: ERROR - ${result.error}`);
    } else {
      console.log(`⚠️  ${result.agent.toUpperCase()}: Memory issue - Context: ${result.hasContext ? 'YES' : 'NO'}, Basic questions: ${result.asksBasicQuestions ? 'YES' : 'NO'}`);
    }
  });
  
  const workingAgents = testResults.filter(r => r.working);
  const brokenAgents = testResults.filter(r => !r.working);
  
  console.log(`\n📈 SUMMARY: ${workingAgents.length}/8 agents have working memory`);
  
  if (brokenAgents.length > 0) {
    console.log('\n🔧 AGENTS NEEDING MEMORY FIX:');
    brokenAgents.forEach(agent => console.log(`- ${agent.agent.toUpperCase()}`));
  } else {
    console.log('\n🎉 ALL 8 AGENTS HAVE WORKING MEMORY!');
  }
}

runQuickTest();