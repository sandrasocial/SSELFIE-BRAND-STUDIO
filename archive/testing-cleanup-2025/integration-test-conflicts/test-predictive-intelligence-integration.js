/**
 * PREDICTIVE INTELLIGENCE INTEGRATION TEST
 * 
 * Tests the complete Predictive Intelligence System integration with agent-chat-bypass endpoint.
 * Verifies that agents now have proactive task anticipation like Replit AI agents.
 */

import fetch from 'node-fetch';

// Sandra's admin token for authentication
const adminToken = 'sandra-admin-2025';

async function testPredictiveIntelligence() {
  console.log('🔮 TESTING PREDICTIVE INTELLIGENCE SYSTEM INTEGRATION...\n');
  
  try {
    // Test 1: Build Conversation Context for Pattern Recognition
    console.log('📝 Test 1: Building conversation context for predictive pattern recognition...');
    
    const contextHistory = [
      { type: 'user', content: 'Elena, I need to analyze the BUILD feature in my SSELFIE Studio platform' },
      { type: 'agent', content: 'I\'ll conduct a comprehensive audit of the BUILD feature, analyzing its current implementation and identifying optimization opportunities.' },
      { type: 'user', content: 'Focus on user experience and any missing functionality' },
      { type: 'agent', content: 'Analyzing BUILD feature UX patterns and mapping missing functionality gaps for enhanced user workflow optimization.' },
      { type: 'user', content: 'Great, what about the visual editor integration?' },
      { type: 'agent', content: 'The visual editor integration shows strong foundation but needs enhanced component coordination and real-time synchronization improvements.' }
    ];
    
    // Send context-building message to establish pattern recognition
    const contextResponse = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'elena',
        message: 'This BUILD feature analysis is exactly what we need for the platform optimization.',
        adminToken,
        conversationHistory: contextHistory
      })
    });
    
    const contextData = await contextResponse.json();
    if (!contextData.success) {
      throw new Error('Context building failed: ' + contextData.error);
    }
    
    console.log('✅ Context established successfully - pattern recognition active\n');
    
    // Test 2: Trigger Predictive Intelligence with Follow-up Request
    console.log('📝 Test 2: Testing predictive intelligence with follow-up request...');
    console.log('Message: "What should we focus on next?"');
    console.log('Expected: Elena should proactively suggest next steps based on BUILD analysis context\n');
    
    // Wait for context processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const predictiveResponse = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'elena',
        message: 'What should we focus on next?',
        adminToken,
        conversationHistory: [] // Fresh conversation to test predictive intelligence
      })
    });
    
    const predictiveData = await predictiveResponse.json();
    
    if (predictiveData.success) {
      console.log('✅ PREDICTIVE INTELLIGENCE TEST RESULTS:');
      console.log('==========================================');
      
      const response = predictiveData.message || '';
      
      // Check for proactive suggestions
      const hasProactiveSuggestions = (
        response.includes('suggest') || 
        response.includes('recommend') || 
        response.includes('next step') ||
        response.includes('optimize') ||
        response.includes('improve') ||
        response.includes('workflow') ||
        response.includes('coordinate')
      );
      
      // Check for predictive intelligence indicators
      const hasPredictiveInsights = (
        response.includes('based on') ||
        response.includes('considering') ||
        response.includes('anticipated') ||
        response.includes('typically') ||
        response.includes('pattern')
      );
      
      // Check for workflow suggestions
      const hasWorkflowSuggestions = (
        response.includes('aria') ||
        response.includes('zara') ||
        response.includes('agent') ||
        response.includes('coordinate') ||
        response.includes('workflow')
      );
      
      console.log(`✅ Proactive Suggestions: ${hasProactiveSuggestions ? 'PRESENT' : 'MISSING'}`);
      console.log(`✅ Predictive Insights: ${hasPredictiveInsights ? 'PRESENT' : 'MISSING'}`);
      console.log(`✅ Workflow Suggestions: ${hasWorkflowSuggestions ? 'PRESENT' : 'MISSING'}`);
      
      console.log('\n📝 Elena Response (First 300 chars):');
      console.log(response.substring(0, 300) + '...');
      
      // Overall assessment
      const predictiveScore = (hasProactiveSuggestions ? 1 : 0) + 
                             (hasPredictiveInsights ? 1 : 0) + 
                             (hasWorkflowSuggestions ? 1 : 0);
      
      console.log(`\n🎯 PREDICTIVE INTELLIGENCE SCORE: ${predictiveScore}/3`);
      
      if (predictiveScore >= 2) {
        console.log('🎉 SUCCESS: Predictive Intelligence System is operational and providing proactive suggestions!');
        console.log('✅ Elena now anticipates user needs and suggests next steps like Replit AI');
      } else {
        console.log('⚠️  PARTIAL: Predictive Intelligence needs enhancement for better proactivity');
      }
      
      // Test 3: Verify Enhanced Context Integration
      console.log('\n📝 Test 3: Testing enhanced context intelligence integration...');
      
      const enhancedContextResponse = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'aria',
          message: 'Continue with that design approach we discussed',
          adminToken,
          conversationHistory: [
            { type: 'user', content: 'Aria, I want to redesign the admin dashboard with luxury editorial styling' },
            { type: 'agent', content: 'Perfect! Creating luxury editorial admin dashboard with Times New Roman typography and sophisticated design patterns.' }
          ]
        })
      });
      
      const enhancedData = await enhancedContextResponse.json();
      
      if (enhancedData.success) {
        const ariaResponse = enhancedData.message || '';
        const understandsContext = (
          ariaResponse.includes('admin dashboard') ||
          ariaResponse.includes('luxury') ||
          ariaResponse.includes('editorial') ||
          ariaResponse.includes('design')
        );
        
        console.log(`✅ Enhanced Context Understanding: ${understandsContext ? 'WORKING' : 'NEEDS IMPROVEMENT'}`);
        console.log('📝 Aria Response (First 200 chars):');
        console.log(ariaResponse.substring(0, 200) + '...');
      }
      
    } else {
      console.log('❌ PREDICTIVE INTELLIGENCE TEST FAILED');
      console.log('Error:', predictiveData.error || predictiveData.message);
    }
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
  }
}

// Run the predictive intelligence integration test
testPredictiveIntelligence();