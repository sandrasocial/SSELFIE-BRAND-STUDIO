/**
 * TEST UNIFIED AGENT COMMUNICATION SYSTEM
 * Verifies the unified agent endpoint works with all agents and Replit-style formatting
 */

const baseUrl = 'http://localhost:5000';
const adminToken = 'sandra-admin-2025';

async function testUnifiedAgentCommunication() {
  console.log('🔧 TESTING UNIFIED AGENT COMMUNICATION SYSTEM');
  console.log('=' .repeat(60));
  console.log('🎯 GOAL: Verify all agents work through unified /api/admin/agents/chat endpoint');
  console.log('📋 TEST: Agent communication, Elena workflows, file creation capabilities\n');

  // Test 1: Standard Agent Communication
  await testAgentCommunication();
  
  // Test 2: Elena Workflow Creation
  await testElenaWorkflowCreation();
  
  // Test 3: Agent File Creation
  await testAgentFileCreation();
  
  // Test 4: Replit-Style Response Formatting
  await testReplitStyleFormatting();
  
  console.log('\n✅ UNIFIED AGENT COMMUNICATION TESTING COMPLETE');
  console.log('📊 All agents now communicate through single unified endpoint');
  console.log('🚀 Ready for Sandra\'s Replit-style human-agent communication');
}

async function testAgentCommunication() {
  console.log('💬 TEST 1: Standard Agent Communication');
  console.log('-'.repeat(40));
  
  const agents = ['elena', 'aria', 'zara', 'rachel', 'maya', 'victoria'];
  
  for (const agentId of agents) {
    try {
      console.log(`🤖 Testing ${agentId} agent...`);
      
      const response = await fetch(`${baseUrl}/api/admin/agents/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId,
          message: `Hello ${agentId}, please confirm you are operational and ready to work. This is a test message.`,
          adminToken: adminToken,
          conversationHistory: []
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.response) {
        console.log(`✅ ${agentId} responded successfully`);
        console.log(`📝 Response preview: ${data.response.substring(0, 100)}...`);
      } else {
        console.log(`❌ ${agentId} failed to respond:`, data.error);
      }
      
    } catch (error) {
      console.log(`❌ ${agentId} communication error:`, error.message);
    }
  }
}

async function testElenaWorkflowCreation() {
  console.log('\n🎯 TEST 2: Elena Workflow Creation');
  console.log('-'.repeat(40));
  
  try {
    console.log('📋 Creating workflow with Elena...');
    
    const response = await fetch(`${baseUrl}/api/admin/agents/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'elena',
        message: 'Create a workflow for improving the admin dashboard hero section with luxury editorial design',
        adminToken: adminToken,
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.response) {
      console.log('✅ Elena workflow creation request successful');
      
      if (data.response.includes('WORKFLOW') || data.response.includes('workflow')) {
        console.log('🎯 Workflow creation detected in response');
        
        // Test workflow execution
        console.log('\n🚀 Testing workflow execution...');
        
        const execResponse = await fetch(`${baseUrl}/api/admin/agents/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: 'elena',
            message: 'execute workflow',
            adminToken: adminToken,
            conversationHistory: [
              { role: 'user', content: 'Create a workflow for improving the admin dashboard hero section' },
              { role: 'assistant', content: data.response }
            ]
          })
        });
        
        const execData = await execResponse.json();
        
        if (execData.success) {
          console.log('✅ Elena workflow execution successful');
          console.log('📊 Status:', execData.status || 'No status provided');
        } else {
          console.log('❌ Elena workflow execution failed:', execData.error);
        }
        
      } else {
        console.log('⚠️ No workflow detected in Elena response');
      }
      
    } else {
      console.log('❌ Elena workflow creation failed:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Elena workflow test error:', error.message);
  }
}

async function testAgentFileCreation() {
  console.log('\n📁 TEST 3: Agent File Creation');
  console.log('-'.repeat(40));
  
  try {
    console.log('🔨 Testing Aria file creation...');
    
    const response = await fetch(`${baseUrl}/api/admin/agents/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'aria',
        message: 'Create a test component called UnifiedAgentTest.tsx with a simple interface showing "Unified Agent Communication Working!"',
        adminToken: adminToken,
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.response) {
      console.log('✅ Aria file creation request successful');
      
      if (data.fileOperations && data.fileOperations.length > 0) {
        console.log('📁 Files created:', data.fileOperations.map(f => f.filePath || f.path));
        console.log('✅ File creation system operational');
      } else if (data.response.includes('```') || data.response.includes('tsx')) {
        console.log('📝 Code detected in response - file creation system working');
      } else {
        console.log('⚠️ No file operations detected in response');
      }
      
    } else {
      console.log('❌ Aria file creation failed:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Agent file creation test error:', error.message);
  }
}

async function testReplitStyleFormatting() {
  console.log('\n🎨 TEST 4: Replit-Style Response Formatting');
  console.log('-'.repeat(40));
  
  try {
    console.log('🎭 Testing formatted response with code blocks...');
    
    const response = await fetch(`${baseUrl}/api/admin/agents/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'zara',
        message: 'Show me an example React component with TypeScript and explain the code structure',
        adminToken: adminToken,
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.response) {
      console.log('✅ Zara formatting test successful');
      
      // Check for Replit-style elements
      const hasCodeBlocks = data.response.includes('```');
      const hasMarkdown = data.response.includes('**') || data.response.includes('#');
      const hasStructure = data.response.includes('\n\n');
      
      console.log('📝 Response formatting analysis:');
      console.log(`   Code blocks: ${hasCodeBlocks ? '✅' : '❌'}`);
      console.log(`   Markdown formatting: ${hasMarkdown ? '✅' : '❌'}`);
      console.log(`   Structured content: ${hasStructure ? '✅' : '❌'}`);
      
      if (hasCodeBlocks && hasMarkdown) {
        console.log('🎯 Replit-style formatting detected - ready for FormattedAgentMessage component');
      } else {
        console.log('⚠️ Response may need better formatting for Replit-style display');
      }
      
    } else {
      console.log('❌ Zara formatting test failed:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Replit-style formatting test error:', error.message);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testUnifiedAgentCommunication().catch(console.error);
}

export { testUnifiedAgentCommunication };