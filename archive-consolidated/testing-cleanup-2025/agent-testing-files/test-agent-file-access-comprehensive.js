/**
 * COMPREHENSIVE AGENT FILE ACCESS TEST
 * Tests the complete agent file access system enhancement
 */

const baseUrl = 'http://localhost:5000';
const adminToken = 'sandra-admin-2025';

console.log('🔧 COMPREHENSIVE AGENT FILE ACCESS TEST');
console.log('='*50);

// Test 1: Agent Chat with File Reading Request
async function testAgentFileReading() {
  console.log('\n📖 TEST 1: Agent File Reading Capability');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Can you read the vite.config.ts file and tell me about the current configuration?',
        adminToken: adminToken
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Agent file reading request sent successfully');
      console.log('📄 Response length:', data.message.length);
      console.log('🔍 Contains file content:', data.message.includes('File Content'));
    } else {
      console.log('❌ Agent file reading failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
  }
}

// Test 2: Direct Agent Codebase Routes
async function testDirectCodebaseRoutes() {
  console.log('\n🔧 TEST 2: Direct Agent Codebase Routes');
  console.log('-'.repeat(40));
  
  try {
    // Test file reading
    const readResponse = await fetch(`${baseUrl}/api/admin/agent/read-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'maya',
        filePath: 'package.json'
      })
    });
    
    const readData = await readResponse.json();
    
    if (readData.success) {
      console.log('✅ Direct file reading successful');
      console.log('📄 File content length:', readData.content.length);
      console.log('🔍 Contains "sselfie":', readData.content.includes('sselfie'));
    } else {
      console.log('❌ Direct file reading failed:', readData.error);
    }
    
    // Test file writing
    const testContent = `// Test file created by agent file access test
export const testMessage = 'Agent file access is working!';
export const timestamp = '${new Date().toISOString()}';
`;
    
    const writeResponse = await fetch(`${baseUrl}/api/admin/agent/write-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'maya',
        filePath: 'test-agent-access.ts',
        content: testContent,
        description: 'Test file for agent access verification'
      })
    });
    
    const writeData = await writeResponse.json();
    
    if (writeData.success) {
      console.log('✅ Direct file writing successful');
      console.log('📁 File created: test-agent-access.ts');
    } else {
      console.log('❌ Direct file writing failed:', writeData.error);
    }
    
  } catch (error) {
    console.log('❌ Test 2 failed:', error.message);
  }
}

// Test 3: Agent File Creation via Chat
async function testAgentFileCreation() {
  console.log('\n📁 TEST 3: Agent File Creation via Chat');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Create a test React component called TestFileAccess.tsx with a simple button that says "File Access Working!"',
        adminToken: adminToken
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Agent file creation request sent successfully');
      console.log('📄 Response contains file info:', data.filesCreated ? 'Yes' : 'No');
      if (data.filesCreated) {
        console.log('📁 Files created:', data.filesCreated);
      }
    } else {
      console.log('❌ Agent file creation failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Test 3 failed:', error.message);
  }
}

// Test 4: Visual Editor Preview Domain Fix
async function testVisualEditorPreview() {
  console.log('\n🖼️ TEST 4: Visual Editor Preview Domain Fix');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`${baseUrl}/visual-editor`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      console.log('✅ Visual editor page loads successfully');
      console.log('🔍 Contains iframe with localhost:5000:', html.includes('localhost:5000'));
      console.log('🔍 Contains agent chat system:', html.includes('agent-chat'));
    } else {
      console.log('❌ Visual editor page failed to load:', response.status);
    }
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message);
  }
}

// Test 5: Agent System Status
async function testAgentSystemStatus() {
  console.log('\n🤖 TEST 5: Agent System Status');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      console.log('✅ Agent system status retrieved successfully');
      console.log('🤖 Available agents:', data.length);
      data.forEach(agent => {
        console.log(`  - ${agent.name}: ${agent.role}`);
      });
    } else {
      console.log('❌ Agent system status failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Test 5 failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive agent file access tests...\n');
  
  await testAgentFileReading();
  await testDirectCodebaseRoutes();
  await testAgentFileCreation();
  await testVisualEditorPreview();
  await testAgentSystemStatus();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 COMPREHENSIVE AGENT FILE ACCESS TEST COMPLETE');
  console.log('='*50);
}

// Run the tests
runAllTests().catch(console.error);