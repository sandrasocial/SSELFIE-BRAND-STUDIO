import { Router } from 'express';
import { requireAuth } from "../auth";
import { SlackNotificationService } from '../services/slack-notification-service';

const router = Router();

// Test Slack connection endpoint
router.post('/test-slack', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') { // Sandra's user ID
      return res.status(403).json({ message: 'Admin access required' });
    }

    const connectionTest = await SlackNotificationService.testConnection();
    
    if (connectionTest) {
      // Send test notification
      const testSent = await SlackNotificationService.sendAgentInsight(
        'elena',
        'strategic',
        'Agent Communication System Online',
        'Your agent empire communication system is now live! All 14 agents can now send you proactive insights and strategic recommendations directly to Slack.',
        'high'
      );

      res.json({
        success: true,
        connectionTest,
        testNotificationSent: testSent,
        message: 'Slack integration test completed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Slack connection test failed'
      });
    }

  } catch (error) {
    console.error('Admin notification test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send manual insight notification (for testing)
router.post('/send-insight', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { agentName, insightType, title, message, priority } = req.body;

    const sent = await SlackNotificationService.sendAgentInsight(
      agentName,
      insightType,
      title,
      message,
      priority
    );

    res.json({
      success: sent,
      message: sent ? 'Insight notification sent successfully' : 'Failed to send notification'
    });

  } catch (error) {
    console.error('Send insight error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send urgent request notification
router.post('/urgent-request', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { agentName, requestType, context } = req.body;

    const sent = await SlackNotificationService.sendUrgentRequest(
      agentName,
      requestType,
      context
    );

    res.json({
      success: sent,
      message: sent ? 'Urgent request sent successfully' : 'Failed to send urgent request'
    });

  } catch (error) {
    console.error('Send urgent request error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;