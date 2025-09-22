import { Router } from 'express';
import { SlackNotificationService } from '../services/slack-notification-service';

const router = Router();

// Test endpoint to simulate agent insights (for testing Phase 1)
router.post('/test-agent-insight', async (req, res) => {
  try {
    const { agentName, insightType, title, message, priority } = req.body;
    
    // Validate required fields
    if (!agentName || !insightType || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentName, insightType, title, message'
      });
    }

    // Send test insight
    const sent = await SlackNotificationService.sendAgentInsight(
      agentName,
      insightType,
      title,
      message,
      priority || 'medium'
    );

    res.json({
      success: sent,
      message: sent ? 
        `Test insight sent from ${agentName}` : 
        'Failed to send test insight - check Slack configuration'
    });

  } catch (error) {
    console.error('Test agent insight error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test urgent request
router.post('/test-urgent-request', async (req, res) => {
  try {
    const { agentName, requestType, context } = req.body;
    
    if (!agentName || !requestType || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentName, requestType, context'
      });
    }

    const sent = await SlackNotificationService.sendUrgentRequest(
      agentName,
      requestType,
      context
    );

    res.json({
      success: sent,
      message: sent ? 
        `Test urgent request sent from ${agentName}` : 
        'Failed to send test urgent request - check Slack configuration'
    });

  } catch (error) {
    console.error('Test urgent request error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;