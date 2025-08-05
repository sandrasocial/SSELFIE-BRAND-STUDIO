import { Router } from 'express';
import { AgentPerformanceTracker } from '../analytics/agent-performance-tracker';
import { coordinateAgents } from '../workflows/agent-coordination-system';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Agent performance analytics
router.post('/agent-performance', isAuthenticated, async (req, res) => {
  try {
    const { timeframe = 'week' } = req.body;
    const insights = await AgentPerformanceTracker.getPerformanceInsights(timeframe);
    res.json(insights);
  } catch (error) {
    console.error('Agent performance error:', error);
    res.status(500).json({ error: 'Failed to fetch agent performance data' });
  }
});

// Agent utilization report
router.get('/agent-utilization', isAuthenticated, async (req, res) => {
  try {
    const report = await AgentPerformanceTracker.getAgentUtilizationReport();
    res.json(report);
  } catch (error) {
    console.error('Agent utilization error:', error);
    res.status(500).json({ error: 'Failed to fetch utilization report' });
  }
});

// Workflow analytics
router.get('/workflow-analytics', isAuthenticated, async (req, res) => {
  try {
    const analytics = await AgentPerformanceTracker.getWorkflowAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Workflow analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow analytics' });
  }
});

// Individual agent metrics
router.get('/agent-metrics/:agentId', isAuthenticated, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { timeframe = 'week' } = req.query;
    const metrics = await AgentPerformanceTracker.getAgentMetrics(agentId, timeframe as any);
    res.json(metrics);
  } catch (error) {
    console.error('Agent metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch agent metrics' });
  }
});

// Agent coordination endpoints
router.post('/coordinate-agents', isAuthenticated, coordinateAgents);

// Track agent interaction
router.post('/track-interaction', isAuthenticated, async (req, res) => {
  try {
    const { agentId, interactionType, metadata } = req.body;
    const userId = (req.user as any)?.id;
    
    await AgentPerformanceTracker.trackAgentInteraction(agentId, userId, interactionType, metadata);
    res.json({ success: true });
  } catch (error) {
    console.error('Interaction tracking error:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

// Enhanced agent chat with performance tracking
router.post('/agent-chat-enhanced', isAuthenticated, async (req, res) => {
  try {
    const { agentId, messages, workflowStage, projectContext } = req.body;
    const userId = (req.user as any)?.id;

    // Track the interaction
    await AgentPerformanceTracker.trackAgentInteraction(agentId, userId, 'chat_enhanced', {
      messageCount: messages.length,
      workflowStage,
      projectContext
    });

    // Process the chat (this would integrate with your existing agent chat logic)
    // For now, we'll return a success response
    res.json({ 
      success: true, 
      agentId, 
      trackingEnabled: true,
      workflowStage 
    });
  } catch (error) {
    console.error('Enhanced chat error:', error);
    res.status(500).json({ error: 'Failed to process enhanced chat' });
  }
});

// Workflow coordination status
router.get('/workflow-status/:workflowId', isAuthenticated, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = (req.user as any)?.id;
    
    // This would integrate with your workflow coordination system
    // For now, return a mock status
    res.json({
      workflowId,
      status: 'in_progress',
      currentStage: 'design_concept',
      completedStages: [],
      nextActions: ['Design mockup creation', 'Style guide development']
    });
  } catch (error) {
    console.error('Workflow status error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow status' });
  }
});

export default router;