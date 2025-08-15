/**
 * COORDINATE ZARA FOR TECHNICAL ANALYSIS
 * Using the multi-agent coordination system to task Zara with server analysis
 */

import { multiAgentCoordinator } from './server/services/multi-agent-coordinator.js';

async function coordinateZaraAnalysis() {
  console.log('🎯 COORDINATING ZARA: Technical analysis of server instability');
  
  const coordinationRequest = {
    targetAgent: 'zara',
    taskDescription: `URGENT TECHNICAL ANALYSIS REQUIRED:

**PRIMARY ISSUES TO INVESTIGATE:**
1. Server instability - Clean JavaScript server (server/index.js) fails to start consistently
2. Deployment failures - Package.json points to server/index.ts but workflow uses TypeScript conflicts
3. Build process conflicts - TypeScript compilation affecting stability
4. Port conflicts and server startup issues

**TECHNICAL INVESTIGATION AREAS:**
• Analyze package.json main entry point (currently server/index.ts vs actual server/index.js)
• Examine TypeScript vs JavaScript server architecture conflicts
• Review workflow scripts and startup processes
• Identify root cause of server startup failures
• Assess deployment configuration issues

**EXPECTED DELIVERABLES:**
• Complete technical analysis report
• Specific fixes for server instability
• Deployment configuration recommendations
• Long-term architecture improvements

**TOOLS AVAILABLE:**
Use all available tools to examine the codebase, test server configurations, and implement fixes.

BEGIN IMMEDIATE TECHNICAL ANALYSIS.`,
    priority: 'critical',
    requestingAgent: 'admin-sandra',
    userId: '42585527',
    expectedDeliverables: [
      'Technical analysis report',
      'Server instability fixes', 
      'Deployment configuration fixes',
      'Architecture recommendations'
    ]
  };

  try {
    const success = await multiAgentCoordinator.coordinateAgent(coordinationRequest);
    
    if (success) {
      console.log('✅ ZARA COORDINATION SUCCESSFUL: Technical analysis initiated');
      return true;
    } else {
      console.log('❌ ZARA COORDINATION FAILED: Unable to task agent');
      return false;
    }
  } catch (error) {
    console.error('❌ COORDINATION ERROR:', error);
    return false;
  }
}

// Execute coordination
coordinateZaraAnalysis().then(success => {
  if (success) {
    console.log('🎯 Zara has been coordinated for technical analysis');
  } else {
    console.log('❌ Failed to coordinate Zara');
  }
});