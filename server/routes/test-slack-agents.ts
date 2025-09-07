import { Router } from 'express';
import { requireStackAuth } from '../stack-auth';
import { launchFocusedAgentService } from '../services/launch-focused-agent-service';
import { SlackNotificationService } from '../services/slack-notification-service';

const router = Router();

// Test route to verify Slack integration works
router.post('/send-launch-status', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    // Only allow Sandra (admin) to trigger test
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get real launch metrics
    const metrics = await launchFocusedAgentService.getLaunchMetrics();
    
    // Send launch status update to Slack
    await SlackNotificationService.sendAgentInsight(
      'elena',
      'strategic',
      'SSELFIE Studio Launch Status Update',
      `🚀 **Interactive Agent System Ready!**\n\n` +
      `📊 Current Metrics:\n` +
      `• Total Users: ${metrics.totalUsers}\n` +
      `• Active Subscriptions: ${metrics.activeSubscriptions}\n` +
      `• Monthly Revenue: €${metrics.monthlyRevenue}\n` +
      `• Generation Success: ${metrics.generationSuccessRate}%\n\n` +
      `🎯 Launch Readiness: ${metrics.launchReadiness.score}%\n` +
      `📈 Next Milestone: ${metrics.nextMilestone.target}\n\n` +
      `Click "Chat with Elena" below to start strategic planning for your launch!`,
      'high'
    );

    res.json({
      success: true,
      message: 'Launch status sent to Slack',
      metrics: metrics
    });

  } catch (error) {
    console.error('Error sending launch status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test agent conversation trigger
router.post('/trigger-agent-conversation/:agentName', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const agentName = req.params.agentName;
    const insight = await launchFocusedAgentService.getAgentInsight(agentName);
    
    await SlackNotificationService.sendAgentInsight(
      agentName,
      'strategic',
      `Ready for Launch Planning with ${agentName.charAt(0).toUpperCase() + agentName.slice(1)}`,
      `${insight.insight}\n\n🎯 Recommended Action: ${insight.action}\n\nClick below to start our conversation!`,
      insight.priority
    );

    res.json({
      success: true,
      message: `${agentName} conversation triggered`,
      insight: insight
    });

  } catch (error) {
    console.error(`Error triggering ${req.params.agentName} conversation:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Show agent team status
router.get('/agent-team-status', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const metrics = await launchFocusedAgentService.getLaunchMetrics();
    
    const agentTeam = [
      {
        name: 'Elena',
        role: 'Strategic Revenue Leader',
        focus: 'Customer acquisition & revenue growth',
        insight: await launchFocusedAgentService.getAgentInsight('elena')
      },
      {
        name: 'Maya',
        role: 'AI Quality Specialist',
        focus: 'Image generation & user experience',
        insight: await launchFocusedAgentService.getAgentInsight('maya')
      },
      {
        name: 'Victoria',
        role: 'Conversion Optimizer',
        focus: 'User onboarding & subscription conversion',
        insight: await launchFocusedAgentService.getAgentInsight('victoria')
      },
      {
        name: 'Aria',
        role: 'Brand Designer',
        focus: 'Visual consistency & brand scaling',
        insight: await launchFocusedAgentService.getAgentInsight('aria')
      },
      {
        name: 'Rachel',
        role: 'Launch Messaging',
        focus: 'Marketing copy & customer communication',
        insight: await launchFocusedAgentService.getAgentInsight('rachel')
      }
    ];

    res.json({
      success: true,
      launchMetrics: metrics,
      agentTeam: agentTeam,
      interactiveSystemStatus: 'Ready for launch planning conversations'
    });

  } catch (error) {
    console.error('Error getting agent team status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;