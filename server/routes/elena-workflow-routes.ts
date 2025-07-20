// Elena Workflow Routes - Visual Editor Integration
// Handles workflow creation and execution from visual editor

import { Router } from 'express';
import { ElenaWorkflowSystem } from '../elena-workflow-system';
import { isAuthenticated } from '../replitAuth';

const router = Router();

/**
 * Create workflow from visual editor request
 */
router.post('/create-workflow', isAuthenticated, async (req, res) => {
  try {
    const { request, userId } = req.body;
    
    if (!request) {
      return res.status(400).json({ error: 'Request is required' });
    }

    console.log(`ELENA VISUAL EDITOR: Creating workflow for request: "${request}"`);

    // Create workflow using Elena's system
    const workflow = await ElenaWorkflowSystem.createWorkflowFromRequest(
      userId || 'admin-sandra',
      request
    );

    // Return workflow for visual editor display
    res.json({
      success: true,
      workflow: workflow,
      message: `Workflow "${workflow.name}" created successfully with ${workflow.steps.length} coordinated steps.`
    });

  } catch (error) {
    console.error('Elena workflow creation error:', error);
    res.status(500).json({
      error: 'Failed to create workflow',
      details: error.message
    });
  }
});

/**
 * Execute workflow from visual editor
 */
router.post('/execute-workflow', isAuthenticated, async (req, res) => {
  try {
    const { workflowId } = req.body;
    
    if (!workflowId) {
      return res.status(400).json({ error: 'Workflow ID is required' });
    }

    console.log(`ELENA VISUAL EDITOR: Executing workflow: ${workflowId}`);

    // Execute workflow
    const result = await ElenaWorkflowSystem.executeWorkflow(workflowId);

    res.json({
      success: true,
      executionId: result.executionId,
      message: 'Workflow execution started. You will see live progress updates in the chat.'
    });

  } catch (error) {
    console.error('Elena workflow execution error:', error);
    res.status(500).json({
      error: 'Failed to execute workflow',
      details: error.message
    });
  }
});

/**
 * Get workflow progress for live updates
 */
router.get('/workflow-progress/:workflowId', isAuthenticated, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // Get current workflow status
    const progress = await ElenaWorkflowSystem.getWorkflowProgress(workflowId);
    
    res.json({
      success: true,
      progress: progress
    });

  } catch (error) {
    console.error('Elena workflow progress error:', error);
    res.status(500).json({
      error: 'Failed to get workflow progress',
      details: error.message
    });
  }
});

export default router;