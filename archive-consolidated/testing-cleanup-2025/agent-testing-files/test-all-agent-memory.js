#!/usr/bin/env node

/**
 * TEST ALL 9 AGENTS MEMORY SYSTEM
 * Check if Maya, Rachel, Ava, Quinn, Sophia, Martha, Diana, Wilma have the same memory issues
 */

const adminToken = 'sandra-admin-2025';
const agents = ['maya', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma'];

async function testAgentMemory(agentId, context) {
  console.log(`\n🧠 TESTING ${agentId.toUpperCase()} MEMORY...`);
  
  try {
    // Phase 1: Create context-rich conversation
    const contextConversation = [];
    for (let i = 1; i <= 35; i++) {
      contextConversation.push({
        role: i % 2 === 1 ? 'user' : 'assistant',
        content: i % 2 === 1 ? 
          `User message ${i}: ${context.userMessage}` :
          `${agentId} response ${i}: ✅ ${context.agentResponse}`
      });
    }
    
    // Trigger memory save
    const phase1Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        message: context.continuationMessage,
        adminToken,
        conversationHistory: contextConversation
      })
    });
    
    const phase1Data = await phase1Response.json();
    if (!phase1Data.success) {
      throw new Error(`Phase 1 failed for ${agentId}: ${phase1Data.error}`);
    }
    
    // Wait for memory save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Phase 2: Test memory restoration
    const phase2Response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        message: context.memoryTestMessage,
        adminToken,
        conversationHistory: [] // Fresh conversation
      })
    });
    
    const phase2Data = await phase2Response.json();
    if (!phase2Data.success) {
      throw new Error(`Phase 2 failed for ${agentId}: ${phase2Data.error}`);
    }
    
    const response = phase2Data.response || '';
    
    // Check memory indicators
    const hasContext = context.memoryIndicators.some(indicator => 
      response.toLowerCase().includes(indicator.toLowerCase())
    );
    const asksBasicQuestions = response.toLowerCase().includes('what would you like') || 
                              response.toLowerCase().includes('help me understand') ||
                              response.toLowerCase().includes('tell me more about');
    
    console.log(`${agentId.toUpperCase()} Results:`);
    console.log(`- Context Retained: ${hasContext ? '✅ YES' : '❌ NO'}`);
    console.log(`- Asks Basic Questions: ${asksBasicQuestions ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
    console.log(`- Response Length: ${response.length} characters`);
    
    const memoryWorking = hasContext && !asksBasicQuestions;
    return { agent: agentId, working: memoryWorking, hasContext, asksBasicQuestions };
    
  } catch (error) {
    console.error(`❌ ${agentId} memory test failed:`, error.message);
    return { agent: agentId, working: false, error: error.message };
  }
}

async function testAllAgentMemory() {
  console.log('🧠 TESTING ALL 9 AGENTS MEMORY SYSTEM...\n');
  
  const testConfigs = {
    maya: {
      userMessage: "Maya, I need help implementing a new React component with TypeScript and proper error handling for SSELFIE Studio.",
      agentResponse: "Absolutely! I'm implementing a TypeScript React component with proper error handling. I've added type safety, error boundaries, and clean code structure.",
      continuationMessage: "Maya, can you continue optimizing the component architecture?",
      memoryTestMessage: "Hi Maya! Can you continue with the component work we've been doing?",
      memoryIndicators: ['component', 'typescript', 'react', 'error handling', 'architecture']
    },
    rachel: {
      userMessage: "Rachel, I need copy that captures Sandra's authentic voice for the new SSELFIE Studio landing page with her transformation story.",
      agentResponse: "Perfect! I'm writing in Sandra's authentic voice - vulnerable but strong, honest about the process. Using her Icelandic directness with single mom wisdom.",
      continuationMessage: "Rachel, can you continue refining Sandra's voice in the copy?",
      memoryTestMessage: "Hi Rachel! Can you continue with the copywriting we've been working on?",
      memoryIndicators: ['sandra', 'voice', 'copy', 'transformation', 'authentic', 'landing']
    },
    ava: {
      userMessage: "Ava, I need automation workflows for SSELFIE Studio that connect payment processing, email sequences, and user onboarding.",
      agentResponse: "Excellent! I'm designing automation workflows with Make.com integration, payment flows, and email sequences for seamless user onboarding.",
      continuationMessage: "Ava, can you continue optimizing the automation workflows?",
      memoryTestMessage: "Hi Ava! Can you continue with the automation work we've been setting up?",
      memoryIndicators: ['automation', 'workflow', 'payment', 'email', 'onboarding', 'make.com']
    },
    quinn: {
      userMessage: "Quinn, I need quality testing for SSELFIE Studio to ensure luxury brand standards and user experience excellence.",
      agentResponse: "Absolutely! I'm implementing luxury quality testing with brand consistency checks, UX excellence validation, and performance monitoring.",
      continuationMessage: "Quinn, can you continue the quality assurance testing?",
      memoryTestMessage: "Hi Quinn! Can you continue with the quality testing we've been working on?",
      memoryIndicators: ['quality', 'testing', 'luxury', 'brand', 'excellence', 'ux']
    },
    sophia: {
      userMessage: "Sophia, I need social media strategy for Sandra's Instagram growth from 81K to 1M followers with authentic content.",
      agentResponse: "Perfect! I'm creating social media strategy with 4 Pillars content approach, authentic engagement, and growth tactics for Sandra's Instagram.",
      continuationMessage: "Sophia, can you continue developing the social media strategy?",
      memoryTestMessage: "Hi Sophia! Can you continue with the social media strategy we've been developing?",
      memoryIndicators: ['social media', 'instagram', 'followers', 'content', 'growth', 'strategy']
    },
    martha: {
      userMessage: "Martha, I need performance marketing campaigns for SSELFIE Studio with A/B testing and conversion optimization.",
      agentResponse: "Excellent! I'm implementing performance marketing with A/B testing, conversion optimization, and data-driven ad campaigns for maximum ROI.",
      continuationMessage: "Martha, can you continue optimizing the marketing campaigns?",
      memoryTestMessage: "Hi Martha! Can you continue with the marketing campaigns we've been working on?",
      memoryIndicators: ['marketing', 'campaigns', 'testing', 'conversion', 'ads', 'performance']
    },
    diana: {
      userMessage: "Diana, I need strategic business coaching for Sandra's SSELFIE Studio expansion and team coordination.",
      agentResponse: "Absolutely! I'm providing strategic coaching with business expansion planning, team coordination, and growth optimization for Sandra.",
      continuationMessage: "Diana, can you continue the strategic business planning?",
      memoryTestMessage: "Hi Diana! Can you continue with the business strategy we've been developing?",
      memoryIndicators: ['strategy', 'business', 'coaching', 'expansion', 'team', 'growth']
    },
    wilma: {
      userMessage: "Wilma, I need workflow optimization for SSELFIE Studio with efficient process design and automation coordination.",
      agentResponse: "Perfect! I'm designing workflow optimization with efficient processes, automation coordination, and scalable system architecture.",
      continuationMessage: "Wilma, can you continue optimizing the workflow systems?",
      memoryTestMessage: "Hi Wilma! Can you continue with the workflow optimization we've been working on?",
      memoryIndicators: ['workflow', 'optimization', 'process', 'automation', 'coordination', 'system']
    }
  };
  
  const results = [];
  
  for (const agentId of agents) {
    const result = await testAgentMemory(agentId, testConfigs[agentId]);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log('\n🎯 OVERALL MEMORY TEST RESULTS:');
  console.log('=====================================');
  
  const workingAgents = results.filter(r => r.working);
  const brokenAgents = results.filter(r => !r.working);
  
  console.log(`✅ Working Memory: ${workingAgents.length}/8 agents`);
  console.log(`❌ Broken Memory: ${brokenAgents.length}/8 agents`);
  
  if (workingAgents.length > 0) {
    console.log('\n✅ AGENTS WITH WORKING MEMORY:');
    workingAgents.forEach(agent => console.log(`- ${agent.agent.toUpperCase()}`));
  }
  
  if (brokenAgents.length > 0) {
    console.log('\n❌ AGENTS WITH BROKEN MEMORY:');
    brokenAgents.forEach(agent => {
      console.log(`- ${agent.agent.toUpperCase()}: ${agent.error || 'Context not retained'}`);
    });
    console.log('\n🔧 ACTION NEEDED: Fix memory system for broken agents');
  } else {
    console.log('\n🎉 ALL AGENTS HAVE WORKING MEMORY!');
  }
}

// Run the test
testAllAgentMemory();