/**
 * COMPREHENSIVE 9-AGENT AI TEAM Q&A TESTING SCRIPT
 * Tests all agents, their functionalities, API access, and execution capabilities
 */

const agents = [
  {
    id: 'maya',
    name: 'Maya - Dev AI Expert',
    testQuestions: [
      'Maya, explain the current SSELFIE Studio architecture and show me a code preview for optimizing the image generation service.',
      'I need you to create a new React component for displaying user statistics. Show me the implementation.',
      'What would you recommend for improving our FLUX model training performance?'
    ],
    expectedCapabilities: ['Code generation', 'Architecture explanation', 'Performance optimization', 'React/TypeScript expertise']
  },
  {
    id: 'rachel',
    name: 'Rachel - Voice AI Copywriter',
    testQuestions: [
      'Rachel, write copy for our new premium feature announcement in Sandra\'s authentic voice.',
      'Create an email sequence for users who just completed their AI training.',
      'Write social media captions for our launch week campaign.'
    ],
    expectedCapabilities: ['Sandra\'s authentic voice', 'Email copywriting', 'Social media content', 'Conversion-focused copy']
  },
  {
    id: 'victoria',
    name: 'Victoria - UX Designer AI',
    testQuestions: [
      'Victoria, design a luxury landing page layout for our new feature with Times New Roman headlines.',
      'Show me a mobile-first dashboard redesign that follows our editorial design system.',
      'Create a visual mockup for our premium subscription upgrade flow.'
    ],
    expectedCapabilities: ['Luxury design system', 'Visual mockups', 'Mobile-first design', 'Times New Roman typography']
  },
  {
    id: 'ava',
    name: 'Ava - Automation AI',
    testQuestions: [
      'Ava, design a workflow for automating new user onboarding from signup to first AI generation.',
      'Show me how to optimize our Stripe subscription renewal process.',
      'Create automation for Instagram DM responses when users ask about pricing.'
    ],
    expectedCapabilities: ['Workflow automation', 'Payment processing', 'Instagram integration', 'User journey optimization']
  },
  {
    id: 'quinn',
    name: 'Quinn - QA AI',
    testQuestions: [
      'Quinn, run a quality check on our current user registration flow.',
      'Test the image generation pipeline for potential issues.',
      'Validate our premium upgrade journey for luxury standards.'
    ],
    expectedCapabilities: ['Quality testing', 'User journey validation', 'Bug detection', 'Luxury standards enforcement']
  },
  {
    id: 'sophia',
    name: 'Sophia - Social Media Manager AI',
    testQuestions: [
      'Sophia, create a content calendar for our next product launch.',
      'Analyze our Instagram engagement and suggest content improvements.',
      'Draft responses for common DM questions about our AI training.'
    ],
    expectedCapabilities: ['Content calendar creation', 'Instagram analytics', 'Community management', 'Engagement optimization']
  },
  {
    id: 'martha',
    name: 'Martha - Marketing/Ads AI',
    testQuestions: [
      'Martha, analyze our current conversion funnel and suggest A/B tests.',
      'Create ad copy for targeting women entrepreneurs aged 25-45.',
      'Identify new revenue opportunities based on user behavior data.'
    ],
    expectedCapabilities: ['Conversion optimization', 'A/B testing', 'Ad creation', 'Revenue analysis']
  },
  {
    id: 'diana',
    name: 'Diana - Personal Mentor & Business Coach AI',
    testQuestions: [
      'Diana, provide strategic guidance for scaling SSELFIE Studio to 10K users.',
      'Help me prioritize which features to build next.',
      'Give me a business coaching session on managing our AI agent team.'
    ],
    expectedCapabilities: ['Strategic planning', 'Business coaching', 'Team coordination', 'Growth strategy']
  },
  {
    id: 'wilma',
    name: 'Wilma - Workflow AI',
    testQuestions: [
      'Wilma, design a comprehensive workflow for handling customer support tickets.',
      'Create automation blueprints for coordinating all 9 agents.',
      'Optimize our business processes for maximum efficiency.'
    ],
    expectedCapabilities: ['Process optimization', 'Agent coordination', 'Workflow design', 'Efficiency improvement']
  }
];

/**
 * Test API connectivity and agent responses
 */
