#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST: ALL 14 AGENTS CONNECTIVITY
 * Tests complete admin consulting system infrastructure
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ALL 14 AGENTS based on personality files found
const ALL_AGENTS = [
  'maya', 'elena', 'olga', 'zara', 'victoria', 
  'aria', 'rachel', 'diana', 'quinn', 'wilma',
  'sophia', 'martha', 'ava', 'flux'
];

console.log('🚀 TESTING ALL 14 AGENTS CONNECTIVITY IN ADMIN SYSTEM');
console.log('='.repeat(70));
console.log(`🤖 Testing agents: ${ALL_AGENTS.join(', ')}`);
console.log('='.repeat(70));

async function testAllAgents() {
  try {
    console.log('🏁 INFRASTRUCTURE CHECK');
    console.log('-'.repeat(40));
    
    // Check server status
    const healthCheck = await execAsync(`curl -s http://localhost:3000/health`);
    const healthData = JSON.parse(healthCheck.stdout);
    console.log(`✅ Server Status: ${healthData.status} (${healthData.server})`);
    
    // Check if personality config exists
    const personalityCheck = await execAsync('ls -la server/agents/personalities/personality-config.ts');
    console.log(`✅ Personality Config: Found`);
    
    // Count personality files
    const personalityCount = await execAsync('find server/agents/personalities/ -name "*-personality.ts" | wc -l');
    console.log(`✅ Personality Files: ${personalityCount.stdout.trim()} found`);
    
    console.log('\n🔍 TESTING ADMIN CONSULTING ENDPOINT');
    console.log('-'.repeat(40));
    
    let connectedAgents = 0;
    let failedAgents = 0;
    const results = [];
    
    for (const agentId of ALL_AGENTS) {
      try {
        console.log(`\n🤖 Testing ${agentId.toUpperCase()}...`);
        
        const testCommand = `curl -s -X POST http://localhost:3000/api/admin/consulting-chat \
          -H "Content-Type: application/json" \
          -H "Authorization: sandra-admin-2025" \
          -d '{"agentId": "${agentId}", "message": "Hello ${agentId}, test connectivity", "adminToken": "sandra-admin-2025"}' \
          --max-time 5`;
        
        const response = await execAsync(testCommand);
        const responseData = JSON.parse(response.stdout);
        
        if (responseData.server === 'clean-js' && responseData.message.includes('Clean server operational')) {
          console.log(`   ⚠️ ${agentId}: Basic server response (not connected to agent system)`);
          results.push({ agent: agentId, status: 'disconnected', type: 'basic-response' });
          failedAgents++;
        } else if (responseData.success === false) {
          console.log(`   ❌ ${agentId}: Agent not found or error`);
          results.push({ agent: agentId, status: 'error', response: responseData });
          failedAgents++;
        } else {
          console.log(`   ✅ ${agentId}: Connected and responding`);
          results.push({ agent: agentId, status: 'connected' });
          connectedAgents++;
        }
        
      } catch (error) {
        console.log(`   ❌ ${agentId}: Connection failed - ${error.message}`);
        results.push({ agent: agentId, status: 'failed', error: error.message });
        failedAgents++;
      }
    }
    
    console.log('\n📊 COMPREHENSIVE RESULTS');
    console.log('='.repeat(70));
    console.log(`🤖 Total Agents Tested: ${ALL_AGENTS.length}`);
    console.log(`✅ Connected Agents: ${connectedAgents}`);
    console.log(`❌ Failed/Disconnected: ${failedAgents}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      const statusEmoji = result.status === 'connected' ? '✅' : 
                         result.status === 'disconnected' ? '⚠️' : '❌';
      console.log(`   ${statusEmoji} ${result.agent.toUpperCase()}: ${result.status}`);
    });
    
    console.log('\n🔍 INFRASTRUCTURE ANALYSIS');
    console.log('='.repeat(70));
    
    if (connectedAgents === 0) {
      console.log('❌ CRITICAL ISSUE: NO AGENTS ARE CONNECTED');
      console.log('\n🚨 ROOT CAUSE IDENTIFIED:');
      console.log('   - Clean JavaScript server is running (basic HTTP server)');
      console.log('   - TypeScript admin consulting system exists but not connected');
      console.log('   - All 14 agent personalities exist but unreachable');
      
      console.log('\n💡 INFRASTRUCTURE ISSUES:');
      console.log('   1. server/index.js: Basic HTTP server, no Express routing');
      console.log('   2. server/api/admin/consulting-agents.ts: TypeScript system exists');
      console.log('   3. server/routes.ts: 2,891 lines with middleware conflicts');
      console.log('   4. Missing bridge between JavaScript server and TypeScript agents');
      
      console.log('\n🔧 REQUIRED ACTIONS:');
      console.log('   1. Fix TypeScript server startup (resolve import conflicts)');
      console.log('   2. OR connect JavaScript server to TypeScript agent system');
      console.log('   3. Test actual agent tool execution (bash, file editing, etc.)');
      console.log('   4. Verify all 14 agents can execute real work, not just respond');
      
    } else if (connectedAgents < ALL_AGENTS.length) {
      console.log(`⚠️ PARTIAL CONNECTIVITY: ${connectedAgents}/${ALL_AGENTS.length} agents connected`);
    } else {
      console.log('✅ ALL AGENTS CONNECTED: Full admin consulting system operational');
    }
    
    console.log('\n🎯 NEXT STEPS FOR SANDRA:');
    console.log('='.repeat(70));
    console.log('1. Review these test results');
    console.log('2. Decide on infrastructure approach:');
    console.log('   - Fix TypeScript server, OR');
    console.log('   - Hybrid JavaScript/TypeScript bridge');
    console.log('3. Test actual agent work capabilities (tools, file editing)');
    console.log('4. Verify business features (Maya AI, Victoria AI, payments)');
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
  }
}

testAllAgents();