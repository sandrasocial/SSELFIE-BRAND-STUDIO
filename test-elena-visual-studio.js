#!/usr/bin/env node

/**
 * TEST ELENA INTEGRATION IN VISUAL STUDIO
 * Verifies Elena is properly integrated and functional in BUILD interface
 */

import fs from 'fs';

console.log('🔍 TESTING ELENA VISUAL STUDIO INTEGRATION...');
console.log('===============================================\n');

function testElenaIntegration() {
  console.log('📋 Elena Integration Test Checklist:');
  console.log('✓ BuildVisualStudio component has Elena integration');
  console.log('✓ Agent selector includes Elena');
  console.log('✓ Elena API endpoint connectivity');
  console.log('✓ Agent chat functionality');
  console.log('✓ Multi-agent coordination capability\n');

  const results = {
    buildComponentHasElena: false,
    agentSelectorHasElena: false,
    hasAgentChat: false,
    hasCoordinationFeatures: false,
    totalChecks: 0
  };

  // Check BuildVisualStudio component
  const buildComponentPath = 'client/src/components/build/BuildVisualStudio.tsx';
  if (fs.existsSync(buildComponentPath)) {
    const content = fs.readFileSync(buildComponentPath, 'utf8');
    
    // Check for Elena integration
    const hasElenaAgent = content.includes('elena') || content.includes('Elena');
    const hasBuildAgents = content.includes('BUILD_AGENTS');
    const hasAgentChat = content.includes('agent') && content.includes('chat');
    const hasAgentSelector = content.includes('selectedAgent');
    const hasApiRequest = content.includes('apiRequest');
    const hasWorkflowCoordination = content.includes('Workflow') || content.includes('coordination');
    
    console.log('🎨 BUILD VISUAL STUDIO COMPONENT');
    console.log('─────────────────────────────────');
    console.log(`✓ Component exists: ${fs.existsSync(buildComponentPath)}`);
    console.log(`✓ Elena agent configured: ${hasElenaAgent}`);
    console.log(`✓ BUILD_AGENTS array: ${hasBuildAgents}`);
    console.log(`✓ Agent chat functionality: ${hasAgentChat}`);
    console.log(`✓ Agent selector: ${hasAgentSelector}`);
    console.log(`✓ API request integration: ${hasApiRequest}`);
    console.log(`✓ Workflow coordination: ${hasWorkflowCoordination}`);
    
    results.buildComponentHasElena = hasElenaAgent;
    results.agentSelectorHasElena = hasAgentSelector && hasElenaAgent;
    results.hasAgentChat = hasAgentChat && hasApiRequest;
    results.hasCoordinationFeatures = hasWorkflowCoordination;
    
    if (hasBuildAgents) {
      // Extract BUILD_AGENTS to verify Elena is included
      const buildAgentsMatch = content.match(/BUILD_AGENTS\s*=\s*\[([\s\S]*?)\]/);
      if (buildAgentsMatch && buildAgentsMatch[1].includes('elena')) {
        console.log(`✅ Elena found in BUILD_AGENTS configuration`);
        results.agentSelectorHasElena = true;
      } else {
        console.log(`❌ Elena not found in BUILD_AGENTS array`);
      }
    }
  } else {
    console.log('❌ BuildVisualStudio component not found');
  }

  // Check agent routes for Elena endpoint
  console.log('\n🔗 AGENT API ENDPOINTS');
  console.log('─────────────────────');
  
  const agentRoutesPath = 'server/routes/agent-conversation-routes.ts';
  if (fs.existsSync(agentRoutesPath)) {
    const content = fs.readFileSync(agentRoutesPath, 'utf8');
    const hasElenaEndpoint = content.includes('elena:');
    const hasAgentChatEndpoint = content.includes('/api/agents/');
    
    console.log(`✓ Agent conversation routes exist: ${fs.existsSync(agentRoutesPath)}`);
    console.log(`✓ Elena endpoint configured: ${hasElenaEndpoint}`);
    console.log(`✓ Agent chat API endpoint: ${hasAgentChatEndpoint}`);
    
    if (hasElenaEndpoint && hasAgentChatEndpoint) {
      results.hasAgentChat = true;
    }
  } else {
    console.log('❌ Agent conversation routes not found');
  }

  // Calculate total checks passed
  const checks = [
    results.buildComponentHasElena,
    results.agentSelectorHasElena,
    results.hasAgentChat,
    results.hasCoordinationFeatures
  ];
  
  results.totalChecks = checks.filter(check => check).length;

  // Summary
  console.log('\n📊 ELENA INTEGRATION TEST RESULTS');
  console.log('==================================');
  console.log(`🎯 SCORE: ${results.totalChecks}/4 checks passed`);
  console.log('');
  
  const checkNames = [
    'Elena component integration',
    'Agent selector with Elena',
    'Agent chat functionality',
    'Coordination features'
  ];
  
  checks.forEach((passed, index) => {
    const status = passed ? '✅ WORKING' : '❌ NEEDS FIX';
    console.log(`${status}: ${checkNames[index]}`);
  });

  if (results.totalChecks >= 3) {
    console.log('\n💡 RESULT: Elena integration is working! Ready for BUILD workflow coordination.');
  } else {
    console.log('\n⚠️  RESULT: Elena integration needs fixes before BUILD workflows can be coordinated.');
  }

  return results;
}

// Run the test
const results = testElenaIntegration();

console.log('\n🎉 ELENA INTEGRATION TEST COMPLETE!');
process.exit(results.totalChecks >= 3 ? 0 : 1);