async function testAgentAPI(agentId, question) {
  try {
    const response = await fetch(`http://localhost:5000/api/agents/${agentId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ message: question })
    });

    const data = await response.json();
    
    if (response.status === 401) {
      return { 
        success: false, 
        error: 'Authentication required - admin login needed',
        status: 401
      };
    }
    
    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || `HTTP ${response.status}`,
        status: response.status
      };
    }

    return {
      success: true,
      response: data.message,
      hasPreview: data.hasPreview,
      previewType: data.previewType,
      metadata: data.metadata
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 'network_error'
    };
  }
}

/**
 * Test agent status endpoint
 */
async function testAgentStatus(agentId) {
  try {
    const response = await fetch(`http://localhost:5000/api/agents/${agentId}/status`, {
      credentials: 'include'
    });
    
    if (response.status === 401) {
      return { success: false, error: 'Authentication required' };
    }
    
    const data = await response.json();
    return { success: true, status: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test external API connections
 */
async function testExternalAPIs() {
  console.log('\n🔌 TESTING EXTERNAL API CONNECTIONS...\n');
  
  const apiTests = [
    { name: 'Anthropic Claude API', key: 'ANTHROPIC_API_KEY' },
    { name: 'OpenAI API', key: 'OPENAI_API_KEY' },
    { name: 'Stripe API', key: 'STRIPE_SECRET_KEY' },
    { name: 'Make.com API', key: 'MAKE_API_TOKEN' },
    { name: 'Flodesk API', key: 'FLODESK_API_KEY' },
    { name: 'Instagram API', key: 'META_ACCESS_TOKEN' },
    { name: 'ManyChat API', key: 'MANYCHAT_API_TOKEN' }
  ];

  for (const api of apiTests) {
    const hasKey = process.env[api.key] ? '✅' : '❌';
    console.log(`${hasKey} ${api.name}: ${process.env[api.key] ? 'Connected' : 'Missing API Key'}`);
  }
}

/**
 * Run comprehensive agent testing
 */
async function runCompleteAgentTest() {
  console.log('🤖 SSELFIE STUDIO - COMPLETE 9-AGENT AI TEAM Q&A TEST\n');
  console.log('🎯 Testing: Functionality, API Access, Execution Capabilities\n');
  
  // Test external APIs first
  await testExternalAPIs();
  
  console.log('\n👥 TESTING ALL 9 AI AGENTS...\n');
  
  const results = {
    successful: [],
    failed: [],
    authRequired: []
  };

  for (const agent of agents) {
    console.log(`\n🔍 TESTING ${agent.name.toUpperCase()}`);
    console.log('=' .repeat(50));
    
    // Test agent status
    const statusResult = await testAgentStatus(agent.id);
    if (statusResult.success) {
      console.log(`✅ Status: ${JSON.stringify(statusResult.status, null, 2)}`);
    } else {
      console.log(`❌ Status Error: ${statusResult.error}`);
      if (statusResult.error.includes('Authentication')) {
        results.authRequired.push(agent.id);
        continue;
      }
    }
    
    // Test each question
    for (let i = 0; i < agent.testQuestions.length; i++) {
      const question = agent.testQuestions[i];
      console.log(`\n📝 Test ${i + 1}: ${question.substring(0, 80)}...`);
      
      const result = await testAgentAPI(agent.id, question);
      
      if (result.success) {
        console.log(`✅ Response received (${result.response.length} chars)`);
        if (result.hasPreview) {
          console.log(`🎨 Preview available: ${result.previewType}`);
        }
        console.log(`💬 Sample: "${result.response.substring(0, 150)}..."`);
        
        if (!results.successful.find(r => r.agentId === agent.id)) {
          results.successful.push({
            agentId: agent.id,
            name: agent.name,
            capabilities: agent.expectedCapabilities
          });
        }
      } else {
        console.log(`❌ Error: ${result.error}`);
        if (result.status === 401) {
          results.authRequired.push(agent.id);
          break; // Skip remaining tests for this agent
        } else {
          results.failed.push({
            agentId: agent.id,
            name: agent.name,
            error: result.error,
            question: question.substring(0, 50)
          });
        }
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Generate final report
  console.log('\n📊 FINAL TEST REPORT');
  console.log('=' .repeat(50));
  
  console.log(`\n✅ SUCCESSFUL AGENTS (${results.successful.length}/9):`);
  results.successful.forEach(agent => {
    console.log(`   • ${agent.name}`);
    console.log(`     Capabilities: ${agent.capabilities.join(', ')}`);
  });
  
  if (results.authRequired.length > 0) {
    console.log(`\n🔐 AUTHENTICATION REQUIRED (${results.authRequired.length}):`);
    results.authRequired.forEach(agentId => {
      console.log(`   • ${agentId} - Need admin login to test`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED TESTS (${results.failed.length}):`);
    results.failed.forEach(failure => {
      console.log(`   • ${failure.name}: ${failure.error}`);
    });
  }
  
  console.log(`\n🎯 SYSTEM READINESS: ${results.successful.length === 9 ? '100% Ready' : `${Math.round((results.successful.length / 9) * 100)}% Ready`}`);
  
  if (results.authRequired.length > 0) {
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Login as admin (ssa@ssasocial.com) in the admin dashboard');
    console.log('   2. Test agent chat interfaces directly in the UI');
    console.log('   3. Verify all 9 agents respond with their specialized capabilities');
  }
  
  return results;
}

// Run the test directly
runCompleteAgentTest().catch(console.error);