import { Router } from 'express';
import { gmailIntegration } from '../services/gmail-integration';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// 🔐 Start Gmail OAuth flow
router.get('/connect/:accountType', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { accountType } = req.params;

    if (!['personal', 'business'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid account type. Must be personal or business.' });
    }

    const authUrl = gmailIntegration.generateAuthUrl(userId, accountType as 'personal' | 'business');
    
    console.log(`🔐 Generated Gmail auth URL for ${accountType} account`);
    res.json({ authUrl });

  } catch (error) {
    console.error('❌ Gmail auth URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate Gmail authorization URL' });
  }
});

// 🔄 Handle Gmail OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('❌ Gmail OAuth error:', error);
      return res.redirect(`/admin/email-management?error=oauth_denied`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    const result = await gmailIntegration.handleCallback(code as string, state as string);
    
    console.log(`✅ Gmail account connected: ${result.email} (${result.accountType})`);
    
    // Redirect back to email management dashboard with success message
    res.redirect(`/admin/email-management?connected=${result.accountType}&email=${encodeURIComponent(result.email)}`);

  } catch (error) {
    console.error('❌ Gmail OAuth callback error:', error);
    res.redirect(`/admin/email-management?error=connection_failed`);
  }
});

// 📧 Fetch emails from connected Gmail accounts
router.post('/fetch-emails', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    console.log(`📧 Fetching emails for user ${userId}`);
    await gmailIntegration.processAllGmailAccounts(userId);
    
    res.json({ 
      message: 'Gmail email processing initiated',
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Gmail fetch emails error:', error);
    res.status(500).json({ error: 'Failed to fetch Gmail emails' });
  }
});

// 📊 Get connected Gmail accounts status
router.get('/accounts', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const accounts = await gmailIntegration.getGmailAccounts(userId);
    
    res.json({
      accounts: accounts.map(account => ({
        id: account.id,
        type: account.type,
        email: account.email,
        provider: 'gmail',
        status: 'connected'
      }))
    });

  } catch (error) {
    console.error('❌ Gmail accounts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch Gmail accounts' });
  }
});

export default router;