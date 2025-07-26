/**
 * ELENA STAGED WORKFLOWS API
 * Manages Elena's detected workflows with authentication and database integration
 */

import { Router } from 'express';
import { elenaWorkflowDetectionService } from '../../services/elena-workflow-detection-service';

const router = Router();

/**
 * Authentication middleware for Elena workflow endpoints
 */
const validateElenaAccess = (req: any, res: any, next: any) => {
  // Check session-based authentication (preferred)
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user;
    if (user?.claims?.email === 'ssa@ssasocial.com') {
      console.log('✅ ELENA STAGED WORKFLOW AUTH: Session authentication validated');
      return next();
    }
  }

  // Check admin token fallback
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer sandra-admin-2025') {
    console.log('✅ ELENA STAGED WORKFLOW AUTH: Admin token validated');
    return next();
  }

  console.log('❌ ELENA STAGED WORKFLOW AUTH: Access denied');
  return res.status(401).json({ 
    success: false, 
    error: 'Elena workflow access requires Sandra authentication' 
  });
};

/**
 * GET /api/elena/staged-workflows
 * Retrieve all staged workflows ready for manual execution
 */
router.get('/staged-workflows', validateElenaAccess, async (req, res) => {
  try {
    console.log('🔍 ELENA STAGED WORKFLOW AUTH: Checking authentication');
    
    const workflows = elenaWorkflowDetectionService.getStagedWorkflows();
    
    // Add demo workflow if no workflows exist (for testing)
    if (workflows.length === 0) {
      const demoWorkflow = {
        id: 'demo-workflow-1',
        title: 'Platform Launch Readiness Validation',
        description: 'Elena recommends coordinating Aria, Zara, and Quinn to validate platform architecture, verify luxury design standards, and ensure quality assurance before final launch.',
        agents: ['aria', 'zara', 'quinn'],
        tasks: [
          'Validate platform architecture integrity',
          'Verify luxury design consistency across all pages',
          'Run comprehensive quality assurance audit',
          'Test autonomous agent communication systems'
        ],
        priority: 'high' as const,
        estimatedDuration: '45 minutes',
        createdAt: new Date(),
        status: 'staged' as const
      };
      elenaWorkflowDetectionService.stageWorkflow(demoWorkflow);
      console.log('🎯 DEMO WORKFLOW INITIALIZED: Platform Launch Readiness Validation ready for manual execution');
    }
    
    const finalWorkflows = elenaWorkflowDetectionService.getStagedWorkflows();
    console.log(`📋 STAGED WORKFLOWS: Found ${finalWorkflows.length} workflows ready for manual execution`);
    
    res.json({
      success: true,
      workflows: finalWorkflows,
      count: finalWorkflows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA STAGED WORKFLOWS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve staged workflows',
      details: error.message
    });
  }
});

/**
 * POST /api/elena/execute-staged-workflow/:id
 * Execute a specific staged workflow
 */
router.post('/execute-staged-workflow/:id', validateElenaAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required'
      });
    }

    console.log(`🚀 ELENA WORKFLOW EXECUTION: Starting workflow ${id}`);
    
    const result = await elenaWorkflowDetectionService.executeWorkflow(id);
    
    if (result.success) {
      console.log(`✅ ELENA WORKFLOW EXECUTED: ${id} - ${result.message}`);
    } else {
      console.log(`❌ ELENA WORKFLOW FAILED: ${id} - ${result.message}`);
    }
    
    res.json({
      success: result.success,
      message: result.message,
      workflowId: id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA WORKFLOW EXECUTION ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow',
      details: error.message,
      workflowId: req.params.id
    });
  }
});

/**
 * DELETE /api/elena/workflow/:id
 * Remove a workflow (completed or cancelled)
 */
router.delete('/workflow/:id', validateElenaAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const removed = elenaWorkflowDetectionService.removeWorkflow(id);
    
    if (removed) {
      console.log(`🗑️ ELENA WORKFLOW REMOVED: ${id}`);
      res.json({
        success: true,
        message: 'Workflow removed successfully',
        workflowId: id
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Workflow not found',
        workflowId: id
      });
    }
  } catch (error) {
    console.error('❌ ELENA WORKFLOW REMOVAL ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove workflow',
      details: error.message
    });
  }
});

/**
 * GET /api/elena/workflow-status/:id
 * Get status of specific workflow
 */
router.get('/workflow-status/:id', validateElenaAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const workflows = elenaWorkflowDetectionService.getStagedWorkflows();
    const workflow = workflows.find(w => w.id === id);
    
    if (workflow) {
      res.json({
        success: true,
        workflow,
        status: workflow.status
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
  } catch (error) {
    console.error('❌ ELENA WORKFLOW STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow status',
      details: error.message
    });
  }
});

/**
 * POST /api/elena/test-workflow-detection
 * Test Elena's workflow detection with sample conversation
 */
router.post('/test-workflow-detection', validateElenaAccess, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required for testing'
      });
    }

    const analysis = elenaWorkflowDetectionService.analyzeConversation(message, 'elena');
    
    res.json({
      success: true,
      analysis,
      testMessage: message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA WORKFLOW DETECTION TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test workflow detection',
      details: error.message
    });
  }
});

export default router;