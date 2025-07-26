/**
 * Elena Conversational-to-Autonomous Bridge API
 * Revolutionary system that converts Elena's conversational workflows into autonomous deployments
 */

import { Router } from 'express';
import { elenaWorkflowDetectionService } from '../../services/elena-workflow-detection-service';

const router = Router();

/**
 * POST /api/elena/analyze-conversation
 * Analyze conversation for workflow patterns and auto-stage if detected
 */
router.post('/analyze-conversation', async (req, res) => {
  try {
    const { message, agentId, conversationId } = req.body;

    if (!message || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'Message and agentId are required'
      });
    }

    console.log(`🧠 ELENA WORKFLOW ANALYSIS: Analyzing conversation for workflow patterns`);

    // Analyze conversation for workflows
    const analysis = elenaWorkflowDetectionService.analyzeConversation(message, agentId);

    if (analysis.hasWorkflow && analysis.workflow) {
      // Auto-stage the detected workflow
      elenaWorkflowDetectionService.stageWorkflow(analysis.workflow);
      
      console.log(`🎯 WORKFLOW AUTO-STAGED: ${analysis.workflow.title} (${analysis.confidence} confidence)`);
    }

    res.json({
      success: true,
      analysis: {
        hasWorkflow: analysis.hasWorkflow,
        workflowType: analysis.workflowType,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning
      },
      workflow: analysis.workflow ? {
        id: analysis.workflow.id,
        title: analysis.workflow.title,
        description: analysis.workflow.description,
        agents: analysis.workflow.agents,
        priority: analysis.workflow.priority,
        estimatedDuration: analysis.workflow.estimatedDuration,
        tasksCount: analysis.workflow.tasks.length
      } : null,
      staged: analysis.hasWorkflow
    });

  } catch (error) {
    console.error('❌ ELENA WORKFLOW ANALYSIS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze conversation for workflows'
    });
  }
});

/**
 * GET /api/elena/staged-workflows
 * Get all workflows staged for manual execution
 */
router.get('/staged-workflows', async (req, res) => {
  try {
    // Check authentication
    if (!req.session?.user || req.session.user.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Sandra only'
      });
    }

    console.log('🔍 ELENA STAGED WORKFLOW AUTH: Checking authentication');
    console.log(`✅ ELENA STAGED WORKFLOW AUTH: Session authentication validated`);

    // Clean up old workflows
    elenaWorkflowDetectionService.cleanupOldWorkflows();

    // Get staged workflows
    const workflows = elenaWorkflowDetectionService.getStagedWorkflows();

    console.log(`📋 STAGED WORKFLOWS: Found ${workflows.length} workflows ready for manual execution`);

    res.json({
      success: true,
      workflows: workflows.map(w => ({
        id: w.id,
        title: w.title,
        description: w.description,
        agents: w.agents,
        priority: w.priority,
        estimatedDuration: w.estimatedDuration,
        tasksCount: w.tasks.length,
        createdAt: w.createdAt,
        status: w.status
      }))
    });

  } catch (error) {
    console.error('❌ ELENA STAGED WORKFLOWS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve staged workflows'
    });
  }
});

/**
 * POST /api/elena/execute-staged-workflow/:id
 * Execute a staged workflow through autonomous orchestrator
 */
router.post('/execute-staged-workflow/:id', async (req, res) => {
  try {
    // Check authentication
    if (!req.session?.user || req.session.user.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Sandra only'
      });
    }

    const workflowId = req.params.id;
    
    console.log(`🚀 ELENA WORKFLOW EXECUTION: Starting workflow ${workflowId}`);

    // Execute workflow
    const success = await elenaWorkflowDetectionService.executeWorkflow(workflowId);

    res.json({
      success,
      message: success ? 
        'Workflow executed successfully through autonomous orchestrator' :
        'Workflow execution failed',
      workflowId
    });

  } catch (error) {
    console.error('❌ ELENA WORKFLOW EXECUTION ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute workflow'
    });
  }
});

/**
 * GET /api/elena/workflow-status/:id
 * Get status of a specific workflow
 */
router.get('/workflow-status/:id', async (req, res) => {
  try {
    // Check authentication
    if (!req.session?.user || req.session.user.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Sandra only'
      });
    }

    const workflowId = req.params.id;
    const workflows = elenaWorkflowDetectionService.getStagedWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      workflow: {
        id: workflow.id,
        title: workflow.title,
        description: workflow.description,
        agents: workflow.agents,
        tasks: workflow.tasks,
        priority: workflow.priority,
        estimatedDuration: workflow.estimatedDuration,
        createdAt: workflow.createdAt,
        status: workflow.status
      }
    });

  } catch (error) {
    console.error('❌ ELENA WORKFLOW STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow status'
    });
  }
});

export default router;