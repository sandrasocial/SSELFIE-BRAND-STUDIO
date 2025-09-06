import { Router } from 'express';
import { requireAuth } from "../auth";
import { AgentInsightEngine } from '../services/agent-insight-engine';

const router = Router();

// Trigger manual insight from specific agent (for testing)
router.post('/trigger-manual/:agentName', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') { // Sandra's user ID
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { agentName } = req.params;
    const context = req.body.context || {};

    await AgentInsightEngine.triggerManualInsight(agentName, context);

    res.json({
      success: true,
      message: `Manual insight triggered from ${agentName}`,
      agentName
    });

  } catch (error) {
    console.error('Manual insight trigger error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process context data and check for triggered insights
router.post('/process-context', async (req, res) => {
  try {
    const context = req.body;
    
    if (!context || Object.keys(context).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Context data required'
      });
    }

    const insights = await AgentInsightEngine.processContext(context);
    
    if (insights.length > 0) {
      await AgentInsightEngine.sendInsights(insights);
    }

    res.json({
      success: true,
      insightsTriggered: insights.length,
      insights: insights.map(i => ({
        agent: i.agentName,
        type: i.insightType,
        title: i.title,
        priority: i.priority
      }))
    });

  } catch (error) {
    console.error('Process context error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get agent engine statistics
router.get('/stats', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const stats = AgentInsightEngine.getAgentStats();
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test multiple agent insights
router.post('/test-multi-agent', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Simulate context that would trigger multiple agents
    const testContext = {
      revenue_growth_percent: 25,
      page_load_time: 3500,
      conversion_drop_off: 35,
      drop_off_stage: 'checkout',
      new_styling_requests: 75,
      trending_style: 'professional business portraits',
      content_engagement_rate: 9.2,
      manual_tasks_per_day: 25,
      estimated_time_savings: 12
    };

    const insights = await AgentInsightEngine.processContext(testContext);
    
    if (insights.length > 0) {
      await AgentInsightEngine.sendInsights(insights);
    }

    res.json({
      success: true,
      message: `Multi-agent test completed - ${insights.length} insights triggered`,
      testContext,
      triggeredInsights: insights.map(i => ({
        agent: i.agentName,
        title: i.title,
        priority: i.priority,
        type: i.insightType
      }))
    });

  } catch (error) {
    console.error('Multi-agent test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;