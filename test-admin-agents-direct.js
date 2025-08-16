#!/usr/bin/env node

/**
 * DIRECT ADMIN AGENT TESTING - FULL CLAUDE INTELLIGENCE
 * Tests Elena, Quinn, and Zara with actual Claude API calls
 * Bypasses server startup issues to verify agent functionality
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import path from 'path';

// Admin agents with full personalities and capabilities
const ADMIN_AGENTS = {
  elena: {
    name: "Elena",
    role: "Administrative Coordination AI",
    specialty: "Complex multi-agent coordination and executive reporting",
    personality: "Professional, analytical, detail-oriented",
    systemPrompt: `You are Elena, Sandra's Administrative Coordination AI agent. You excel at complex multi-agent coordination, executive reporting, and system analysis. You provide clear, actionable insights with professional precision.`
  },
  quinn: {
    name: "Quinn", 
    role: "Quality Assurance AI",
    specialty: "System testing, code quality, and validation protocols",
    personality: "Methodical, thorough, problem-solving focused",
    systemPrompt: `You are Quinn, Sandra's Quality Assurance AI agent. You specialize in system testing, code quality analysis, and validation protocols. You provide detailed technical assessments with actionable recommendations.`
  },
  zara: {
    name: "Zara",
    role: "Build and Deployment AI", 
    specialty: "Build systems, TypeScript compilation, deployment readiness",
    personality: "Efficient, technical, solution-oriented",
    systemPrompt: `You are Zara, Sandra's Build and Deployment AI agent. You specialize in build systems, TypeScript compilation, and deployment readiness. You provide technical solutions with clear implementation steps.`
  }
};

async function testAdminAgent(agentId, message) {
  console.log(`\n🤖 Testing ${ADMIN_AGENTS[agentId].name} (${agentId.toUpperCase()})...`);
  console.log(`📝 Message: ${message}`);
  
  try {
    // Check for Claude API key
    const claudeApiKey = process.env.ANTHROPIC_API_KEY;
    if (!claudeApiKey) {
      return {
        agent: agentId,
        error: "Missing ANTHROPIC_API_KEY - admin agents require Claude API access",
        status: "blocked"
      };
    }

    const anthropic = new Anthropic({ apiKey: claudeApiKey });
    const agent = ADMIN_AGENTS[agentId];

    // Read project context
    const projectContext = await getProjectContext();
    
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: `${agent.systemPrompt}

CURRENT PROJECT CONTEXT:
${projectContext}

You have access to the complete SSELFIE Studio project with 4 months of development work and 10 real users. Provide accurate, actionable responses based on your specialty.`,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });

    const response = completion.content[0].text;
    
    console.log(`✅ ${agent.name} Response:`);
    console.log(`${response.substring(0, 500)}${response.length > 500 ? '...' : ''}`);
    
    return {
      agent: agentId,
      agentName: agent.name,
      specialty: agent.specialty,
      response: response,
      status: "success",
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error testing ${agentId}:`, error.message);
    return {
      agent: agentId,
      error: error.message,
      status: "failed"
    };
  }
}

async function getProjectContext() {
  try {
    const replitMd = await fs.readFile('replit.md', 'utf8');
    const packageJson = await fs.readFile('package.json', 'utf8');
    
    return `
PROJECT: SSELFIE Studio - AI Personal Branding Platform
STATUS: Production system with 10 real users, 4 months development

RECENT STATUS:
${replitMd.substring(0, 1000)}

DEPENDENCIES:
${JSON.parse(packageJson).dependencies ? Object.keys(JSON.parse(packageJson).dependencies).slice(0, 10).join(', ') : 'Loading...'}

CURRENT FOCUS: Testing admin consulting agents with Claude intelligence after resolving database schema issues.
`;
  } catch (error) {
    return "Project context loading...";
  }
}

async function runAdminAgentTests() {
  console.log('🚀 STARTING COMPREHENSIVE ADMIN AGENT TESTING');
  console.log('Testing Elena, Quinn, and Zara with full Claude intelligence...\n');

  const tests = [
    {
      agentId: 'elena',
      message: 'Elena, provide a comprehensive status report on the SSELFIE Studio coordination system. What is working well and what needs attention?'
    },
    {
      agentId: 'quinn', 
      message: 'Quinn, analyze the current system status and provide detailed QA feedback on what has been completed and what requires testing.'
    },
    {
      agentId: 'zara',
      message: 'Zara, check the build system status and deployment readiness. Are all TypeScript errors resolved and is the system ready for production?'
    }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testAdminAgent(test.agentId, test.message);
    results.push(result);
  }

  console.log('\n📊 ADMIN AGENT TEST SUMMARY:');
  console.log('='*50);
  
  results.forEach(result => {
    console.log(`${result.agentName || result.agent}: ${result.status}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });

  // Save results
  await fs.writeFile('admin-agent-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Test results saved to admin-agent-test-results.json');

  return results;
}

// Run the tests
runAdminAgentTests().catch(console.error);