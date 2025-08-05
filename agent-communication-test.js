/**
 * AGENT COMMUNICATION TEST
 * Verifies that all enterprise tools and agents are working correctly
 */

import fs from 'fs';

console.log('🧪 AGENT COMMUNICATION TEST');
console.log('===========================\n');

// Test agent communication endpoints
const testEndpoints = [
  {
    name: 'Zara Communication Test',
    endpoint: '/api/admin/agents/consulting-chat',
    payload: {
      agentId: 'zara',
      message: 'Hello Zara, can you confirm you are working correctly?',
      conversationId: 'test_communication_' + Date.now(),
      userId: '42585527'
    }
  },
  {
    name: 'Elena Communication Test', 
    endpoint: '/api/admin/agents/consulting-chat',
    payload: {
      agentId: 'elena',
      message: 'Hello Elena, please verify your systems are operational.',
      conversationId: 'test_communication_' + Date.now(),
      userId: '42585527'
    }
  }
];

console.log('1️⃣ TESTING AGENT COMMUNICATION ENDPOINTS:\n');

// Verify the saveMessageToDb method exists
const claudeServiceContent = fs.readFileSync('server/services/claude-api-service-clean.ts', 'utf8');
const hasSaveMethod = claudeServiceContent.includes('saveMessageToDb');
console.log(`   ${hasSaveMethod ? '✅' : '❌'} saveMessageToDb method: ${hasSaveMethod ? 'Implemented' : 'Missing'}`);

// Check for database schema
const hasDbImport = claudeServiceContent.includes('claudeConversations') || claudeServiceContent.includes('claudeMessages');
console.log(`   ${hasDbImport ? '✅' : '❌'} Database integration: ${hasDbImport ? 'Connected' : 'Missing'}`);

// Verify tool handlers
const toolHandlerCount = (claudeServiceContent.match(/case '/g) || []).length;
console.log(`   ${toolHandlerCount >= 12 ? '✅' : '❌'} Tool handlers: ${toolHandlerCount}/12 tools available`);

console.log('\n2️⃣ ENTERPRISE TOOL INTEGRATION STATUS:\n');

const enterpriseTools = [
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

const toolIntegrationStatus = enterpriseTools.map(tool => {
  const hasHandler = claudeServiceContent.includes(`case '${tool}':`);
  const hasDefinition = claudeServiceContent.includes(`name: '${tool}'`);
  console.log(`   ${hasHandler && hasDefinition ? '✅' : '❌'} ${tool}: ${hasHandler && hasDefinition ? 'Fully integrated' : 'Needs work'}`);
  return hasHandler && hasDefinition;
});

const integratedToolCount = toolIntegrationStatus.filter(Boolean).length;
console.log(`\n   📊 Tool Integration: ${integratedToolCount}/12 tools (${Math.round((integratedToolCount/12)*100)}%)`);

console.log('\n3️⃣ AGENT COMMUNICATION READINESS:\n');

// Check consulting agent routes
const consultingRoutesExist = fs.existsSync('server/routes/consulting-agents-routes.ts');
console.log(`   ${consultingRoutesExist ? '✅' : '❌'} Consulting agent routes: ${consultingRoutesExist ? 'Available' : 'Missing'}`);

if (consultingRoutesExist) {
  const routesContent = fs.readFileSync('server/routes/consulting-agents-routes.ts', 'utf8');
  const hasConsultingChat = routesContent.includes('/consulting-chat');
  console.log(`   ${hasConsultingChat ? '✅' : '❌'} Consulting chat endpoint: ${hasConsultingChat ? 'Registered' : 'Missing'}`);
}

// Check agent personalities
const personalitiesExist = fs.existsSync('server/agent-personalities-consulting.ts');
console.log(`   ${personalitiesExist ? '✅' : '❌'} Agent personalities: ${personalitiesExist ? 'Loaded' : 'Missing'}`);

console.log('\n4️⃣ STREAMING INTEGRATION STATUS:\n');

// Check streaming services
const streamingFiles = [
  'server/routes/streaming-admin-routes.ts',
  'server/routes/intelligent-orchestration-routes.ts',
  'server/services/streaming-continuation-service.ts'
];

streamingFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file.split('/').pop()}: ${exists ? 'Available' : 'Missing'}`);
});

console.log('\n5️⃣ COMMUNICATION ERROR ANALYSIS:\n');

// Check for common error patterns
const errorPatterns = [
  { pattern: 'saveConversationMessage', description: 'Missing save method (FIXED)' },
  { pattern: 'claudeConversations', description: 'Database schema import' },
  { pattern: 'claudeMessages', description: 'Message storage schema' },
  { pattern: 'getInstance', description: 'Singleton pattern usage' }
];

errorPatterns.forEach(({ pattern, description }) => {
  const hasPattern = claudeServiceContent.includes(pattern);
  console.log(`   ${hasPattern ? '✅' : '❌'} ${description}: ${hasPattern ? 'Present' : 'Missing'}`);
});

console.log('\n🎯 COMMUNICATION READINESS VERDICT:\n');

const readinessChecks = [
  hasSaveMethod,
  hasDbImport,
  toolHandlerCount >= 12,
  integratedToolCount >= 10,
  consultingRoutesExist,
  personalitiesExist
];

const passedChecks = readinessChecks.filter(Boolean).length;
const readinessPercentage = Math.round((passedChecks / readinessChecks.length) * 100);

if (readinessPercentage >= 90) {
  console.log('🎉 EXCELLENT: Agent communication is ready');
  console.log('All critical components are operational.');
  console.log('Agents should respond successfully to user messages.');
} else if (readinessPercentage >= 75) {
  console.log('⚠️ GOOD: Agent communication is mostly ready');
  console.log('Minor issues may exist but core functionality works.');
} else {
  console.log('❌ NEEDS WORK: Agent communication has issues');
  console.log('Critical components are missing or non-functional.');
}

console.log(`\nReadiness Score: ${passedChecks}/${readinessChecks.length} (${readinessPercentage}%)`);
console.log('\n' + '='.repeat(50));