#!/usr/bin/env node

/**
 * Workflow Issue Diagnostic Tool
 * Helps identify why Aria is creating test files instead of working on workflow tasks
 */

import { promises as fs } from 'fs';
import path from 'path';

async function diagnoseWorkflowIssue() {
  console.log('🔍 WORKFLOW DIAGNOSTIC: Analyzing why Aria creates test files instead of workflow tasks...\n');

  try {
    // 1. Check for recent Aria test files
    console.log('1️⃣ Checking for recent Aria test files...');
    await checkAriaTestFiles();

    // 2. Check Elena workflow detection system
    console.log('\n2️⃣ Checking Elena workflow detection system...');
    await checkElenaSystem();

    // 3. Check unified agent system integration
    console.log('\n3️⃣ Checking unified agent system integration...');
    await checkUnifiedAgentSystem();

    // 4. Check for workflow trigger mechanisms
    console.log('\n4️⃣ Checking workflow trigger mechanisms...');
    await checkWorkflowTriggers();

    // 5. Provide recommendations
    console.log('\n5️⃣ RECOMMENDATIONS:');
    provideRecommendations();

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

async function checkAriaTestFiles() {
  try {
    const files = await fs.readdir('.', { withFileTypes: true });
    const ariaTestFiles = files
      .filter(file => file.isFile() && file.name.includes('aria') && (file.name.includes('test') || file.name.includes('showcase')))
      .map(file => file.name);

    if (ariaTestFiles.length > 0) {
      console.log('⚠️  Found Aria test/showcase files:');
      ariaTestFiles.forEach(file => console.log(`   - ${file}`));
      console.log('   This indicates Aria is creating demonstration files instead of working on tasks');
    } else {
      console.log('✅ No recent Aria test files found');
    }
  } catch (error) {
    console.log('❌ Could not check Aria test files:', error.message);
  }
}

async function checkElenaSystem() {
  try {
    const elenaFile = await fs.readFile('server/elena-workflow-detection.ts', 'utf8');
    
    if (elenaFile.includes('triggerWorkflow')) {
      console.log('✅ Elena workflow detection system has triggerWorkflow method');
    } else {
      console.log('❌ Elena workflow detection missing triggerWorkflow method');
    }

    if (elenaFile.includes('assignTasksToAgents')) {
      console.log('✅ Elena has agent task assignment functionality');
    } else {
      console.log('❌ Elena missing agent task assignment functionality');
    }

    if (elenaFile.includes('aria')) {
      console.log('✅ Elena configured to assign tasks to Aria');
    } else {
      console.log('❌ Elena not configured for Aria task assignment');
    }

  } catch (error) {
    console.log('❌ Elena workflow detection system not found or accessible');
  }
}

async function checkUnifiedAgentSystem() {
  try {
    const unifiedFile = await fs.readFile('server/unified-agent-system.ts', 'utf8');
    
    if (unifiedFile.includes('sendTaskToAgent')) {
      console.log('✅ Unified agent system has sendTaskToAgent method');
    } else {
      console.log('❌ Unified agent system missing sendTaskToAgent method');
    }

    if (unifiedFile.includes('elenaWorkflowDetection')) {
      console.log('✅ Unified system integrated with Elena workflow detection');
    } else {
      console.log('❌ Unified system not integrated with Elena workflows');
    }

  } catch (error) {
    console.log('❌ Unified agent system not found or accessible');
  }
}

async function checkWorkflowTriggers() {
  try {
    const routesFile = await fs.readFile('server/routes.ts', 'utf8');
    
    if (routesFile.includes('/api/elena/trigger-workflow')) {
      console.log('✅ Elena workflow trigger endpoint exists');
    } else {
      console.log('❌ Elena workflow trigger endpoint missing');
    }

    if (routesFile.includes('elenaWorkflowDetection')) {
      console.log('✅ Routes integrated with Elena workflow detection');
    } else {
      console.log('❌ Routes not integrated with Elena workflow detection');
    }

  } catch (error) {
    console.log('❌ Routes file not accessible for workflow trigger check');
  }
}

function provideRecommendations() {
  console.log(`
🎯 SOLUTION ANALYSIS:

The issue is likely that:
1. When you trigger workflows, Elena's workflow detection isn't automatically activating
2. Aria receives general requests instead of structured workflow tasks
3. Without clear task context, Aria defaults to creating test/showcase files

🔧 IMMEDIATE FIXES NEEDED:
1. Verify Elena workflow detection is initialized on server startup
2. Ensure workflow triggers automatically invoke Elena's analysis
3. Add automatic task assignment when workflows are detected
4. Test the workflow endpoints to ensure they're working

🚀 TO TEST THE FIX:
1. Start your server: npm run dev
2. Trigger a workflow with design-related content
3. Check server logs for Elena workflow detection
4. Verify Aria receives structured tasks instead of general requests

📋 WORKFLOW TRIGGER EXAMPLES:
- "Create a design component for the luxury layout"
- "Fix the API performance issue" 
- "Improve the user experience flow"

Each should trigger Elena's pattern detection and assign appropriate agents.
`);
}

// Run the diagnostic
diagnoseWorkflowIssue();