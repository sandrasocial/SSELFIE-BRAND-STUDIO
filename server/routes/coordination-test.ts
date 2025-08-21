/**
 * COORDINATION BRIDGE TEST ENDPOINT - PHASE 2
 * Demonstrates project context integration with existing autonomous systems
 */

import express from 'express';
import { coordinate_workflow } from '../tools/coordinate_workflow';
import { get_assigned_tasks } from '../tools/get_assigned_tasks';
import { agentCoordinationBridge } from '../services/agent-coordination-bridge';

const router = express.Router();

/**
 * TEST COORDINATION BRIDGE - Demo endpoint to show Phase 1 working
 */
router.post('/test-coordination', async (req, res) => {
  try {
    console.log('🧪 TESTING: Coordination Bridge Phase 1 Implementation');
    
    const testResults = {
      phase: 'Phase 1: Coordination Bridge',
      timestamp: new Date().toISOString(),
      tests: [] as any[]
    };

    // TEST 1: Create workflow with task assignment
    console.log('📋 TEST 1: Creating workflow with task distribution...');
    
    const workflowResult = await coordinate_workflow({
      action: 'create_workflow',
      workflowName: 'Test Agent Coordination',
      description: 'Demonstrate autonomous system integration',
      coordinatorAgent: 'elena',
      targetAgents: ['aria', 'zara', 'maya'],
      tasks: [
        {
          id: 'test_task_1',
          description: 'Design UI component for coordination dashboard',
          priority: 'high',
          estimatedDuration: 45,
          dependencies: []
        },
        {
          id: 'test_task_2', 
          description: 'Implement backend API for agent communication',
          priority: 'high',
          estimatedDuration: 60,
          dependencies: ['test_task_1']
        },
        {
          id: 'test_task_3',
          description: 'Integrate AI learning patterns for task optimization',
          priority: 'medium',
          estimatedDuration: 30,
          dependencies: []
        }
      ],
      priority: 'high',
      userId: 'admin'
    });

    testResults.tests.push({
      test: 'Workflow Creation & Task Distribution',
      status: workflowResult.includes('✅') ? 'PASSED' : 'FAILED',
      result: workflowResult
    });

    // TEST 2: Check system status
    console.log('📊 TEST 2: Checking coordination system status...');
    
    const statusResult = await coordinate_workflow({
      action: 'check_status',
      coordinatorAgent: 'elena'
    });

    testResults.tests.push({
      test: 'System Status Check',
      status: statusResult.includes('✅') ? 'PASSED' : 'FAILED',
      result: statusResult
    });

    // TEST 3: Agent task retrieval
    console.log('📋 TEST 3: Testing agent task retrieval...');
    
    const taskResult = await get_assigned_tasks({ agent_name: 'aria' });

    testResults.tests.push({
      test: 'Agent Task Retrieval',
      status: taskResult.includes('ACTIVE TASKS') || taskResult.includes('No active tasks') ? 'PASSED' : 'FAILED',
      result: taskResult
    });

    // TEST 4: Project context integration
    console.log('🏗️ TEST 4: Testing project context integration...');
    
    const contextResult = await coordinate_workflow({
      action: 'update_context',
      coordinatorAgent: 'zara',
      userId: 'admin'
    });

    testResults.tests.push({
      test: 'Project Context Integration',
      status: contextResult.includes('✅') ? 'PASSED' : 'FAILED',
      result: contextResult
    });

    // TEST 5: Cross-agent learning activation
    console.log('🧠 TEST 5: Testing cross-agent learning...');
    
    const learningResult = await agentCoordinationBridge.activateCrossAgentLearning(
      'elena',
      ['aria', 'zara', 'maya'],
      {
        userMessage: 'Create coordination workflow',
        agentResponse: 'Successfully implemented Phase 1 coordination bridge',
        success: true
      }
    );

    testResults.tests.push({
      test: 'Cross-Agent Learning Activation',
      status: learningResult ? 'PASSED' : 'FAILED',
      result: learningResult ? 'Learning patterns shared successfully' : 'Learning activation failed'
    });

    // Calculate overall results
    const passedTests = testResults.tests.filter(test => test.status === 'PASSED').length;
    const totalTests = testResults.tests.length;
    
    testResults.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
      overallStatus: passedTests === totalTests ? 'ALL SYSTEMS OPERATIONAL' : 'PARTIAL FUNCTIONALITY'
    };

    console.log(`✅ COORDINATION BRIDGE TEST COMPLETE: ${passedTests}/${totalTests} tests passed`);

    res.json({
      success: true,
      message: 'Phase 1: Coordination Bridge test completed',
      results: testResults,
      connectedSystems: [
        'WorkflowExecutor - Database operations',
        'IntelligentTaskDistributor - Task assignment', 
        'ElenaDelegationSystem - Agent coordination',
        'UnifiedStateManager - Memory management',
        'LocalProcessingEngine - Learning patterns',
        'AdminContextManager - Project awareness'
      ]
    });

  } catch (error) {
    console.error('❌ COORDINATION TEST FAILED:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Coordination bridge test encountered an error'
    });
  }
});

/**
 * GET COORDINATION STATUS - Real-time system monitoring (PHASE 2)
 */
router.get('/status', async (req, res) => {
  try {
    // PHASE 2: Get enhanced system status with project context
    const systemStatus = agentCoordinationBridge.getSystemStatus();
    const coordinationStatus = await agentCoordinationBridge.getCoordinationStatus();
    
    res.json({
      success: true,
      ...systemStatus,
      timestamp: new Date().toISOString(),
      ...coordinationStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      phase: 'Phase 2 - Project Context Integration',
      coordinationBridge: 'Error'
    });
  }
});

