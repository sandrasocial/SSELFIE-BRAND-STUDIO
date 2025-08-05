/**
 * COMPREHENSIVE TOOL INTEGRATION VERIFICATION
 * Validates that all 12 enterprise tools are properly connected
 */

import fs from 'fs';

console.log('🔍 COMPREHENSIVE TOOL INTEGRATION VERIFICATION');
console.log('==============================================\n');

// Read the Claude API service file
const claudeServiceContent = fs.readFileSync('server/services/claude-api-service-clean.ts', 'utf8');

// Read the agent tool orchestrator file  
const orchestratorContent = fs.readFileSync('server/services/agent-tool-orchestrator.ts', 'utf8');

// Expected enterprise tools
const expectedTools = [
  'search_filesystem',
  'str_replace_based_edit_tool', 
  'bash',
  'get_latest_lsp_diagnostics',
  'packager_tool',
  'programming_language_install_tool',
  'ask_secrets',
  'check_secrets',
  'execute_sql_tool',
  'web_search',
  'mark_completed_and_get_feedback',
  'report_progress'
];

console.log('1️⃣ CLAUDE API TOOL REGISTRY VERIFICATION:\n');

// Check tool definitions in Claude API
const toolDefinitionMatches = expectedTools.map(tool => {
  const hasDefinition = claudeServiceContent.includes(`name: '${tool}'`);
  console.log(`   ${hasDefinition ? '✅' : '❌'} ${tool} - ${hasDefinition ? 'Registered' : 'MISSING'}`);
  return hasDefinition;
});

const registeredCount = toolDefinitionMatches.filter(Boolean).length;
console.log(`\n   📊 Registry Status: ${registeredCount}/12 tools registered\n`);

console.log('2️⃣ CLAUDE API EXECUTION HANDLERS VERIFICATION:\n');

// Check execution handlers in Claude API service
const executionHandlerMatches = expectedTools.map(tool => {
  const hasHandler = claudeServiceContent.includes(`case '${tool}':`);
  console.log(`   ${hasHandler ? '✅' : '❌'} ${tool} - ${hasHandler ? 'Handler exists' : 'MISSING HANDLER'}`);
  return hasHandler;
});

const handlerCount = executionHandlerMatches.filter(Boolean).length;
console.log(`\n   📊 Handler Status: ${handlerCount}/12 execution handlers\n`);

console.log('3️⃣ ORCHESTRATOR BYPASS VERIFICATION:\n');

// Check bypass execution in orchestrator
const bypassMatches = expectedTools.map(tool => {
  const hasBypass = orchestratorContent.includes(`case '${tool}':`);
  console.log(`   ${hasBypass ? '✅' : '❌'} ${tool} - ${hasBypass ? 'Bypass ready' : 'MISSING BYPASS'}`);
  return hasBypass;
});

const bypassCount = bypassMatches.filter(Boolean).length;
console.log(`\n   📊 Bypass Status: ${bypassCount}/12 bypass handlers\n`);

console.log('4️⃣ TOOL IMPORT VERIFICATION:\n');

// Check for tool imports
const importChecks = [
  { tool: 'search_filesystem', hasImport: claudeServiceContent.includes("import('../tools/search_filesystem')") },
  { tool: 'str_replace_based_edit_tool', hasImport: claudeServiceContent.includes("import('../tools/str_replace_based_edit_tool')") },
  { tool: 'bash', hasImport: claudeServiceContent.includes("import('../tools/bash')") },
  { tool: 'get_latest_lsp_diagnostics', hasImport: claudeServiceContent.includes("import('../tools/get_latest_lsp_diagnostics')") },
  { tool: 'execute_sql_tool', hasImport: claudeServiceContent.includes("import('../tools/execute_sql_tool')") },
  { tool: 'web_search', hasImport: claudeServiceContent.includes("import('../tools/web_search')") },
  { tool: 'mark_completed_and_get_feedback', hasImport: claudeServiceContent.includes("import('../tools/mark_completed_and_get_feedback')") },
  { tool: 'report_progress', hasImport: claudeServiceContent.includes("import('../tools/report_progress')") }
];

importChecks.forEach(check => {
  console.log(`   ${check.hasImport ? '✅' : '⚠️'} ${check.tool} - ${check.hasImport ? 'Import found' : 'Dynamic import or bypass'}`);
});

console.log('\n5️⃣ CRITICAL INTEGRATION ISSUES:\n');

// Identify any missing components
const missingRegistry = expectedTools.filter((tool, index) => !toolDefinitionMatches[index]);
const missingHandlers = expectedTools.filter((tool, index) => !executionHandlerMatches[index]);
const missingBypass = expectedTools.filter((tool, index) => !bypassMatches[index]);

if (missingRegistry.length > 0) {
  console.log(`   ❌ MISSING REGISTRY: ${missingRegistry.join(', ')}`);
} else {
  console.log('   ✅ All tools registered in Claude API');
}

if (missingHandlers.length > 0) {
  console.log(`   ❌ MISSING HANDLERS: ${missingHandlers.join(', ')}`);
} else {
  console.log('   ✅ All execution handlers implemented');
}

if (missingBypass.length > 0) {
  console.log(`   ❌ MISSING BYPASS: ${missingBypass.join(', ')}`);
} else {
  console.log('   ✅ All bypass handlers implemented');
}

console.log('\n6️⃣ OVERALL INTEGRATION STATUS:\n');

const totalIntegrationScore = registeredCount + handlerCount + bypassCount;
const maxScore = 36; // 12 tools × 3 integration points

const integrationPercentage = Math.round((totalIntegrationScore / maxScore) * 100);

console.log(`   📊 Integration Score: ${totalIntegrationScore}/${maxScore} (${integrationPercentage}%)`);
console.log(`   🎯 Registry Coverage: ${Math.round((registeredCount/12)*100)}%`);
console.log(`   🔧 Handler Coverage: ${Math.round((handlerCount/12)*100)}%`);
console.log(`   ⚡ Bypass Coverage: ${Math.round((bypassCount/12)*100)}%`);

if (integrationPercentage === 100) {
  console.log('\n   🎉 PERFECT INTEGRATION - All enterprise tools fully connected!');
} else if (integrationPercentage >= 90) {
  console.log('\n   ✅ EXCELLENT INTEGRATION - Minor gaps may exist');
} else if (integrationPercentage >= 75) {
  console.log('\n   ⚠️ GOOD INTEGRATION - Some tools may not be fully connected');
} else {
  console.log('\n   ❌ INTEGRATION INCOMPLETE - Major gaps detected');
}

console.log('\n🚀 ENTERPRISE TOOL READINESS ASSESSMENT:');
console.log('=========================================');

const readyTools = expectedTools.filter((tool, index) => 
  toolDefinitionMatches[index] && 
  executionHandlerMatches[index] && 
  bypassMatches[index]
);

console.log(`✅ Fully Ready Tools: ${readyTools.length}/12`);
readyTools.forEach(tool => console.log(`   • ${tool}`));

if (readyTools.length === 12) {
  console.log('\n🎊 ALL ENTERPRISE TOOLS ARE READY FOR AGENT USE!');
} else {
  console.log(`\n⚠️ ${12 - readyTools.length} tools need additional integration work`);
}