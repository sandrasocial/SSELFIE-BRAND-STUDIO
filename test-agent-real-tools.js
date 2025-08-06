#!/usr/bin/env node

/**
 * TEST AGENT REAL TOOLS INTEGRATION
 * Verifies that agents can execute ACTUAL Replit tools, not simulations
 * Tests the complete flow: Agent → Claude API → Hybrid Bridge → Real Tools
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';
const TEST_CONVERSATION_ID = `test-real-tools-${Date.now()}`;

async function testAgentRealTools() {
  console.log('🧪 TESTING AGENT REAL TOOLS INTEGRATION');
  console.log('=' .repeat(50));
  
  // Test 1: Zara creates a real file
  console.log('\n📝 TEST 1: Zara creates a REAL file');
  try {
    const response = await fetch(`${API_BASE}/api/consulting-agents/admin/consulting-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test-session'
      },
      body: JSON.stringify({
        agentName: 'zara',
        message: 'Create a test file at test-outputs/zara-test.txt with content "This is a real file created by Zara using actual Replit tools"',
        conversationId: TEST_CONVERSATION_ID,
        userId: 'admin'
      })
    });

    if (response.ok) {
      console.log('✅ Zara command sent successfully');
      
      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'tool_start') {
                console.log(`🔧 Tool triggered: ${data.toolName}`);
              } else if (data.type === 'tool_result') {
                console.log(`✅ Tool result: ${data.toolName}`);
              } else if (data.type === 'text_delta') {
                fullResponse += data.content;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
      
      // Check if file was actually created
      const fs = require('fs');
      if (fs.existsSync('test-outputs/zara-test.txt')) {
        const content = fs.readFileSync('test-outputs/zara-test.txt', 'utf8');
        console.log('✅ REAL FILE CREATED!');
        console.log(`📄 File content: "${content}"`);
      } else {
        console.log('❌ File was not created - tools may still be simulated');
      }
      
    } else {
      console.log('❌ Failed to send command to Zara');
    }
  } catch (error) {
    console.error('❌ Test 1 error:', error.message);
  }
  
  // Test 2: Elena searches real files
  console.log('\n🔍 TEST 2: Elena searches REAL filesystem');
  try {
    const response = await fetch(`${API_BASE}/api/consulting-agents/admin/consulting-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test-session'
      },
      body: JSON.stringify({
        agentName: 'elena',
        message: 'Search for files containing "ReplitToolsDirect" to verify real tool integration',
        conversationId: TEST_CONVERSATION_ID + '-elena',
        userId: 'admin'
      })
    });

    if (response.ok) {
      console.log('✅ Elena search command sent');
      
      // Stream and check for real results
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let foundRealFiles = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        if (chunk.includes('replit-tools-direct.ts')) {
          foundRealFiles = true;
          console.log('✅ REAL FILES FOUND! Elena is using actual search_filesystem');
        }
      }
      
      if (!foundRealFiles) {
        console.log('⚠️ Real files not found in search - may be using simulated search');
      }
    }
  } catch (error) {
    console.error('❌ Test 2 error:', error.message);
  }
  
  // Test 3: Maya runs a real bash command
  console.log('\n💻 TEST 3: Maya executes REAL bash command');
  try {
    const response = await fetch(`${API_BASE}/api/consulting-agents/admin/consulting-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test-session'
      },
      body: JSON.stringify({
        agentName: 'maya',
        message: 'Run the bash command "echo Real command executed by Maya > test-outputs/maya-bash.txt" to verify real command execution',
        conversationId: TEST_CONVERSATION_ID + '-maya',
        userId: 'admin'
      })
    });

    if (response.ok) {
      console.log('✅ Maya bash command sent');
      
      // Wait a moment for command to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if command actually ran
      const fs = require('fs');
      if (fs.existsSync('test-outputs/maya-bash.txt')) {
        const content = fs.readFileSync('test-outputs/maya-bash.txt', 'utf8');
        console.log('✅ REAL BASH EXECUTED!');
        console.log(`📄 Command output: "${content.trim()}"`);
      } else {
        console.log('❌ Bash command did not execute - tools may be simulated');
      }
    }
  } catch (error) {
    console.error('❌ Test 3 error:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 REAL TOOLS INTEGRATION TEST COMPLETE');
  console.log('\n📊 SUMMARY:');
  console.log('If files were created and commands executed, agents are using REAL tools!');
  console.log('If not, the system may still be using simulations.');
  
  // Cleanup test files
  console.log('\n🧹 Cleaning up test files...');
  const fs = require('fs');
  try {
    if (fs.existsSync('test-outputs')) {
      fs.rmSync('test-outputs', { recursive: true, force: true });
      console.log('✅ Test files cleaned up');
    }
  } catch (e) {
    console.log('⚠️ Could not clean up test files');
  }
}

// Run the test
testAgentRealTools().catch(console.error);