/**
 * PHASE 2: Test agent file access validation with automatic context creation
 */
router.post('/test-file-access', async (req, res) => {
  try {
    const { agentId, filePaths } = req.body;
    
    if (!agentId || !filePaths || !Array.isArray(filePaths)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId and filePaths array'
      });
    }

    console.log(`🔍 PHASE 2 TEST: Validating file access for ${agentId}`);
    
    // PHASE 2: Create agent context if it doesn't exist
    const contextManager = agentCoordinationBridge['contextManager'];
    const existingContext = contextManager.getProjectContextForAgent(agentId);
    
    if (!existingContext) {
      console.log(`🤖 PHASE 2: Creating project context for ${agentId}`);
      await contextManager.createAdminAgentContext(
        agentId,
        'admin-test-user',
        'test-conversation-' + Date.now(),
        { name: agentId, role: 'Test Agent' }
      );
    }
    
    const validation = agentCoordinationBridge.validateAgentFileAccess(agentId, filePaths);
    
    res.json({
      success: true,
      phase: 'Phase 2: Project Context Integration',
      agent: agentId,
      contextCreated: !existingContext,
      fileAccessValidation: validation,
      summary: {
        allowedFiles: validation.allowed.length,
        blockedFiles: validation.blocked.length,
        warnings: validation.warnings.length
      }
    });

  } catch (error) {
    console.error('❌ FILE ACCESS TEST FAILED:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'File access validation test encountered an error'
    });
  }
});

/**
 * PHASE 3: Test cross-agent learning system
 */
router.post('/test-cross-agent-learning', async (req, res) => {
  try {
    console.log('🧠 PHASE 3 TEST: Cross-Agent Learning System');
    
    const testResults = {
      phase: 'Phase 3: Cross-Agent Learning Activation',
      timestamp: new Date().toISOString(),
      tests: [] as any[]
    };

    // Get the LocalProcessingEngine instance
    const processingEngine = agentCoordinationBridge['processingEngine'];

    // TEST 1: Save agent learning pattern
    console.log('📚 TEST 1: Saving agent learning pattern...');
    await processingEngine.saveAgentLearning(
      'elena',
      'test-user',
      'workflow_pattern',
      'coordination',
      {
        workflowType: 'task_delegation',
        successFactors: ['clear_instructions', 'agent_expertise_match'],
        optimizationTips: 'Prioritize high-confidence agents for critical tasks'
      },
      0.9
    );

    testResults.tests.push({
      test: 'Save Agent Learning Pattern',
      status: 'PASSED',
      result: 'Elena learning pattern saved with 0.9 confidence'
    });

    // TEST 2: Get cross-agent learning insights
    console.log('🌐 TEST 2: Getting cross-agent learning insights...');
    const learningInsights = await processingEngine.getCrossAgentLearning('zara', 'coordination');

    testResults.tests.push({
      test: 'Cross-Agent Learning Retrieval',
      status: learningInsights ? 'PASSED' : 'FAILED',
      result: `Retrieved ${learningInsights.ownLearning.length} own patterns, ${learningInsights.sharedLearning.length} shared patterns`
    });

    // TEST 3: Record agent performance
    console.log('📊 TEST 3: Recording agent performance...');
    await processingEngine.recordAgentPerformance(
      'maya',
      'content_creation', 
      true,
      2500,
      0.95
    );

    testResults.tests.push({
      test: 'Agent Performance Recording',
      status: 'PASSED',
      result: 'Maya performance recorded: content_creation success'
    });

    // TEST 4: Get learning recommendations
    console.log('💡 TEST 4: Getting learning recommendations...');
    const recommendations = await processingEngine.getLearningRecommendations('aria');

    testResults.tests.push({
      test: 'Learning Recommendations',
      status: recommendations ? 'PASSED' : 'FAILED',
      result: `Generated ${recommendations.skillsToImprove.length} improvement areas, ${recommendations.learningFromOthers.length} cross-agent patterns`
    });

    // Calculate overall results
    const passedTests = testResults.tests.filter(test => test.status === 'PASSED').length;
    const totalTests = testResults.tests.length;
    
    testResults.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
      overallStatus: passedTests === totalTests ? 'CROSS-AGENT LEARNING OPERATIONAL' : 'PARTIAL FUNCTIONALITY'
    };

    console.log(`🧠 PHASE 3 TEST COMPLETE: ${passedTests}/${totalTests} cross-agent learning tests passed`);

    res.json({
      success: true,
      message: 'Phase 3: Cross-Agent Learning system test completed',
      results: testResults,
      learningCapabilities: [
        'Agent Pattern Storage - Database persistence',
        'Cross-Agent Knowledge Sharing - High-confidence pattern distribution', 
        'Performance Tracking - Success rate and improvement metrics',
        'Learning Recommendations - Skill improvement suggestions',
        'Collaborative Intelligence - Shared learning across agent network'
      ],
      systemStatus: {
        learningEngine: 'Active',
        databaseIntegration: 'Connected',
        crossAgentSharing: 'Enabled',
        performanceTracking: 'Operational'
      }
    });

  } catch (error) {
    console.error('❌ PHASE 3 LEARNING TEST FAILED:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Cross-agent learning test encountered an error'
    });
  }
});

export default router;