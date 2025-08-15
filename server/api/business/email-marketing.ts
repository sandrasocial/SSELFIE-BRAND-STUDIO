// SSELFIE Studio Email Automation Routes
// Triggers for automatic email sending

import { Router } from 'express';
import { isAuthenticated } from '../../replitAuth';
import { 
  sendWelcomeEmail, 
  sendTrainingCompleteEmail, 
  sendLimitWarningEmail, 
  sendUpgradeInviteEmail 
} from '../../email-service.js';
import { storage } from '../../storage.js';

const router = Router();

// Send welcome email (triggered on subscription)
router.post('/welcome', isAuthenticated, async (req, res) => {
  try {
    const { userEmail, userName } = req.body;
    
    if (!userEmail || !userName) {
      return res.status(400).json({ error: 'User email and name required' });
    }

    const success = await sendWelcomeEmail(userEmail, userName);
    
    res.json({ 
      success, 
      message: success ? 'Welcome email sent' : 'Failed to send welcome email' 
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

// Send training completion email
router.post('/training-complete', isAuthenticated, async (req, res) => {
  try {
    const { userEmail, userName } = req.body;
    
    if (!userEmail || !userName) {
      return res.status(400).json({ error: 'User email and name required' });
    }

    const success = await sendTrainingCompleteEmail(userEmail, userName);
    
    res.json({ 
      success, 
      message: success ? 'Training completion email sent' : 'Failed to send training email' 
    });
  } catch (error) {
    console.error('Training completion email error:', error);
    res.status(500).json({ error: 'Failed to send training completion email' });
  }
});

// Send generation limit warning
router.post('/limit-warning', isAuthenticated, async (req, res) => {
  try {
    const { userEmail, userName, percentage, planType } = req.body;
    
    if (!userEmail || !userName || !percentage || !planType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const success = await sendLimitWarningEmail(userEmail, userName, percentage, planType);
    
    res.json({ 
      success, 
      message: success ? 'Limit warning email sent' : 'Failed to send limit warning' 
    });
  } catch (error) {
    console.error('Limit warning email error:', error);
    res.status(500).json({ error: 'Failed to send limit warning email' });
  }
});

// Send upgrade invitation
router.post('/upgrade-invite', isAuthenticated, async (req, res) => {
  try {
    const { userEmail, userName } = req.body;
    
    if (!userEmail || !userName) {
      return res.status(400).json({ error: 'User email and name required' });
    }

    const success = await sendUpgradeInviteEmail(userEmail, userName);
    
    res.json({ 
      success, 
      message: success ? 'Upgrade invitation sent' : 'Failed to send upgrade invitation' 
    });
  } catch (error) {
    console.error('Upgrade invitation error:', error);
    res.status(500).json({ error: 'Failed to send upgrade invitation' });
  }
});

// Automatic trigger for user signup
router.post('/trigger/user-signup', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send welcome email
    const success = await sendWelcomeEmail(user.email || '', user.firstName || 'there');
    
    res.json({ 
      success, 
      message: 'User signup email automation triggered' 
    });
  } catch (error) {
    console.error('User signup trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger signup email' });
  }
});

// Automatic trigger for training completion
router.post('/trigger/training-complete', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send training completion email
    const success = await sendTrainingCompleteEmail(user.email || '', user.firstName || 'there');
    
    res.json({ 
      success, 
      message: 'Training completion email automation triggered' 
    });
  } catch (error) {
    console.error('Training completion trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger training completion email' });
  }
});

export default router;