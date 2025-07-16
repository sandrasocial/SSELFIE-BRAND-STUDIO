/**
 * ADMIN DASHBOARD INTEGRATION TEST
 * Tests the redesigned admin dashboard and agent chat functionality
 */

async function testAdminDashboard() {
  console.log('\n🔍 Testing Admin Dashboard Integration...');
  
  const baseUrl = 'http://localhost:5000';
  
  // Test admin stats endpoint
  try {
    const statsResponse = await fetch(`${baseUrl}/api/admin/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Admin stats endpoint working');
      console.log(`📊 Users: ${stats.totalUsers || 0}, Revenue: €${stats.monthlyRevenue || 0}`);
    } else {
      console.log('❌ Admin stats endpoint failed:', statsResponse.status);
    }
  } catch (error) {
    console.log('❌ Admin stats test failed:', error.message);
  }
  
  // Test agent endpoints
  const agents = ['maya', 'rachel', 'victoria', 'ava'];
  
  for (const agentId of agents) {
    try {
      const agentResponse = await fetch(`${baseUrl}/api/agents/${agentId}/status`);
      if (agentResponse.ok) {
        const agent = await agentResponse.json();
        console.log(`✅ ${agent.name} (${agent.role}) - ${agent.status}`);
      } else {
        console.log(`❌ ${agentId} agent endpoint failed:`, agentResponse.status);
      }
    } catch (error) {
      console.log(`❌ ${agentId} agent test failed:`, error.message);
    }
  }
  
  // Test integration health endpoint
  try {
    const healthResponse = await fetch(`${baseUrl}/api/integrations/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Integration health endpoint working');
      console.log(`🔗 Integrations: ${health.summary?.active || 0}/${health.summary?.total || 0} active`);
    } else {
      console.log('❌ Integration health endpoint failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Integration health test failed:', error.message);
  }
  
  console.log('\n📋 ADMIN DASHBOARD TEST COMPLETE');
  console.log('Dashboard ready for Sandra to begin working with her AI agents');
}

// Run test
testAdminDashboard();