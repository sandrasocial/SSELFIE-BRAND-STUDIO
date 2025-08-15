#!/usr/bin/env node

/**
 * CRITICAL TEST: Actual Zara Agent Connectivity Test
 * Tests if Zara can be reached and can use tools in the admin consulting system
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 TESTING ZARA AGENT CONNECTIVITY IN ADMIN SYSTEM');
console.log('='.repeat(60));

async function testZaraConnectivity() {
  try {
    console.log('🏁 Step 1: Check if server is running...');
    
    const healthCheck = await execAsync(`curl -s http://localhost:3000/health`);
    const healthData = JSON.parse(healthCheck.stdout);
    console.log(`✅ Server Status: ${healthData.status} (${healthData.server})`);
    
    console.log('\n🔍 Step 2: Test admin consulting endpoint...');
    
    const adminTest = await execAsync(`curl -s -X POST http://localhost:3000/api/admin/consulting-chat \
      -H "Content-Type: application/json" \
      -H "Authorization: sandra-admin-2025" \
      -d '{"agentId": "zara", "message": "Hello Zara, can you test your bash tool by running: ls server/", "adminToken": "sandra-admin-2025"}'`);
    
    console.log('Response from admin consulting endpoint:');
    console.log(adminTest.stdout);
    
    const response = JSON.parse(adminTest.stdout);
    
    if (response.message && response.message.includes('Clean server operational')) {
      console.log('\n⚠️ DISCOVERY: Clean JavaScript server is running but NOT connected to Zara agent system');
      console.log('The server returns a basic message instead of routing to the actual agent handlers');
    }
    
    console.log('\n🔍 Step 3: Check if actual TypeScript server components exist...');
    
    const tsServerCheck = await execAsync('find server/ -name "*.ts" | grep -E "(routes|consulting|agents)" | head -10');
    console.log('TypeScript agent files found:');
    console.log(tsServerCheck.stdout);
    
    console.log('\n🔍 Step 4: Check for actual Zara personality and tools...');
    
    const zaraCheck = await execAsync('find server/ -name "*zara*" -o -name "*consulting-agents*" | head -5');
    console.log('Zara-related files:');
    console.log(zaraCheck.stdout);
    
    console.log('\n🎯 CONNECTIVITY TEST RESULTS:');
    console.log('='.repeat(60));
    
    if (response.server === 'clean-js') {
      console.log('❌ ISSUE IDENTIFIED: JavaScript server is running but NOT connected to agent system');
      console.log('   - Clean JS server responds with basic messages');
      console.log('   - TypeScript agent system exists but not being used');
      console.log('   - Zara personality and tools exist but not accessible');
      
      console.log('\n💡 ROOT CAUSE:');
      console.log('   The clean JavaScript server bypasses all TypeScript components');
      console.log('   including the admin consulting agents system where Zara lives');
      
      console.log('\n🔧 REQUIRED FIX:');
      console.log('   Need to either:');
      console.log('   1. Fix TypeScript server to run without conflicts, OR');
      console.log('   2. Connect JavaScript server to existing TypeScript agent system');
    } else {
      console.log('✅ Server appears to be connected to agent system');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testZaraConnectivity();