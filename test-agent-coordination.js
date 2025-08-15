// Quick test to verify agent coordination system after dependency restoration
import axios from 'axios';

async function testAgentCoordination() {
  console.log('🔄 Testing agent coordination after dependency restoration...');
  
  try {
    const response = await axios.post('http://localhost:5000/api/consulting-agents/admin/consulting-chat', {
      agentId: 'zara',
      message: 'SYSTEM RESTORATION TEST: Verify full agent coordination is operational. Analyze SSELFIE Studio deployment readiness.',
      adminBypass: true
    }, {
      headers: {
        'X-Admin-Token': 'sandra-admin-2025',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Agent coordination test successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Agent coordination test failed:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   Server not running on port 5000');
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testAgentCoordination();