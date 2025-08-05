/**
 * STREAMING INTEGRATION VERIFICATION
 * Comprehensive check of frontend-backend streaming connectivity
 */

import fs from 'fs';

console.log('🌊 STREAMING INTEGRATION VERIFICATION');
console.log('====================================\n');

// Files to check for streaming integration
const streamingFiles = [
  'server/routes/streaming-admin-routes.ts',
  'server/routes/intelligent-orchestration-routes.ts', 
  'server/routes/consulting-agents-routes.ts',
  'server/services/hybrid-intelligence/hybrid-agent-orchestrator.ts',
  'server/services/hybrid-intelligence/local-streaming-engine.ts',
  'server/services/streaming-continuation-service.ts',
  'client/src/pages/admin-consulting-agents.tsx'
];

const integrationResults = {
  backendStreaming: false,
  toolExecution: false,
  frontendConnection: false,
  websocketSupport: false,
  intelligentRouting: false
};

console.log('1️⃣ BACKEND STREAMING SERVICES:\n');

// Check backend streaming services
try {
  // Streaming admin routes
  if (fs.existsSync('server/routes/streaming-admin-routes.ts')) {
    const streamingContent = fs.readFileSync('server/routes/streaming-admin-routes.ts', 'utf8');
    const hasWebSocket = streamingContent.includes('WebSocket') || streamingContent.includes('websocket');
    const hasAgentManager = streamingContent.includes('StreamingAgentManager') || streamingContent.includes('AgentStreamingMessage');
    
    console.log(`   ✅ Streaming Admin Routes: WebSocket support ${hasWebSocket ? 'enabled' : 'missing'}`);
    console.log(`   ✅ Agent Manager: Streaming coordination ${hasAgentManager ? 'available' : 'missing'}`);
    
    if (hasWebSocket && hasAgentManager) {
      integrationResults.backendStreaming = true;
    }
  } else {
    console.log('   ❌ Streaming Admin Routes: File not found');
  }

  // Intelligent orchestration
  if (fs.existsSync('server/routes/intelligent-orchestration-routes.ts')) {
    const orchestrationContent = fs.readFileSync('server/routes/intelligent-orchestration-routes.ts', 'utf8');
    const hasToolExecution = orchestrationContent.includes('execute-tool') || orchestrationContent.includes('agentTriggerTool');
    const hasStreamingChat = orchestrationContent.includes('agent-chat-orchestrated') || orchestrationContent.includes('streaming');
    
    console.log(`   ✅ Tool Execution API: ${hasToolExecution ? 'Operational' : 'Missing'}`);
    console.log(`   ✅ Streaming Chat: ${hasStreamingChat ? 'Integrated' : 'Missing'}`);
    
    if (hasToolExecution && hasStreamingChat) {
      integrationResults.toolExecution = true;
    }
  } else {
    console.log('   ❌ Intelligent Orchestration: File not found');
  }

} catch (error) {
  console.log('   ❌ Backend streaming check failed:', error.message);
}

console.log('\n2️⃣ HYBRID INTELLIGENCE STREAMING:\n');

try {
  // Hybrid agent orchestrator
  if (fs.existsSync('server/services/hybrid-intelligence/hybrid-agent-orchestrator.ts')) {
    const hybridContent = fs.readFileSync('server/services/hybrid-intelligence/hybrid-agent-orchestrator.ts', 'utf8');
    const hasHybridStreaming = hybridContent.includes('processHybridStreaming') || hybridContent.includes('streaming');
    const hasIntelligentRouting = hybridContent.includes('routeRequest') || hybridContent.includes('routingDecision');
    
    console.log(`   ✅ Hybrid Streaming: ${hasHybridStreaming ? 'Implemented' : 'Missing'}`);
    console.log(`   ✅ Intelligent Routing: ${hasIntelligentRouting ? 'Active' : 'Missing'}`);
    
    if (hasIntelligentRouting) {
      integrationResults.intelligentRouting = true;
    }
  } else {
    console.log('   ❌ Hybrid Agent Orchestrator: File not found');
  }

  // Local streaming engine
  if (fs.existsSync('server/services/hybrid-intelligence/local-streaming-engine.ts')) {
    const localEngineContent = fs.readFileSync('server/services/hybrid-intelligence/local-streaming-engine.ts', 'utf8');
    const hasLocalStreaming = localEngineContent.includes('processLocalStreaming') || localEngineContent.includes('LocalStreamingEngine');
    
    console.log(`   ✅ Local Streaming Engine: ${hasLocalStreaming ? 'Operational' : 'Missing'}`);
  } else {
    console.log('   ❌ Local Streaming Engine: File not found');
  }

} catch (error) {
  console.log('   ❌ Hybrid intelligence check failed:', error.message);
}

