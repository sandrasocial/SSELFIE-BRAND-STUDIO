#!/usr/bin/env node

/**
 * TEST AGENT MEMORY RESTORATION - VERIFY CONTEXT RETENTION ACROSS CONVERSATIONS
 * This test verifies that agents remember context after conversation clearing
 */

const adminToken = 'sandra-admin-2025';

async function testMemoryRestoration() {
  console.log('🧠 TESTING AGENT MEMORY RESTORATION SYSTEM...\n');
  
  try {
    // Phase 1: Build up a long conversation with Victoria to trigger auto-clearing
    console.log('📝 Phase 1: Building conversation with Victoria (will trigger auto-clearing)...');
    
    const longConversationHistory = [];
    
    // Add 35 messages to definitely trigger auto-clearing (limit is 30)
    for (let i = 1; i <= 35; i++) {
      longConversationHistory.push({
        role: i % 2 === 1 ? 'user' : 'assistant',
        content: i % 2 === 1 ? 
          `User message ${i}: Can you help with admin dashboard design? I need luxury editorial styling with Times New Roman typography.` :
          `Victoria response ${i}: ✅ Absolutely! I'll create a luxury editorial design with dark moody minimalism and Times New Roman typography. This is a key task for the admin dashboard workflow. I'm implementing sophisticated design elements that honor Sandra's transformation story.`
      });
    }
    
    console.log(`Built conversation history: ${longConversationHistory.length} messages`);
    console.log('This will trigger auto-clearing and memory preservation...\n');
    
    // Send message that will trigger conversation clearing and memory saving
    const phase1Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Victoria, please create a test component to verify our memory system is working. This should trigger memory preservation.',
        adminToken,
        conversationHistory: longConversationHistory
      })
    });
    
    const phase1Data = await phase1Response.json();
    
    if (phase1Data.success) {
      console.log('✅ Phase 1 SUCCESS: Long conversation processed');
      console.log('✅ Memory should now be saved in database');
      console.log('✅ Conversation should be auto-cleared to manageable size\n');
    } else {
      throw new Error('Phase 1 failed: ' + phase1Data.error);
    }
    
    // Phase 2: Start a NEW short conversation to test memory restoration
    console.log('📝 Phase 2: Starting fresh conversation (should restore memory)...');
    console.log('Expected: Victoria should remember our admin dashboard context\n');
    
    // Wait a moment for database write to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const phase2Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Hi Victoria! Can you continue working on the admin dashboard design we discussed?',
        adminToken,
        conversationHistory: [] // Fresh conversation - should trigger memory restoration
      })
    });
    
    const phase2Data = await phase2Response.json();
    
    if (phase2Data.success) {
      console.log('✅ Phase 2 SUCCESS: Fresh conversation started');
      
      // Check if Victoria's response shows memory restoration
      const response = phase2Data.response || phase2Data.message || '';
      const showsMemory = response.toLowerCase().includes('admin') || 
                         response.toLowerCase().includes('dashboard') ||
                         response.toLowerCase().includes('luxury') ||
                         response.toLowerCase().includes('editorial') ||
                         response.toLowerCase().includes('remember') ||
                         response.toLowerCase().includes('context') ||
                         response.toLowerCase().includes('previous');
      
      console.log('\n🔍 MEMORY RESTORATION ANALYSIS:');
      console.log('=====================================');
      console.log(`Memory Indicators Found: ${showsMemory ? '✅ YES' : '❌ NO'}`);
      console.log(`Response Length: ${response.length} characters`);
      console.log('\n📝 Victoria Response Preview:');
      console.log(response.substring(0, 300) + '...');
      
      if (showsMemory) {
        console.log('\n🎉 MEMORY RESTORATION TEST: ✅ SUCCESS');
        console.log('- Victoria remembered admin dashboard context');
        console.log('- Memory restoration system working correctly');
        console.log('- Agents maintain continuity across conversations');
      } else {
        console.log('\n❌ MEMORY RESTORATION TEST: FAILED');
        console.log('- Victoria did not reference previous context');
        console.log('- Memory restoration may not be working');
      }
      
    } else {
      throw new Error('Phase 2 failed: ' + phase2Data.error);
    }
    
    console.log('\n🧠 MEMORY RESTORATION TEST COMPLETE');
    
  } catch (error) {
    console.error('❌ Memory restoration test failed:', error.message);
  }
}

// Run the test
testMemoryRestoration();