/**
 * MEMORY RESTORATION DEBUG TEST - January 24, 2025
 * Complete testing of agent memory storage and retrieval system
 */

import fetch from 'node-fetch';
const TEST_URL = 'http://localhost:5000';

async function testMemorySystem() {
  console.log('🧪 MEMORY RESTORATION DEBUG TEST');
  console.log('==================================');
  
  const testResults = {
    memoryStorage: false,
    memoryRetrieval: false,
    elenaMemory: false,
    contextRestoration: false,
    conversationContinuity: false
  };

  try {
    // Test 1: Create a conversation that should generate memory
    console.log('\n📝 TEST 1: Creating conversation for memory storage...');
    
    const memoryCreateResponse = await fetch(`${TEST_URL}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminToken: 'sandra-admin-2025',
        agentId: 'elena',
        message: 'Elena, I need you to create workflow for admin dashboard redesign with Aria handling design, Zara handling development, and Quinn handling testing. This is a comprehensive project.',
        conversationHistory: [
          { role: 'user', content: 'Start comprehensive admin dashboard audit' },
          { role: 'assistant', content: 'I will analyze the current admin dashboard and identify areas for improvement with luxury design standards.' },
          { role: 'user', content: 'Create workflow for complete redesign' },
        ]
      })
    });

    if (memoryCreateResponse.ok) {
      const result = await memoryCreateResponse.json();
      console.log('✅ Memory creation conversation successful');
      console.log('📄 Response preview:', result.message?.substring(0, 150) + '...');
      testResults.memoryStorage = true;
    } else {
      console.log('❌ Memory creation conversation failed:', memoryCreateResponse.status);
    }

    // Wait for memory to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Test Elena's memory retrieval in new conversation
    console.log('\n🧠 TEST 2: Testing Elena memory retrieval...');
    
    const elenaMemoryResponse = await fetch(`${TEST_URL}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminToken: 'sandra-admin-2025',
        agentId: 'elena',
        message: 'Elena, do you remember our previous workflow discussion about the admin dashboard?',
        conversationHistory: [] // Empty to test memory restoration
      })
    });

    if (elenaMemoryResponse.ok) {
      const result = await elenaMemoryResponse.json();
      console.log('✅ Elena memory test response received');
      
      // Check if response contains memory restoration indicators
      const responseText = result.message || result.response || '';
      const hasMemoryRestoration = responseText.includes('ELENA CONVERSATION MEMORY RESTORED') || 
                                 responseText.includes('ELENA CONTEXT AWARENESS') ||
                                 responseText.includes('dashboard') ||
                                 responseText.includes('workflow');
      
      if (hasMemoryRestoration) {
        console.log('✅ Elena memory restoration detected in response');
        testResults.elenaMemory = true;
        testResults.contextRestoration = true;
      } else {
        console.log('❌ No memory restoration detected in Elena response');
        console.log('📄 Response content:', responseText.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ Elena memory test failed:', elenaMemoryResponse.status);
    }

    // Test 3: Test other agents memory system
    console.log('\n👥 TEST 3: Testing other agents memory system...');
    
    // Create memory for Aria
    const ariaSetup = await fetch(`${TEST_URL}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminToken: 'sandra-admin-2025',
        agentId: 'aria',
        message: 'Aria, I need you to design a luxury admin dashboard with Times New Roman typography, full-bleed hero images, and editorial magazine styling. Focus on black and white design system.',
        conversationHistory: [
          { role: 'user', content: 'Create luxury admin interface' },
          { role: 'assistant', content: 'I will create a luxury editorial design for the admin dashboard with sophisticated typography and clean visual hierarchy.' }
        ]
      })
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Test Aria memory retrieval
    const ariaMemoryTest = await fetch(`${TEST_URL}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminToken: 'sandra-admin-2025',
        agentId: 'aria',
        message: 'Aria, do you remember the admin dashboard design we discussed?',
        conversationHistory: []
      })
    });

    if (ariaMemoryTest.ok) {
      const result = await ariaMemoryTest.json();
      const responseText = result.message || result.response || '';
      const hasMemoryRestoration = responseText.includes('CONVERSATION MEMORY RESTORED') ||
                                 responseText.includes('admin dashboard') ||
                                 responseText.includes('luxury') ||
                                 responseText.includes('editorial');
      
      if (hasMemoryRestoration) {
        console.log('✅ Aria memory restoration working');
        testResults.memoryRetrieval = true;
      } else {
        console.log('❌ Aria memory restoration not detected');
        console.log('📄 Aria response:', responseText.substring(0, 200) + '...');
      }
    }

    // Test 4: Direct database check for memory entries
    console.log('\n💾 TEST 4: Checking database for memory entries...');
    
    const dbCheckResponse = await fetch(`${TEST_URL}/api/agent-conversations/elena`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sandra-admin-2025'
      }
    });

    if (dbCheckResponse.ok) {
      const conversations = await dbCheckResponse.json();
      console.log(`📊 Found ${conversations.conversations?.length || 0} Elena conversations in database`);
      
      const memoryEntries = conversations.conversations?.filter(conv => 
        conv.userMessage?.includes('**CONVERSATION_MEMORY**')
      ) || [];
      
      console.log(`🧠 Found ${memoryEntries.length} memory entries for Elena`);
      
      if (memoryEntries.length > 0) {
        console.log('✅ Memory entries exist in database');
        console.log('📝 Latest memory entry:', memoryEntries[0]?.agentResponse?.substring(0, 150) + '...');
        testResults.conversationContinuity = true;
      } else {
        console.log('❌ No memory entries found in database');
      }
    } else {
      console.log('❌ Database check failed:', dbCheckResponse.status);
    }

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }

  // Test Results Summary
  console.log('\n📊 MEMORY SYSTEM TEST RESULTS');
  console.log('==============================');
  
  Object.entries(testResults).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalPassed = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 OVERALL RESULT: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 MEMORY SYSTEM IS FULLY OPERATIONAL!');
  } else {
    console.log('⚠️  MEMORY SYSTEM NEEDS FIXES');
    
    if (!testResults.memoryStorage) {
      console.log('🔧 Fix needed: Memory storage during conversations');
    }
    if (!testResults.memoryRetrieval) {
      console.log('🔧 Fix needed: General agent memory retrieval');
    }
    if (!testResults.elenaMemory) {
      console.log('🔧 Fix needed: Elena-specific memory restoration');
    }
    if (!testResults.contextRestoration) {
      console.log('🔧 Fix needed: Context restoration in responses');
    }
    if (!testResults.conversationContinuity) {
      console.log('🔧 Fix needed: Database memory persistence');
    }
  }
}

// Run the test
testMemorySystem().catch(console.error);