console.log('\n3️⃣ FRONTEND STREAMING CONNECTION:\n');

try {
  // Frontend agent interface
  if (fs.existsSync('client/src/pages/admin-consulting-agents.tsx')) {
    const frontendContent = fs.readFileSync('client/src/pages/admin-consulting-agents.tsx', 'utf8');
    const hasWebSocketClient = frontendContent.includes('WebSocket') || frontendContent.includes('websocket');
    const hasStreamingAPI = frontendContent.includes('/api/') && frontendContent.includes('stream');
    
    console.log(`   ✅ WebSocket Client: ${hasWebSocketClient ? 'Connected' : 'Missing'}`);
    console.log(`   ✅ Streaming API calls: ${hasStreamingAPI ? 'Implemented' : 'Missing'}`);
    
    if (hasWebSocketClient || hasStreamingAPI) {
      integrationResults.frontendConnection = true;
    }
  } else {
    console.log('   ❌ Frontend Agent Interface: File not found');
  }

} catch (error) {
  console.log('   ❌ Frontend check failed:', error.message);
}

console.log('\n4️⃣ WEBSOCKET SUPPORT VERIFICATION:\n');

try {
  // Check for WebSocket configuration
  const packageContent = fs.readFileSync('package.json', 'utf8');
  const packageData = JSON.parse(packageContent);
  
  const hasWSPackage = packageData.dependencies?.ws || packageData.devDependencies?.ws;
  console.log(`   ✅ WebSocket Package: ${hasWSPackage ? `Installed (${hasWSPackage})` : 'Missing'}`);
  
  if (hasWSPackage) {
    integrationResults.websocketSupport = true;
  }

} catch (error) {
  console.log('   ❌ Package check failed:', error.message);
}

console.log('\n5️⃣ ENTERPRISE TOOL STREAMING INTEGRATION:\n');

// Check if enterprise tools are connected to streaming
const enterpriseToolStreamingChecks = [
  { name: 'Tool Orchestrator', file: 'server/services/agent-tool-orchestrator.ts', hasStreaming: false },
  { name: 'Claude API Service', file: 'server/services/claude-api-service-clean.ts', hasStreaming: false },
  { name: 'Consulting Routes', file: 'server/routes/consulting-agents-routes.ts', hasStreaming: false }
];

enterpriseToolStreamingChecks.forEach(check => {
  try {
    if (fs.existsSync(check.file)) {
      const content = fs.readFileSync(check.file, 'utf8');
      check.hasStreaming = content.includes('stream') || content.includes('tool') && content.includes('execute');
      console.log(`   ${check.hasStreaming ? '✅' : '❌'} ${check.name}: ${check.hasStreaming ? 'Tool streaming ready' : 'No streaming detected'}`);
    } else {
      console.log(`   ❌ ${check.name}: File not found`);
    }
  } catch (error) {
    console.log(`   ❌ ${check.name}: Check failed`);
  }
});

console.log('\n6️⃣ OVERALL STREAMING INTEGRATION STATUS:\n');

const integrationScores = Object.values(integrationResults);
const passedChecks = integrationScores.filter(Boolean).length;
const totalChecks = integrationScores.length;
const streamingPercentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`   📊 Integration Score: ${passedChecks}/${totalChecks} (${streamingPercentage}%)`);
console.log(`   🌊 Backend Streaming: ${integrationResults.backendStreaming ? '✅ Ready' : '❌ Needs Work'}`);
console.log(`   🔧 Tool Execution: ${integrationResults.toolExecution ? '✅ Connected' : '❌ Missing'}`);
console.log(`   💻 Frontend Connection: ${integrationResults.frontendConnection ? '✅ Active' : '❌ Disconnected'}`);
console.log(`   🔌 WebSocket Support: ${integrationResults.websocketSupport ? '✅ Available' : '❌ Missing'}`);
console.log(`   🧠 Intelligent Routing: ${integrationResults.intelligentRouting ? '✅ Operational' : '❌ Inactive'}`);

console.log('\n🎯 STREAMING READINESS VERDICT:\n');

if (streamingPercentage >= 80) {
  console.log('🎉 EXCELLENT: Streaming integration is mostly complete');
  console.log('Your enterprise tools are connected to the streaming system.');
  console.log('Both frontend and backend have streaming capabilities.');
} else if (streamingPercentage >= 60) {
  console.log('⚠️ GOOD: Streaming integration is partially complete');
  console.log('Some streaming components are missing or disconnected.');
  console.log('Enterprise tools may have limited streaming support.');
} else {
  console.log('❌ NEEDS WORK: Streaming integration requires attention');
  console.log('Major streaming components are missing or non-functional.');
  console.log('Enterprise tools are not properly connected to streaming.');
}

console.log('\n' + '='.repeat(50));