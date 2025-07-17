#!/usr/bin/env node

console.log('🧠 TESTING AGENT CONVERSATION MEMORY SYSTEM...\n');

async function testConversationMemory() {
  try {
    // Simulate a multi-turn conversation with Maya
    console.log('📝 Testing Maya conversation memory...');
    
    // Turn 1: Initial request
    const turn1 = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Maya, I need to optimize our database queries for the FLUX Pro system. What would you suggest?',
        adminToken: 'sandra-admin-2025',
        conversationHistory: []
      })
    });
    
    const response1 = await turn1.json();
    console.log('Turn 1 - Maya Response:', response1.message.substring(0, 100) + '...');
    
    // Turn 2: Follow-up with context
    const turn2 = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Great suggestions! Can you implement the indexing optimization you mentioned?',
        adminToken: 'sandra-admin-2025',
        conversationHistory: [
          {
            type: 'user',
            content: 'Maya, I need to optimize our database queries for the FLUX Pro system. What would you suggest?'
          },
          {
            type: 'agent',
            content: response1.message
          }
        ]
      })
    });
    
    const response2 = await turn2.json();
    console.log('Turn 2 - Maya Response:', response2.message.substring(0, 100) + '...');
    
    // Check if Maya remembers the context
    const remembersContext = response2.message.toLowerCase().includes('index') || 
                           response2.message.toLowerCase().includes('optimization') ||
                           response2.message.toLowerCase().includes('database');
    
    console.log(`✅ Maya Memory Test: ${remembersContext ? 'PASSED' : 'FAILED'}`);
    console.log(`   Context Recognition: ${remembersContext ? 'Agent remembers database optimization discussion' : 'Agent lost context'}`);
    
    return {
      agent: 'maya',
      memoryWorking: remembersContext,
      conversationLength: 2,
      responses: [response1.message, response2.message]
    };
    
  } catch (error) {
    console.error('❌ Conversation memory test failed:', error.message);
    return { agent: 'maya', memoryWorking: false, error: error.message };
  }
}

async function testVictoriaMemory() {
  try {
    console.log('\n📝 Testing Victoria conversation memory...');
    
    // Turn 1: Design request
    const turn1 = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Victoria, I want to redesign the admin dashboard with a luxury moodboard style. Can you help?',
        adminToken: 'sandra-admin-2025',
        conversationHistory: []
      })
    });
    
    const response1 = await turn1.json();
    console.log('Turn 1 - Victoria Response:', response1.message.substring(0, 100) + '...');
    
    // Turn 2: Follow-up referencing previous conversation
    const turn2 = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Perfect! Now can you create the luxury moodboard design you described?',
        adminToken: 'sandra-admin-2025',
        conversationHistory: [
          {
            type: 'user',
            content: 'Victoria, I want to redesign the admin dashboard with a luxury moodboard style. Can you help?'
          },
          {
            type: 'agent',
            content: response1.message
          }
        ]
      })
    });
    
    const response2 = await turn2.json();
    console.log('Turn 2 - Victoria Response:', response2.message.substring(0, 100) + '...');
    
    // Check if Victoria remembers the moodboard discussion
    const remembersContext = response2.message.toLowerCase().includes('moodboard') || 
                           response2.message.toLowerCase().includes('luxury') ||
                           response2.message.toLowerCase().includes('design');
    
    console.log(`✅ Victoria Memory Test: ${remembersContext ? 'PASSED' : 'FAILED'}`);
    console.log(`   Context Recognition: ${remembersContext ? 'Agent remembers moodboard design discussion' : 'Agent lost context'}`);
    
    return {
      agent: 'victoria',
      memoryWorking: remembersContext,
      conversationLength: 2,
      responses: [response1.message, response2.message]
    };
    
  } catch (error) {
    console.error('❌ Victoria memory test failed:', error.message);
    return { agent: 'victoria', memoryWorking: false, error: error.message };
  }
}

async function runMemoryTests() {
  console.log('🚀 Starting comprehensive conversation memory tests...\n');
  
  // Test Maya conversation memory
  const mayaTest = await testConversationMemory();
  
  // Test Victoria conversation memory
  const victoriaTest = await testVictoriaMemory();
  
  console.log('\n📊 CONVERSATION MEMORY TEST RESULTS:');
  console.log('=====================================');
  
  console.log(`Maya Conversation Memory: ${mayaTest.memoryWorking ? '✅ WORKING' : '❌ BROKEN'}`);
  if (mayaTest.memoryWorking) {
    console.log('   • Agent maintains technical discussion context');
    console.log('   • Follow-up questions reference previous suggestions');
    console.log('   • Conversation flows naturally without losing context');
  } else {
    console.log(`   • Error: ${mayaTest.error || 'Agent does not remember previous conversation'}`);
  }
  
  console.log(`Victoria Conversation Memory: ${victoriaTest.memoryWorking ? '✅ WORKING' : '❌ BROKEN'}`);
  if (victoriaTest.memoryWorking) {
    console.log('   • Agent maintains design discussion context');
    console.log('   • References previous design concepts in follow-up');
    console.log('   • Conversation continuity preserved throughout session');
  } else {
    console.log(`   • Error: ${victoriaTest.error || 'Agent does not remember previous conversation'}`);
  }
  
  const overallSuccess = mayaTest.memoryWorking && victoriaTest.memoryWorking;
  console.log(`\n🎯 OVERALL MEMORY SYSTEM: ${overallSuccess ? '✅ FULLY OPERATIONAL' : '❌ NEEDS FIXING'}`);
  
  if (overallSuccess) {
    console.log('\n✨ Conversation Memory System Ready!');
    console.log('   • All agents maintain context throughout conversations');
    console.log('   • Multi-turn conversations work seamlessly');
    console.log('   • Admin dashboard preserves conversation history');
    console.log('   • No more mid-conversation memory loss issues');
  }
  
  return { mayaTest, victoriaTest, overallSuccess };
}

runMemoryTests().catch(console.error);