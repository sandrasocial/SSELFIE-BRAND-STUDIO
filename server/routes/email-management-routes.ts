import { Router } from 'express';
import { emailManagementAgent } from '../services/email-management-agent';
import { isAuthenticated } from '../replitAuth';
import { SlackNotificationService } from '../services/slack-notification-service';

const router = Router();

// 📧 Add email account (personal or business)
router.post('/accounts', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { type, email, provider, accessToken, refreshToken } = req.body;

    if (!type || !email || !provider) {
      return res.status(400).json({ error: 'Missing required fields: type, email, provider' });
    }

    if (!['personal', 'business'].includes(type)) {
      return res.status(400).json({ error: 'Account type must be personal or business' });
    }

    const accountId = `${userId}_${type}_${Date.now()}`;
    const success = await emailManagementAgent.addEmailAccount(userId, {
      id: accountId,
      type,
      email,
      provider,
      accessToken,
      refreshToken
    });

    if (success) {
      res.json({ 
        message: `${type} email account added successfully`,
        accountId,
        email
      });
    } else {
      res.status(500).json({ error: 'Failed to add email account' });
    }
  } catch (error) {
    console.error('❌ Email account setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔍 Process unread emails
router.post('/process', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    console.log(`📧 AVA: Processing emails for user ${userId}`);

    const insights = await emailManagementAgent.processUnreadEmails(userId);

    res.json({
      message: 'Email processing completed',
      insights: insights.length,
      data: insights
    });
  } catch (error) {
    console.error('❌ Email processing error:', error);
    res.status(500).json({ error: 'Failed to process emails' });
  }
});

// 🚀 Start automated monitoring
router.post('/monitor/start', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { intervalMinutes = 60 } = req.body;

    emailManagementAgent.startEmailMonitoring(userId, intervalMinutes);

    await SlackNotificationService.sendAgentInsight(
      'ava',
      'operational',
      'Email Monitoring Started',
      `Automated email monitoring activated for user ${userId}. Will check for new emails every ${intervalMinutes} minutes.`,
      'medium'
    );

    res.json({
      message: 'Email monitoring started',
      interval: `${intervalMinutes} minutes`,
      status: 'active'
    });
  } catch (error) {
    console.error('❌ Email monitoring start error:', error);
    res.status(500).json({ error: 'Failed to start email monitoring' });
  }
});

// 📊 Get email summary dashboard
router.get('/dashboard', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // For now, return a placeholder dashboard
    // In production, this would fetch real data from database
    const dashboard = {
      totalAccounts: 2, // Business + Personal
      unreadEmails: 1247, // Combined from both accounts
      urgentEmails: 15,
      customerInquiries: 8,
      responsesPending: 23,
      lastProcessed: new Date(),
      accounts: [
        {
          type: 'business',
          email: 'ssa@ssasocial.com',
          unread: 547,
          urgent: 12,
          customers: 8
        },
        {
          type: 'personal',
          email: 'sandra@example.com',
          unread: 700,
          urgent: 3,
          customers: 0
        }
      ]
    };

    res.json(dashboard);
  } catch (error) {
    console.error('❌ Email dashboard error:', error);
    res.status(500).json({ error: 'Failed to load email dashboard' });
  }
});

// 🎯 Test email processing (admin only)
router.post('/test-processing', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userRole = req.user.claims.role || 'user';

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Simulate email processing with mock data
    await SlackNotificationService.sendAgentInsight(
      'ava',
      'strategic',
      'Email Processing Test Complete',
      `🧪 **Test Results:**\n\n` +
      `📧 **Mock Processing Summary:**\n` +
      `• Found 1247 unread emails across 2 accounts\n` +
      `• 15 urgent emails requiring immediate attention\n` +
      `• 8 customer inquiries with sales potential\n` +
      `• 23 emails need responses drafted\n\n` +
      `🎯 **Business Account (ssa@ssasocial.com):**\n` +
      `• 547 unread emails\n` +
      `• 12 urgent items\n` +
      `• 8 customer opportunities\n\n` +
      `📱 **Personal Account:**\n` +
      `• 700 unread emails\n` +
      `• 3 urgent items\n` +
      `• 0 customer emails\n\n` +
      `💡 **Next Steps:**\n` +
      `• Connect real Gmail/Outlook APIs\n` +
      `• Review urgent emails first\n` +
      `• Use AI-generated response drafts`,
      'high'
    );

    res.json({
      message: 'Test email processing completed',
      status: 'success',
      mockData: {
        totalEmails: 1247,
        urgentEmails: 15,
        customerInquiries: 8,
        responsesPending: 23
      }
    });
  } catch (error) {
    console.error('❌ Email test processing error:', error);
    res.status(500).json({ error: 'Test processing failed' });
  }
});

export default router;