#!/usr/bin/env node

/**
 * COMPREHENSIVE AGENT AUDIT FOR VISUAL STUDIO
 * Tests all agent capabilities: memory, file operations, handoffs, learning
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 COMPREHENSIVE AGENT AUDIT STARTING...');
console.log('=====================================\n');

async function auditAgentSystems() {
  console.log('📋 AUDIT CHECKLIST:');
  console.log('✓ Memory system (conversation history)');
  console.log('✓ File operations (create/modify/read)');
  console.log('✓ Agent handoff protocols');
  console.log('✓ Learning system (conversation storage)');
  console.log('✓ API connectivity (Claude integration)');
  console.log('✓ Fallback systems');
  console.log('✓ Visual studio integration\n');

  const auditResults = {
    memorySystem: false,
    fileOperations: false,
    handoffProtocols: false,
    learningSystem: false,
    apiConnectivity: false,
    fallbackSystems: false,
    visualStudioIntegration: false,
    totalScore: 0,
    details: {}
  };

  // 1. MEMORY SYSTEM AUDIT
  console.log('🧠 1. MEMORY SYSTEM AUDIT');
  console.log('─────────────────────────');
  
  try {
    // Check ConversationManager exists and has proper methods
    const conversationManagerPath = 'server/agents/ConversationManager.ts';
    if (fs.existsSync(conversationManagerPath)) {
      const content = fs.readFileSync(conversationManagerPath, 'utf8');
      const hasMemoryRetrieval = content.includes('retrieveAgentMemory');
      const hasConversationSummary = content.includes('createConversationSummary');
      const hasMemorySaving = content.includes('saveAgentMemory');
      
      console.log(`✓ ConversationManager exists: ${fs.existsSync(conversationManagerPath)}`);
      console.log(`✓ Memory retrieval: ${hasMemoryRetrieval}`);
      console.log(`✓ Conversation summary: ${hasConversationSummary}`);
      console.log(`✓ Memory saving: ${hasMemorySaving}`);
      
      auditResults.memorySystem = hasMemoryRetrieval && hasConversationSummary && hasMemorySaving;
      auditResults.details.memorySystem = {
        exists: true,
        hasMemoryRetrieval,
        hasConversationSummary,
        hasMemorySaving
      };
    } else {
      console.log('❌ ConversationManager not found');
      auditResults.details.memorySystem = { exists: false };
    }
  } catch (error) {
    console.log(`❌ Memory system error: ${error.message}`);
    auditResults.details.memorySystem = { error: error.message };
  }

  // 2. FILE OPERATIONS AUDIT
  console.log('\n📁 2. FILE OPERATIONS AUDIT');
  console.log('───────────────────────────');
  
  try {
    const agentCodebaseIntegrationPath = 'server/agents/agent-codebase-integration.ts';
    if (fs.existsSync(agentCodebaseIntegrationPath)) {
      const content = fs.readFileSync(agentCodebaseIntegrationPath, 'utf8');
      const hasReadFile = content.includes('readFile');
      const hasWriteFile = content.includes('writeFile');
      const hasSecurityChecks = content.includes('allowedPaths');
      
      console.log(`✓ Agent codebase integration exists: ${fs.existsSync(agentCodebaseIntegrationPath)}`);
      console.log(`✓ File reading capability: ${hasReadFile}`);
      console.log(`✓ File writing capability: ${hasWriteFile}`);
      console.log(`✓ Security checks: ${hasSecurityChecks}`);
      
      auditResults.fileOperations = hasReadFile && hasWriteFile && hasSecurityChecks;
      auditResults.details.fileOperations = {
        exists: true,
        hasReadFile,
        hasWriteFile,
        hasSecurityChecks
      };
    } else {
      console.log('❌ Agent codebase integration not found');
      auditResults.details.fileOperations = { exists: false };
    }
  } catch (error) {
    console.log(`❌ File operations error: ${error.message}`);
    auditResults.details.fileOperations = { error: error.message };
  }

  // 3. HANDOFF PROTOCOLS AUDIT
  console.log('\n🤝 3. HANDOFF PROTOCOLS AUDIT');
  console.log('─────────────────────────────');
  
  try {
    const coordinationProtocolPath = 'server/agents/agent-coordination-protocol.ts';
    const handoffSystemPath = 'server/routes/enhanced-handoff-system.ts';
    
    const hasCoordinationProtocol = fs.existsSync(coordinationProtocolPath);
    const hasHandoffSystem = fs.existsSync(handoffSystemPath);
    
    console.log(`✓ Coordination protocol: ${hasCoordinationProtocol}`);
    console.log(`✓ Handoff system: ${hasHandoffSystem}`);
    
    // Check agent conversation routes for Elena coordination
    const conversationRoutesPath = 'server/routes/agent-conversation-routes.ts';
    if (fs.existsSync(conversationRoutesPath)) {
      const content = fs.readFileSync(conversationRoutesPath, 'utf8');
      const hasElenaConfig = content.includes('elena:');
      const hasWorkflowCoordination = content.includes('workflow');
      
      console.log(`✓ Elena configuration: ${hasElenaConfig}`);
      console.log(`✓ Workflow coordination: ${hasWorkflowCoordination}`);
      
      auditResults.handoffProtocols = hasCoordinationProtocol && hasElenaConfig;
      auditResults.details.handoffProtocols = {
        hasCoordinationProtocol,
        hasHandoffSystem,
        hasElenaConfig,
        hasWorkflowCoordination
      };
    }
  } catch (error) {
    console.log(`❌ Handoff protocols error: ${error.message}`);
    auditResults.details.handoffProtocols = { error: error.message };
  }

  // 4. LEARNING SYSTEM AUDIT
  console.log('\n🎓 4. LEARNING SYSTEM AUDIT');
  console.log('───────────────────────────');
  
  try {
    // Check for conversation storage in database
    const storageFiles = ['server/storage.ts', 'server/db.ts'];
    let hasConversationStorage = false;
    
    for (const file of storageFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('agentConversations') || content.includes('conversation')) {
          hasConversationStorage = true;
          break;
        }
      }
    }
    
    // Check for learning capabilities
    const learningSystemPath = 'server/agents/agent-learning-system.ts';
    const hasLearningSystem = fs.existsSync(learningSystemPath);
    
    console.log(`✓ Conversation storage: ${hasConversationStorage}`);
    console.log(`✓ Learning system: ${hasLearningSystem}`);
    
    auditResults.learningSystem = hasConversationStorage || hasLearningSystem;
    auditResults.details.learningSystem = {
      hasConversationStorage,
      hasLearningSystem
    };
  } catch (error) {
    console.log(`❌ Learning system error: ${error.message}`);
    auditResults.details.learningSystem = { error: error.message };
  }

  // 5. API CONNECTIVITY AUDIT
  console.log('\n🔗 5. API CONNECTIVITY AUDIT');
  console.log('─────────────────────────────');
  
  try {
    const conversationRoutesPath = 'server/routes/agent-conversation-routes.ts';
    if (fs.existsSync(conversationRoutesPath)) {
      const content = fs.readFileSync(conversationRoutesPath, 'utf8');
      const hasClaudeAPI = content.includes('anthropic.com');
      const hasLatestModel = content.includes('claude-3-5-sonnet-20241022');
      const hasProperSystemPrompts = content.includes('systemPrompt');
      const hasErrorHandling = content.includes('catch');
      
      console.log(`✓ Claude API integration: ${hasClaudeAPI}`);
      console.log(`✓ Latest model (claude-3-5-sonnet-20241022): ${hasLatestModel}`);
      console.log(`✓ System prompts: ${hasProperSystemPrompts}`);
      console.log(`✓ Error handling: ${hasErrorHandling}`);
      
      auditResults.apiConnectivity = hasClaudeAPI && hasProperSystemPrompts;
      auditResults.details.apiConnectivity = {
        hasClaudeAPI,
        hasLatestModel,
        hasProperSystemPrompts,
        hasErrorHandling
      };
    }
  } catch (error) {
    console.log(`❌ API connectivity error: ${error.message}`);
    auditResults.details.apiConnectivity = { error: error.message };
  }

  // 6. FALLBACK SYSTEMS AUDIT
  console.log('\n🛡️ 6. FALLBACK SYSTEMS AUDIT');
  console.log('─────────────────────────────');
  
  try {
    const conversationRoutesPath = 'server/routes/agent-conversation-routes.ts';
    if (fs.existsSync(conversationRoutesPath)) {
      const content = fs.readFileSync(conversationRoutesPath, 'utf8');
      const hasFallbackResponses = content.includes('fallbackResponses');
      const hasElenaFallback = content.includes('elena:') && content.includes('STRATEGIC ANALYSIS');
      const hasAllAgentsFallback = content.includes('zara:') && content.includes('aria:') && content.includes('rachel:');
      
      console.log(`✓ Fallback response system: ${hasFallbackResponses}`);
      console.log(`✓ Elena fallback (strategic format): ${hasElenaFallback}`);
      console.log(`✓ All agents have fallbacks: ${hasAllAgentsFallback}`);
      
      auditResults.fallbackSystems = hasFallbackResponses && hasElenaFallback;
      auditResults.details.fallbackSystems = {
        hasFallbackResponses,
        hasElenaFallback,
        hasAllAgentsFallback
      };
    }
  } catch (error) {
    console.log(`❌ Fallback systems error: ${error.message}`);
    auditResults.details.fallbackSystems = { error: error.message };
  }

  // 7. VISUAL STUDIO INTEGRATION AUDIT
  console.log('\n🎨 7. VISUAL STUDIO INTEGRATION AUDIT');
  console.log('─────────────────────────────────────');
  
  try {
    const buildFiles = [
      'client/src/pages/build.tsx',
      'client/src/components/build/BuildVisualStudio.tsx',
      'client/src/components/build/VictoriaWebsiteChat.tsx'
    ];
    
    let visualStudioExists = true;
    for (const file of buildFiles) {
      if (!fs.existsSync(file)) {
        console.log(`❌ Missing: ${file}`);
        visualStudioExists = false;
      } else {
        console.log(`✓ Found: ${file}`);
      }
    }
    
    // Check for agent integration in visual studio
    if (fs.existsSync('client/src/components/build/BuildVisualStudio.tsx')) {
      const content = fs.readFileSync('client/src/components/build/BuildVisualStudio.tsx', 'utf8');
      const hasAgentChat = content.includes('agent') || content.includes('chat');
      const hasElenaIntegration = content.includes('elena') || content.includes('Elena');
      
      console.log(`✓ Agent chat integration: ${hasAgentChat}`);
      console.log(`✓ Elena integration: ${hasElenaIntegration}`);
      
      auditResults.visualStudioIntegration = visualStudioExists && hasAgentChat;
      auditResults.details.visualStudioIntegration = {
        visualStudioExists,
        hasAgentChat,
        hasElenaIntegration
      };
    }
  } catch (error) {
    console.log(`❌ Visual studio integration error: ${error.message}`);
    auditResults.details.visualStudioIntegration = { error: error.message };
  }

  // CALCULATE TOTAL SCORE
  const systems = [
    'memorySystem',
    'fileOperations', 
    'handoffProtocols',
    'learningSystem',
    'apiConnectivity',
    'fallbackSystems',
    'visualStudioIntegration'
  ];
  
  auditResults.totalScore = systems.filter(system => auditResults[system]).length;

  // AUDIT SUMMARY
  console.log('\n📊 COMPREHENSIVE AUDIT RESULTS');
  console.log('===============================');
  console.log(`🎯 OVERALL SCORE: ${auditResults.totalScore}/7 systems operational`);
  console.log('');
  
  systems.forEach(system => {
    const status = auditResults[system] ? '✅ WORKING' : '❌ NEEDS FIX';
    const systemName = system.replace(/([A-Z])/g, ' $1').toUpperCase();
    console.log(`${status}: ${systemName}`);
  });

  console.log('\n🔧 PRIORITY FIXES NEEDED:');
  const brokenSystems = systems.filter(system => !auditResults[system]);
  if (brokenSystems.length === 0) {
    console.log('✅ All systems operational!');
  } else {
    brokenSystems.forEach((system, index) => {
      const systemName = system.replace(/([A-Z])/g, ' $1');
      console.log(`${index + 1}. Fix ${systemName}`);
    });
  }

  console.log('\n💡 RECOMMENDATIONS:');
  if (auditResults.totalScore >= 6) {
    console.log('✅ Excellent! Agents are ready for production workflow coordination.');
  } else if (auditResults.totalScore >= 4) {
    console.log('⚠️  Good foundation, but needs fixes for optimal agent performance.');
  } else {
    console.log('🚨 Critical issues found. Agent system needs significant repairs.');
  }

  // Save detailed results
  const auditReport = {
    timestamp: new Date().toISOString(),
    ...auditResults
  };
  
  fs.writeFileSync('agent-audit-report.json', JSON.stringify(auditReport, null, 2));
  console.log('\n📝 Detailed audit report saved to: agent-audit-report.json');

  return auditResults;
}

// Run the audit
auditAgentSystems()
  .then(results => {
    console.log('\n🎉 AGENT AUDIT COMPLETE!');
    process.exit(results.totalScore >= 4 ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 AUDIT FAILED:', error);
    process.exit(1);
  });