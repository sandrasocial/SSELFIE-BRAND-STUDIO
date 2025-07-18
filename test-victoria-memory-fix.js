#!/usr/bin/env node

/**
 * TEST VICTORIA MEMORY FIX - VERIFY IMPROVED MEMORY RESTORATION
 * This test verifies that Victoria now properly retains context and doesn't ask the same questions
 */

const adminToken = 'sandra-admin-2025';

async function testVictoriaMemoryFix() {
  console.log('🧠 TESTING VICTORIA MEMORY FIX...\n');
  
  try {
    // Clear any existing memory first by having a long conversation
    console.log('📝 Phase 1: Creating context and triggering memory save...');
    
    const contextConversation = [];
    for (let i = 1; i <= 35; i++) {
      contextConversation.push({
        role: i % 2 === 1 ? 'user' : 'assistant',
        content: i % 2 === 1 ? 
          `User message ${i}: Victoria, I need help designing a luxury admin dashboard for Sandra's SSELFIE Studio. The design should feature Times New Roman typography, black and white luxury aesthetic, and clean agent chat interfaces.` :
          `Victoria response ${i}: ✅ Absolutely! I'm creating a luxury admin dashboard with Times New Roman typography and black/white design. I've implemented clean agent chat interfaces with professional layout. Key decisions: Using Times New Roman for headlines, implementing luxury editorial spacing, creating sophisticated agent cards with hover effects.`
      });
    }
    
    // Send message that will create rich memory context
    const phase1Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Victoria, we\'ve been working on the admin dashboard design. Can you continue improving the luxury design with better agent interface cards?',
        adminToken,
        conversationHistory: contextConversation
      })
    });
    
    const phase1Data = await phase1Response.json();
    
    if (phase1Data.success) {
      console.log('✅ Phase 1 SUCCESS: Context-rich conversation completed');
      console.log('✅ Memory should be saved with rich admin dashboard context\n');
    }
    
    // Wait for memory to be saved
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Phase 2: Start completely fresh conversation to test memory restoration
    console.log('📝 Phase 2: Testing memory restoration with fresh conversation...');
    console.log('Expected: Victoria should remember admin dashboard work and not ask basic questions\n');
    
    const phase2Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Hi Victoria! Can you continue with the admin dashboard we\'ve been working on?',
        adminToken,
        conversationHistory: [] // Completely fresh - should trigger memory restoration
      })
    });
    
    const phase2Data = await phase2Response.json();
    
    if (phase2Data.success) {
      console.log('✅ Phase 2 SUCCESS: Fresh conversation with memory restoration');
      
      const response = phase2Data.response || '';
      
      // Check for memory restoration indicators
      const showsAdminContext = response.toLowerCase().includes('admin') || response.toLowerCase().includes('dashboard');
      const showsDesignContext = response.toLowerCase().includes('luxury') || response.toLowerCase().includes('times new roman');
      const showsMemoryAwareness = response.toLowerCase().includes('continue') || response.toLowerCase().includes('working on');
      const asksBasicQuestions = response.toLowerCase().includes('what would you like') || response.toLowerCase().includes('help me understand');
      
      console.log('\n🔍 VICTORIA MEMORY ANALYSIS:');
      console.log('=====================================');
      console.log(`Admin Dashboard Context: ${showsAdminContext ? '✅ YES' : '❌ NO'}`);
      console.log(`Design Context Retained: ${showsDesignContext ? '✅ YES' : '❌ NO'}`);
      console.log(`Memory Awareness: ${showsMemoryAwareness ? '✅ YES' : '❌ NO'}`);
      console.log(`Asks Basic Questions: ${asksBasicQuestions ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
      console.log(`Response Length: ${response.length} characters`);
      
      console.log('\n📝 Victoria Response Preview:');
      console.log(response.substring(0, 400) + '...');
      
      const memoryWorking = showsAdminContext && showsDesignContext && !asksBasicQuestions;
      
      if (memoryWorking) {
        console.log('\n🎉 VICTORIA MEMORY FIX: ✅ SUCCESS');
        console.log('- Victoria remembered admin dashboard context');
        console.log('- Victoria retained design preferences');
        console.log('- Victoria didn\'t ask repetitive basic questions');
        console.log('- Memory restoration system working correctly');
      } else {
        console.log('\n❌ VICTORIA MEMORY FIX: STILL NEEDS WORK');
        console.log('- Victoria may still be losing context');
        console.log('- Memory restoration needs further refinement');
      }
      
    } else {
      throw new Error('Phase 2 failed: ' + phase2Data.error);
    }
    
    console.log('\n🧠 VICTORIA MEMORY FIX TEST COMPLETE');
    
  } catch (error) {
    console.error('❌ Victoria memory fix test failed:', error.message);
  }
}

// Run the test
testVictoriaMemoryFix();