#!/usr/bin/env node

/**
 * FULL ADMIN DEVELOPMENT TEAM TEST
 * Tests Elena, Quinn, and Zara as development team members
 * with full tool access, Claude intelligence, and bypass system
 */

import axios from 'axios';

const ADMIN_TOKEN = 'sandra-admin-2025';
const SERVER_URL = 'http://localhost:5000';

// Test cases for each admin agent with their development capabilities
const DEV_TEAM_TESTS = [
  {
    agent: 'elena',
    agentName: 'Elena (Strategic Coordinator)',
    message: 'Elena, I need you to coordinate the team for system improvements. Use your tools to analyze the current project status and assign appropriate tasks to Quinn and Zara.',
    expectation: 'Should use search_filesystem and coordinate_agent tools'
  },
  {
    agent: 'quinn', 
    agentName: 'Quinn (QA Engineer)',
    message: 'Quinn, please run a comprehensive quality check on the system. Use get_latest_lsp_diagnostics to check for errors and execute_sql_tool to verify database integrity.',
    expectation: 'Should use diagnostic tools and SQL validation'
  },
  {
    agent: 'zara',
    agentName: 'Zara (Build Engineer)', 
    message: 'Zara, I need you to check build status and fix any TypeScript compilation issues. Use bash tool to run build commands and str_replace_based_edit_tool to fix any code issues you find.',
    expectation: 'Should use bash and file editing tools'
  }
];

async function testAdminDevTeam() {
  console.log('🚀 TESTING FULL ADMIN DEVELOPMENT TEAM');
  console.log('Testing Elena, Quinn, and Zara with native tool access...\n');

  // First check if server is running
  try {
    const healthCheck = await axios.get(`${SERVER_URL}/api/health`, { timeout: 5000 });
    console.log('✅ Server is running:', healthCheck.data);
  } catch (error) {
    console.log('❌ Server not accessible. Starting tests with direct approach...');
    return;
  }

  const results = [];

  for (const test of DEV_TEAM_TESTS) {
    console.log(`\n🤖 Testing ${test.agentName}...`);
    console.log(`📝 Task: ${test.message.substring(0, 100)}...`);
    console.log(`🎯 Expected: ${test.expectation}`);

    try {
      const startTime = Date.now();

      const response = await axios.post(
        `${SERVER_URL}/api/consulting-agents/admin/consulting-chat`,
        {
          agentId: test.agent,
          message: test.message,
          adminToken: ADMIN_TOKEN,
          adminBypass: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'x-admin-token': ADMIN_TOKEN
          },
          timeout: 30000
        }
      );

      const duration = Date.now() - startTime;

      console.log(`✅ ${test.agentName} Response (${duration}ms):`);
      
      if (response.data) {
        const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        console.log(responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''));

        results.push({
          agent: test.agent,
          agentName: test.agentName,
          status: 'success',
          duration: duration,
          toolsUsed: extractToolsUsed(responseText),
          responseLength: responseText.length
        });
      } else {
        console.log('No response data received');
        results.push({
          agent: test.agent,
          agentName: test.agentName, 
          status: 'no_response',
          duration: duration
        });
      }

    } catch (error) {
      console.log(`❌ ${test.agentName} Error:`, error.message);
      results.push({
        agent: test.agent,
        agentName: test.agentName,
        status: 'failed',
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n📊 ADMIN DEVELOPMENT TEAM TEST RESULTS:');
  console.log('=' * 60);
  
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : 
                  result.status === 'no_response' ? '⚠️' : '❌';
    console.log(`${status} ${result.agentName}: ${result.status}`);
    
    if (result.toolsUsed && result.toolsUsed.length > 0) {
      console.log(`   🔧 Tools Used: ${result.toolsUsed.join(', ')}`);
    }
    if (result.duration) {
      console.log(`   ⏱️ Duration: ${result.duration}ms`);
    }
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
  });

  return results;
}

function extractToolsUsed(responseText) {
  const tools = [];
  const toolPatterns = [
    /str_replace_based_edit_tool/g,
    /search_filesystem/g,
    /get_latest_lsp_diagnostics/g,
    /execute_sql_tool/g,
    /bash/g,
    /coordinate_agent/g,
    /restart_workflow/g
  ];

  toolPatterns.forEach(pattern => {
    const matches = responseText.match(pattern);
    if (matches) {
      const toolName = pattern.source.replace(/\\/g, '').replace(/g$/, '');
      if (!tools.includes(toolName)) {
        tools.push(toolName);
      }
    }
  });

  return tools;
}

// Run the tests
testAdminDevTeam().catch(console.error);