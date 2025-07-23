/**
 * TEST AGENT FILE CREATION FIX
 * Verifies that the updated agent-chat-bypass endpoint properly creates files
 */

const adminToken = 'sandra-admin-2025';
const baseUrl = 'http://localhost:5000';

async function testAgentFileCreation() {
  console.log('🔧 TESTING AGENT FILE CREATION FIX');
  console.log('='*50);
  
  try {
    // Test Maya creating a React component
    console.log('\n📝 Testing Maya file creation...');
    const mayaResponse = await fetch(`${baseUrl}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Create a test component called TestFileCreation.tsx with a simple button that says "File Creation Working!"',
        adminToken: adminToken
      })
    });
    
    const mayaData = await mayaResponse.json();
    
    if (mayaData.success) {
      console.log('✅ Maya response successful');
      console.log('📄 Response includes file info:', mayaData.fileCreated ? 'Yes' : 'No');
      console.log('📁 Files modified:', mayaData.filesModified?.length || 0);
      
      // Check if response mentions file creation
      if (mayaData.message.includes('Files Modified Successfully') || mayaData.fileCreated) {
        console.log('🎯 FILE CREATION SUCCESS: Maya successfully created files!');
      } else {
        console.log('⚠️ File creation not detected in response');
      }
    } else {
      console.log('❌ Maya response failed:', mayaData.error);
    }
    
    // Test Victoria creating a UI component
    console.log('\n🎨 Testing Victoria file creation...');
    const victoriaResponse = await fetch(`${baseUrl}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Design a beautiful luxury card component called LuxuryTestCard.tsx with Times New Roman styling',
        adminToken: adminToken
      })
    });
    
    const victoriaData = await victoriaResponse.json();
    
    if (victoriaData.success) {
      console.log('✅ Victoria response successful');
      console.log('📄 Response includes file info:', victoriaData.fileCreated ? 'Yes' : 'No');
      console.log('📁 Files modified:', victoriaData.filesModified?.length || 0);
      
      if (victoriaData.message.includes('Files Modified Successfully') || victoriaData.fileCreated) {
        console.log('🎯 FILE CREATION SUCCESS: Victoria successfully created files!');
      } else {
        console.log('⚠️ File creation not detected in response');
      }
    } else {
      console.log('❌ Victoria response failed:', victoriaData.error);
    }
    
    console.log('\n📊 FINAL STATUS:');
    console.log(`Maya File Creation: ${mayaData.fileCreated || mayaData.message.includes('Files Modified') ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Victoria File Creation: ${victoriaData.fileCreated || victoriaData.message.includes('Files Modified') ? '✅ WORKING' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testAgentFileCreation();