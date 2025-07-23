/**
 * TEST AGENT FILE ACCESS SYSTEM - COMPREHENSIVE VALIDATION
 * Tests the enhanced file access system for Sandra's agents
 */

const baseUrl = 'http://localhost:5000';

// Test 1: Agent File Access Routes
async function testAgentFileAccess() {
  console.log('\n📁 TEST 1: Agent File Access System');
  console.log('-'.repeat(50));
  
  try {
    // Test directory browsing
    console.log('🔍 Testing directory browsing...');
    const browseResponse = await fetch(`${baseUrl}/api/admin/agent/browse-directory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3ABMusXBf_...' // Admin session
      },
      body: JSON.stringify({
        agentId: 'maya',
        dirPath: 'server'
      })
    });
    
    if (browseResponse.ok) {
      const data = await browseResponse.json();
      console.log('✅ Directory browsing works:', data.entries?.length || 0, 'entries found');
    } else {
      console.log('❌ Directory browsing failed:', browseResponse.status);
    }
    
    // Test file reading
    console.log('📄 Testing file reading...');
    const readResponse = await fetch(`${baseUrl}/api/admin/agent/read-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3ABMusXBf_...'
      },
      body: JSON.stringify({
        agentId: 'maya',
        filePath: 'package.json'
      })
    });
    
    if (readResponse.ok) {
      const data = await readResponse.json();
      console.log('✅ File reading works:', data.content?.length || 0, 'characters read');
    } else {
      console.log('❌ File reading failed:', readResponse.status);
    }
    
    // Test project overview
    console.log('📋 Testing project overview...');
    const overviewResponse = await fetch(`${baseUrl}/api/admin/agent/project-overview/maya`, {
      method: 'GET',
      headers: {
        'Cookie': 'connect.sid=s%3ABMusXBf_...'
      }
    });
    
    if (overviewResponse.ok) {
      const data = await overviewResponse.json();
      console.log('✅ Project overview works:', data.overview?.mainDirectories?.length || 0, 'directories found');
    } else {
      console.log('❌ Project overview failed:', overviewResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Agent file access test failed:', error.message);
  }
}

// Test 2: Maya Chat with File Reading
async function testMayaChatFileReading() {
  console.log('\n🤖 TEST 2: Maya Chat with File Reading');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(`${baseUrl}/api/agent-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3ABMusXBf_...'
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Can you read my vite.config.ts file and tell me what it contains?'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Maya chat works');
      console.log('📄 Response length:', data.message?.length || 0, 'characters');
      console.log('🔍 Contains vite config info:', data.message?.includes('vite') ? 'YES' : 'NO');
      console.log('🔍 Agent capabilities:', data.capabilities?.codebaseAccess ? 'YES' : 'NO');
    } else {
      console.log('❌ Maya chat failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Maya chat test failed:', error.message);
  }
}

// Test 3: Visual Editor Preview Domain
async function testVisualEditorPreview() {
  console.log('\n🖼️ TEST 3: Visual Editor Preview Domain');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(`${baseUrl}/visual-editor`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Cookie': 'connect.sid=s%3ABMusXBf_...'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      console.log('✅ Visual editor page loads successfully');
      console.log('🔍 Contains localhost:5000 iframe:', html.includes('localhost:5000') ? 'YES' : 'NO');
      console.log('🔍 Contains agent chat system:', html.includes('agent-chat') ? 'YES' : 'NO');
      console.log('🔍 Contains Victoria integration:', html.includes('victoria') ? 'YES' : 'NO');
    } else {
      console.log('❌ Visual editor failed to load:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Visual editor test failed:', error.message);
  }
}

// Test 4: Admin Dashboard Agent Access
async function testAdminDashboardAgents() {
  console.log('\n👑 TEST 4: Admin Dashboard Agent Access');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(`${baseUrl}/sandra-command`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Cookie': 'connect.sid=s%3ABMusXBf_...'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      console.log('✅ Admin dashboard loads successfully');
      console.log('🔍 Contains agent cards:', html.includes('Chat & Implement') ? 'YES' : 'NO');
      console.log('🔍 Contains Maya agent:', html.includes('Maya') ? 'YES' : 'NO');
      console.log('🔍 Contains Victoria agent:', html.includes('Victoria') ? 'YES' : 'NO');
      console.log('🔍 Contains visual editor link:', html.includes('visual-editor') ? 'YES' : 'NO');
    } else {
      console.log('❌ Admin dashboard failed to load:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Admin dashboard test failed:', error.message);
  }
}

// Test 5: Development Mode vs Production
async function testDevelopmentMode() {
  console.log('\n⚙️ TEST 5: Development Mode Status');
  console.log('-'.repeat(50));
  
  try {
    // Check if we're in development mode
    const isLocalhost = baseUrl.includes('localhost');
    const isReplit = process.env.REPL_ID !== undefined;
    
    console.log('🔍 Environment check:');
    console.log('  - Running on localhost:', isLocalhost ? 'YES' : 'NO');
    console.log('  - Replit environment:', isReplit ? 'YES' : 'NO');
    console.log('  - Base URL:', baseUrl);
    
    // Test if agents work in current environment
    console.log('\n🤖 Agent functionality in current environment:');
    
    const agentResponse = await fetch(`${baseUrl}/api/agents`, {
      method: 'GET',
      headers: {
        'Cookie': 'connect.sid=s%3ABMusXBf_...'
      }
    });
    
    if (agentResponse.ok) {
      const data = await agentResponse.json();
      console.log('✅ Agent API works:', data.length || 0, 'agents available');
      console.log('🔍 Maya available:', data.some(a => a.id === 'maya') ? 'YES' : 'NO');
      console.log('🔍 Victoria available:', data.some(a => a.id === 'victoria') ? 'YES' : 'NO');
    } else {
      console.log('❌ Agent API failed:', agentResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Development mode test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 COMPREHENSIVE AGENT FILE ACCESS VALIDATION');
  console.log('='.repeat(60));
  
  await testAgentFileAccess();
  await testMayaChatFileReading();
  await testVisualEditorPreview();
  await testAdminDashboardAgents();
  await testDevelopmentMode();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ VALIDATION COMPLETE');
  console.log('📋 Sandra: Your agents should now have full file access capability!');
  console.log('🔍 Check the test results above to confirm everything works.');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAgentFileAccess,
  testMayaChatFileReading,
  testVisualEditorPreview,
  testAdminDashboardAgents,
  testDevelopmentMode,
  runAllTests
};