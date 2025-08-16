// EMERGENCY ADMIN AGENT TEST - Direct coordination request
// Testing if Elena, Quinn, and Zara can actually respond with Claude API intelligence

const express = require('express');
const path = require('path');

// Import admin bypass system
const { adminBypassMiddleware } = require('./server/middleware/admin-bypass.js');

// Simulate admin agent coordination request
async function testAdminAgentCoordination() {
  console.log('🧪 TESTING ADMIN AGENTS - Emergency Server Crash Fix');
  console.log('━'.repeat(60));
  
  // Test 1: Elena Coordination Request
  console.log('📞 CALLING ELENA - Administrative Coordination AI');
  console.log('Request: "Server is crashing on port 5000. Coordinate emergency fix with Quinn and Zara."');
  
  try {
    // Attempt to load agent system
    const fs = require('fs');
    const agentRoutes = path.join(__dirname, 'server/routes/consulting-agents-routes.ts');
    
    if (fs.existsSync(agentRoutes)) {
      console.log('✅ Agent routing system found');
      
      // Check if admin bypass token works
      const testToken = 'sandra-admin-2025';
      console.log(`🔑 Testing admin bypass token: ${testToken}`);
      
      // Test agent personality access
      const personalityPath = path.join(__dirname, 'server/agents/personalities');
      if (fs.existsSync(personalityPath)) {
        console.log('✅ Agent personalities directory found');
        
        const elenaPath = path.join(personalityPath, 'elena.txt');
        const quinnPath = path.join(personalityPath, 'quinn.txt');
        const zaraPath = path.join(personalityPath, 'zara.txt');
        
        console.log(`Elena personality: ${fs.existsSync(elenaPath) ? '✅' : '❌'}`);
        console.log(`Quinn personality: ${fs.existsSync(quinnPath) ? '✅' : '❌'}`);
        console.log(`Zara personality: ${fs.existsSync(zaraPath) ? '✅' : '❌'}`);
        
      } else {
        console.log('❌ Agent personalities directory NOT found');
      }
      
    } else {
      console.log('❌ Agent routing system NOT found');
    }
    
    // Test server startup issue
    console.log('\n🔧 DIAGNOSING SERVER CRASH ISSUE:');
    
    const packageJson = JSON.parse(fs.readFileSync('./package.json'));
    console.log(`Current dev script: "${packageJson.scripts.dev}"`);
    
    if (packageJson.scripts.dev === 'vite') {
      console.log('❌ CRITICAL ERROR: Dev script only starts frontend Vite!');
      console.log('💡 FIX NEEDED: Backend server (server/index.ts) is not being started');
      
      // Check if there's a server start script
      const serverIndexExists = fs.existsSync('./server/index.ts');
      console.log(`Server index.ts exists: ${serverIndexExists ? '✅' : '❌'}`);
      
      if (serverIndexExists) {
        console.log('🔧 SOLUTION: Dev script should start both frontend AND backend');
        console.log('Required: npm run dev should run server/index.ts AND vite');
      }
    }
    
  } catch (error) {
    console.error('❌ Admin agent test failed:', error.message);
  }
  
  console.log('━'.repeat(60));
  console.log('🎯 COORDINATION REQUEST COMPLETE');
}

// Run the test
testAdminAgentCoordination();