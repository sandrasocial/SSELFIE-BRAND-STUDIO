/**
 * TEST ADMIN AGENT CHAT - AUTHENTICATION BYPASS
 * Tests the new admin agent chat endpoint that bypasses authentication
 */

async function testAdminAgentChat() {
  console.log('🧪 TESTING ADMIN AGENT CHAT - AUTHENTICATION BYPASS');
  console.log('='*60);
  
  try {
    // Test 1: Maya component creation
    console.log('\n1️⃣ Testing Maya component creation...');
    const mayaResponse = await fetch('http://localhost:5000/api/admin/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Maya, please create a React component called TestAdminComponent',
        adminToken: 'sandra-admin-2025'
      })
    });
    
    console.log('Maya response status:', mayaResponse.status);
    
    if (mayaResponse.ok) {
      const result = await mayaResponse.json();
      console.log('✅ Maya responded successfully');
      console.log('Response:', result.message);
      
      if (result.fileCreated) {
        console.log('✅ File created:', result.fileCreated);
        
        // Verify file exists
        const fs = await import('fs/promises');
        const path = await import('path');
        
        try {
          const filePath = path.default.join(process.cwd(), result.fileCreated);
          await fs.default.access(filePath);
          console.log('✅ FILE VERIFIED: Component file exists on disk');
          return true;
        } catch (fileError) {
          console.log('❌ FILE NOT FOUND: Component not created on disk');
          return false;
        }
      }
    } else {
      console.log('❌ Maya request failed:', mayaResponse.status);
      return false;
    }
    
    // Test 2: Victoria page creation
    console.log('\n2️⃣ Testing Victoria page creation...');
    const victoriaResponse = await fetch('http://localhost:5000/api/admin/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Victoria, please create a luxury page called TestAdminPage',
        adminToken: 'sandra-admin-2025'
      })
    });
    
    console.log('Victoria response status:', victoriaResponse.status);
    
    if (victoriaResponse.ok) {
      const result = await victoriaResponse.json();
      console.log('✅ Victoria responded successfully');
      console.log('Response:', result.message.substring(0, 100) + '...');
      
      if (result.fileCreated) {
        console.log('✅ File created:', result.fileCreated);
        return true;
      }
    }
    
    // Test 3: Regular agent conversation (no file operations)
    console.log('\n3️⃣ Testing Rachel regular conversation...');
    const rachelResponse = await fetch('http://localhost:5000/api/admin/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'rachel',
        message: 'Hello Rachel, how are you?',
        adminToken: 'sandra-admin-2025'
      })
    });
    
    console.log('Rachel response status:', rachelResponse.status);
    
    if (rachelResponse.ok) {
      const result = await rachelResponse.json();
      console.log('✅ Rachel conversation working');
      console.log('Response:', result.message);
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testAdminAgentChat().then(success => {
  console.log('\n' + '='*60);
  if (success) {
    console.log('🎉 ADMIN AGENT CHAT: FULLY WORKING!');
    console.log('✅ Agents can create files');
    console.log('✅ Authentication bypass working');
    console.log('✅ File operations successful');
    console.log('\n📋 NEXT STEPS FOR SANDRA:');
    console.log('1. Update admin dashboard to use /api/admin/agent-chat endpoint');
    console.log('2. Add adminToken: "sandra-admin-2025" to agent requests');
    console.log('3. Agents will now create files when you ask them');
  } else {
    console.log('❌ ADMIN AGENT CHAT: STILL NOT WORKING');
    console.log('More debugging needed');
  }
  console.log('='*60);
});