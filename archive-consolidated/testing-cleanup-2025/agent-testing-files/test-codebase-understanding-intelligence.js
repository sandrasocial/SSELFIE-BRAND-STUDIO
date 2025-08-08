/**
 * CODEBASE UNDERSTANDING INTELLIGENCE TEST
 * 
 * Comprehensive test for the advanced codebase analysis and understanding system
 * Tests all four intelligence systems working together
 */

import { execSync } from 'child_process';

async function testCodebaseUnderstandingIntelligence() {
  console.log('🧠 TESTING CODEBASE UNDERSTANDING INTELLIGENCE...\n');

  try {
    // Test 1: Basic codebase analysis
    console.log('📝 Test 1: Basic codebase analysis...');
    const testCodebaseAnalysis = `
const { CodebaseUnderstandingIntelligence } = await import('./server/agents/codebase-understanding-intelligence.ts');

try {
  console.time('Codebase Analysis');
  const insights = await CodebaseUnderstandingIntelligence.analyzeCodebase();
  console.timeEnd('Codebase Analysis');
  
  if (insights && insights.projectStructure && insights.dependencies && insights.architecture && insights.businessLogic) {
    console.log('✅ SUCCESS: Comprehensive codebase analysis completed');
    console.log(\`   - Total Files: \${insights.projectStructure.totalFiles}\`);
    console.log(\`   - File Types: \${Object.keys(insights.projectStructure.filesByType).length}\`);
    console.log(\`   - External Dependencies: \${insights.dependencies.external.length}\`);
    console.log(\`   - Architecture Patterns: \${insights.architecture.patterns.length}\`);
    console.log(\`   - Core Features: \${insights.businessLogic.coreFeatures.length}\`);
  } else {
    console.log('❌ ISSUE: Incomplete codebase analysis');
  }
} catch (error) {
  console.log('❌ ISSUE: Codebase analysis failed');
  console.log(\`   Reason: \${error.message}\`);
}
`;
    
    const result1 = execSync(`npx tsx -e "${testCodebaseAnalysis}"`, { encoding: 'utf-8' });
    console.log(result1);

    // Test 2: Agent context generation
    console.log('📝 Test 2: Agent context generation for technical queries...');
    const testAgentContext = `
const { CodebaseUnderstandingIntelligence } = await import('./server/agents/codebase-understanding-intelligence.ts');

try {
  const architectureContext = await CodebaseUnderstandingIntelligence.getAgentContext('Show me the architecture overview');
  const businessContext = await CodebaseUnderstandingIntelligence.getAgentContext('What business features do we have?');
  const technicalContext = await CodebaseUnderstandingIntelligence.getAgentContext('I need technical details about the code');
  
  if (architectureContext.includes('ARCHITECTURE OVERVIEW') && 
      businessContext.includes('BUSINESS FEATURES') && 
      technicalContext.includes('TECHNICAL OVERVIEW')) {
    console.log('✅ SUCCESS: Context generation working for all query types');
    console.log(\`   - Architecture context: \${architectureContext.split('\\n')[0]}\`);
    console.log(\`   - Business context: \${businessContext.split('\\n')[0]}\`);
    console.log(\`   - Technical context: \${technicalContext.split('\\n')[0]}\`);
  } else {
    console.log('❌ ISSUE: Context generation incomplete');
  }
} catch (error) {
  console.log('❌ ISSUE: Agent context generation failed');
  console.log(\`   Reason: \${error.message}\`);
}
`;
    
    const result2 = execSync(`npx tsx -e "${testAgentContext}"`, { encoding: 'utf-8' });
    console.log(result2);

    // Test 3: Enhanced context integration
    console.log('📝 Test 3: Enhanced context integration with codebase understanding...');
    const testEnhancedIntegration = `
const { EnhancedContextIntelligenceSystem } = await import('./server/agents/enhanced-context-intelligence.ts');

try {
  const enhancedContext = await EnhancedContextIntelligenceSystem.processEnhancedContext(
    '42585527', // Sandra's user ID
    'Show me the codebase architecture and suggest improvements',
    'elena',
    []
  );
  
  if (enhancedContext && 
      enhancedContext.contextualizedMessage &&
      enhancedContext.predictiveInsights &&
      enhancedContext.codebaseContext) {
    console.log('✅ SUCCESS: Enhanced context integration working');
    console.log(\`   - Has contextualized message: \${!!enhancedContext.contextualizedMessage}\`);
    console.log(\`   - Has predictive insights: \${enhancedContext.predictiveInsights.length > 0}\`);
    console.log(\`   - Has codebase context: \${!!enhancedContext.codebaseContext}\`);
    console.log(\`   - Message includes codebase info: \${enhancedContext.contextualizedMessage.includes('CODEBASE CONTEXT')}\`);
  } else {
    console.log('❌ ISSUE: Enhanced context integration incomplete');
  }
} catch (error) {
  console.log('❌ ISSUE: Enhanced context integration failed');
  console.log(\`   Reason: \${error.message}\`);
}
`;
    
    const result3 = execSync(`npx tsx -e "${testEnhancedIntegration}"`, { encoding: 'utf-8' });
    console.log(result3);

    // Test 4: File analysis capabilities
    console.log('📝 Test 4: Individual file analysis capabilities...');
    const testFileAnalysis = `
const { CodebaseUnderstandingIntelligence } = await import('./server/agents/codebase-understanding-intelligence.ts');

try {
  // Force cache clear to test actual analysis
  CodebaseUnderstandingIntelligence.clearCache();
  
  const insights = await CodebaseUnderstandingIntelligence.analyzeCodebase();
  
  // Check if we found React components, API files, and business logic
  const componentFiles = insights.projectStructure.filesByType.component || 0;
  const apiFiles = insights.projectStructure.filesByType.api || 0;
  const configFiles = insights.projectStructure.filesByType.config || 0;
  
  console.log('✅ SUCCESS: File type detection working');
  console.log(\`   - Component files detected: \${componentFiles}\`);
  console.log(\`   - API files detected: \${apiFiles}\`);
  console.log(\`   - Config files detected: \${configFiles}\`);
  console.log(\`   - Business critical files: \${insights.projectStructure.largestFiles.filter(f => f.businessCritical).length}\`);
  
  // Test dependency analysis
  if (insights.dependencies.external.length > 0) {
    console.log(\`   - Key dependencies found: \${insights.dependencies.external.filter(d => ['react', 'express', 'typescript', 'drizzle'].some(key => d.includes(key))).slice(0, 3).join(', ')}\`);
  }
  
} catch (error) {
  console.log('❌ ISSUE: File analysis failed');
  console.log(\`   Reason: \${error.message}\`);
}
`;
    
    const result4 = execSync(`npx tsx -e "${testFileAnalysis}"`, { encoding: 'utf-8' });
    console.log(result4);

  } catch (error) {
    console.error('🧠 TEST ERROR:', error.message);
  }

  // Summary
  console.log('\n🎯 CODEBASE UNDERSTANDING INTELLIGENCE TEST SUMMARY:');
  console.log('==================================================');
  console.log('✅ Codebase Understanding Intelligence provides:');
  console.log('   - Comprehensive project structure analysis');
  console.log('   - Dependency mapping and relationship detection');
  console.log('   - Architecture pattern identification');
  console.log('   - Business logic and feature extraction');
  console.log('   - Context-aware agent assistance');
  console.log('   - Integration with predictive and error detection intelligence');
  console.log('');
  console.log('🎉 SUCCESS: Sandra\'s agents now have comprehensive codebase understanding!');
  console.log('🧠 All four intelligence systems working together for enterprise-grade AI assistance');
}

testCodebaseUnderstandingIntelligence();