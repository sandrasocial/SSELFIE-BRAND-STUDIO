/**
 * TEST CONTEXT INTELLIGENCE SYSTEM INTEGRATION
 * Verifies that agents now have Replit AI-level contextual understanding
 */

const adminToken = 'sandra-admin-2025';

async function testContextIntelligence() {
  console.log('🧠 TESTING CONTEXT INTELLIGENCE SYSTEM INTEGRATION...\n');
  
  try {
    // Phase 1: Build conversation context about admin dashboard redesign
    console.log('📝 Phase 1: Building rich conversation context...');
    
    const contextHistory = [
      { type: 'user', content: 'Victoria, I want to redesign the admin dashboard with luxury editorial styling' },
      { type: 'agent', content: 'Perfect! I\'ll create a luxury editorial admin dashboard with Times New Roman typography and elegant minimalist design.' },
      { type: 'user', content: 'Make sure it has proper navigation and uses our dark moody aesthetic' },
      { type: 'agent', content: 'Absolutely! I\'m implementing dark moody minimalism with sophisticated navigation following Sandra\'s luxury brand guidelines.' },
      { type: 'user', content: 'Add metrics cards and make it look like a high-end magazine layout' },
      { type: 'agent', content: 'Creating magazine-style metrics cards with editorial sophistication. This will be stunning!' }
    ];
    
    // Send initial context-building message
    const phase1Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Great work Victoria! I love the luxury editorial direction we\'re taking.',
        adminToken,
        conversationHistory: contextHistory
      })
    });
    
    const phase1Data = await phase1Response.json();
    if (!phase1Data.success) {
      throw new Error('Phase 1 failed: ' + phase1Data.error);
    }
    
    console.log('✅ Phase 1: Context established successfully\n');
    
    // Phase 2: Test contextual understanding with vague reference
    console.log('📝 Phase 2: Testing contextual understanding with vague message...');
    console.log('Message: "Continue with that design approach"');
    console.log('Expected: Victoria should understand this refers to luxury editorial admin dashboard\n');
    
    // Wait a moment for context processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const phase2Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Continue with that design approach',
        adminToken,
        conversationHistory: [] // Fresh conversation - should use context intelligence
      })
    });
    
    const phase2Data = await phase2Response.json();
    
    if (phase2Data.success) {
      console.log('✅ CONTEXT INTELLIGENCE TEST RESULTS:');
      console.log('====================================');
      
      const response = phase2Data.message || '';
      
      // Check for contextual understanding
      const hasContextualUnderstanding = (
        response.includes('admin dashboard') ||
        response.includes('luxury editorial') ||
        response.includes('Times New Roman') ||
        response.includes('dark moody') ||
        response.includes('magazine') ||
        response.includes('metrics cards') ||
        response.includes('editorial styling') ||
        response.includes('luxury design')
      );
      
      if (hasContextualUnderstanding) {
        console.log('✅ CONTEXT INTELLIGENCE WORKING: Victoria understood vague reference!');
        console.log('✅ Agent demonstrated Replit AI-level contextual awareness');
        console.log('✅ Context Intelligence System successfully integrated');
        
        // Show specific context understanding
        const contextClues = [];
        if (response.includes('admin dashboard')) contextClues.push('Admin Dashboard');
        if (response.includes('luxury editorial')) contextClues.push('Luxury Editorial');
        if (response.includes('Times New Roman')) contextClues.push('Times New Roman Typography');
        if (response.includes('dark moody')) contextClues.push('Dark Moody Aesthetic');
        if (response.includes('magazine')) contextClues.push('Magazine Layout');
        
        console.log(`✅ Context clues detected: ${contextClues.join(', ')}`);
        
      } else {
        console.log('❌ CONTEXT INTELLIGENCE FAILED: Victoria did not understand context');
        console.log('❌ Response lacks reference to previous conversation about admin dashboard');
      }
      
      console.log('\n📝 Victoria Response (First 300 chars):');
      console.log(response.substring(0, 300) + '...');
      
      // Phase 3: Test with Elena for workflow coordination context
      console.log('\n📝 Phase 3: Testing Elena workflow coordination context...');
      
      const phase3Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'elena',
          message: 'Help me coordinate the team for that project',
          adminToken,
          conversationHistory: []
        })
      });
      
      const phase3Data = await phase3Response.json();
      
      if (phase3Data.success) {
        const elenaResponse = phase3Data.message || '';
        const elenaHasContext = (
          elenaResponse.includes('admin dashboard') ||
          elenaResponse.includes('Victoria') ||
          elenaResponse.includes('design') ||
          elenaResponse.includes('luxury') ||
          elenaResponse.includes('editorial')
        );
        
        if (elenaHasContext) {
          console.log('✅ ELENA CONTEXT INTELLIGENCE: Successfully understood project reference');
        } else {
          console.log('⚠️ ELENA CONTEXT: May need additional context building');
        }
        
        console.log('\n📝 Elena Response (First 200 chars):');
        console.log(elenaResponse.substring(0, 200) + '...');
      }
      
    } else {
      console.log('❌ Phase 2 failed:', phase2Data.error);
    }
    
  } catch (error) {
    console.error('❌ Context Intelligence test failed:', error.message);
  }
}

// Run the test
testContextIntelligence().then(() => {
  console.log('\n🏁 Context Intelligence integration test completed!');
}).catch(error => {
  console.error('❌ Test execution failed:', error.message);
});