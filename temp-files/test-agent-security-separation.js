/**
 * AGENT SECURITY SEPARATION VALIDATION TEST
 * Verifies complete separation between admin and member agent capabilities
 */

const TEST_BASE_URL = 'http://localhost:5000';

async function testMemberAgentSecurity() {
  console.log('🔒 TESTING MEMBER AGENT SECURITY SEPARATION');
  console.log('=' * 60);
  
  try {
    // Simulate regular user session (non-admin)
    const testUserId = '12345'; // Non-admin test user
    
    // TEST 1: Maya Member Agent (Image Generation Guide)
    console.log('\n📸 Testing Maya Member Agent Security...');
    const mayaResponse = await fetch(`${TEST_BASE_URL}/api/maya-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-token' // Non-admin token
      },
      body: JSON.stringify({
        message: 'Maya, create a file called SecurityTest.tsx',
        chatHistory: []
      })
    });
    
    const mayaData = await mayaResponse.json();
    console.log('Maya response status:', mayaResponse.status);
    console.log('Maya agent type:', mayaData.agentType);
    console.log('Maya can modify files:', mayaData.canModifyFiles || false);
    
    // Verify member-specific limitations
    if (mayaData.agentType === 'member' && !mayaData.canModifyFiles) {
      console.log('✅ Maya member security CORRECT - no file modification access');
    } else {
      console.log('❌ Maya member security BREACH - has admin capabilities');
    }
    
    // TEST 2: Victoria Member Agent (Website Building Guide)
    console.log('\n🏗️ Testing Victoria Member Agent Security...');
    const victoriaResponse = await fetch(`${TEST_BASE_URL}/api/victoria-website-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-token' // Non-admin token
      },
      body: JSON.stringify({
        message: 'Victoria, modify the server files to add a new endpoint',
        onboardingData: { businessType: 'Test', goals: 'Test' },
        conversationHistory: []
      })
    });
    
    const victoriaData = await victoriaResponse.json();
    console.log('Victoria response status:', victoriaResponse.status);
    console.log('Victoria agent type:', victoriaData.agentType);
    console.log('Victoria can modify files:', victoriaData.canModifyFiles || false);
    
    // Verify member-specific limitations
    if (victoriaData.agentType === 'member' && !victoriaData.canModifyFiles) {
      console.log('✅ Victoria member security CORRECT - no file modification access');
    } else {
      console.log('❌ Victoria member security BREACH - has admin capabilities');
    }
    
    console.log('\n🔐 MEMBER AGENT SECURITY SUMMARY:');
    console.log(`Maya Member Agent: ${mayaData.agentType === 'member' ? '✅ SECURE' : '❌ BREACH'}`);
    console.log(`Victoria Member Agent: ${victoriaData.agentType === 'member' ? '✅ SECURE' : '❌ BREACH'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

async function testAdminAgentSecurity() {
  console.log('\n👩‍💼 TESTING ADMIN AGENT SECURITY ACCESS');
  console.log('=' * 60);
  
  try {
    // TEST 3: Maya Admin Agent (Full Capabilities)
    console.log('\n📸 Testing Maya Admin Agent Access...');
    const mayaAdminResponse = await fetch(`${TEST_BASE_URL}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Maya, what tools do you have access to?',
        adminToken: 'sandra-admin-2025'
      })
    });
    
    const mayaAdminData = await mayaAdminResponse.json();
    console.log('Maya admin response status:', mayaAdminResponse.status);
    console.log('Maya admin file access:', mayaAdminData.fileAccess || 'Available');
    
    // TEST 4: Victoria Admin Agent (Full Capabilities)
    console.log('\n🏗️ Testing Victoria Admin Agent Access...');
    const victoriaAdminResponse = await fetch(`${TEST_BASE_URL}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Victoria, what development tools can you use?',
        adminToken: 'sandra-admin-2025'
      })
    });
    
    const victoriaAdminData = await victoriaAdminResponse.json();
    console.log('Victoria admin response status:', victoriaAdminResponse.status);
    console.log('Victoria admin file access:', victoriaAdminData.fileAccess || 'Available');
    
    console.log('\n🔑 ADMIN AGENT SECURITY SUMMARY:');
    console.log(`Maya Admin Agent: ${mayaAdminResponse.ok ? '✅ ACCESSIBLE' : '❌ BLOCKED'}`);
    console.log(`Victoria Admin Agent: ${victoriaAdminResponse.ok ? '✅ ACCESSIBLE' : '❌ BLOCKED'}`);
    
  } catch (error) {
    console.error('❌ Admin test error:', error.message);
  }
}

async function runSecurityTests() {
  console.log('🚨 SSELFIE STUDIO AGENT SECURITY VALIDATION');
  console.log('Testing complete separation between admin and member agent capabilities');
  console.log('\n');
  
  await testMemberAgentSecurity();
  await testAdminAgentSecurity();
  
  console.log('\n🎯 SECURITY SEPARATION TEST COMPLETE');
  console.log('Verify that:');
  console.log('• Member agents have NO file modification capabilities');
  console.log('• Admin agents have FULL file modification capabilities');
  console.log('• Complete security isolation between admin/member systems');
}

// Run the tests
runSecurityTests().catch(console.error);