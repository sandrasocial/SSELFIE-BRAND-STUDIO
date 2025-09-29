import { Router } from 'express';
import { requireStackAuth } from '../stack-auth.js';
import { sendWelcomeEmail, sendTrainingCompleteEmail, sendLimitWarningEmail, sendUpgradeInviteEmail } from '../services/email-service.js';
import { storage } from '../storage.js';
const router = Router();
router.post('/welcome', requireStackAuth, async (req, res) => {
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
    }
    catch (error) {
        console.error('Welcome email error:', error);
        res.status(500).json({ error: 'Failed to send welcome email' });
    }
});
router.post('/training-complete', requireStackAuth, async (req, res) => {
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
    }
    catch (error) {
        console.error('Training completion email error:', error);
        res.status(500).json({ error: 'Failed to send training completion email' });
    }
});
router.post('/limit-warning', requireStackAuth, async (req, res) => {
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
    }
    catch (error) {
        console.error('Limit warning email error:', error);
        res.status(500).json({ error: 'Failed to send limit warning email' });
    }
});
router.post('/upgrade-invite', requireStackAuth, async (req, res) => {
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
    }
    catch (error) {
        console.error('Upgrade invitation error:', error);
        res.status(500).json({ error: 'Failed to send upgrade invitation' });
    }
});
router.post('/trigger/user-signup', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const success = await sendWelcomeEmail(user.email || '', user.firstName || 'there');
        res.json({
            success,
            message: 'User signup email automation triggered'
        });
    }
    catch (error) {
        console.error('User signup trigger error:', error);
        res.status(500).json({ error: 'Failed to trigger signup email' });
    }
});
router.post('/trigger/training-complete', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const success = await sendTrainingCompleteEmail(user.email || '', user.firstName || 'there');
        res.json({
            success,
            message: 'Training completion email automation triggered'
        });
    }
    catch (error) {
        console.error('Training completion trigger error:', error);
        res.status(500).json({ error: 'Failed to trigger training completion email' });
    }
});
export default router;
//# sourceMappingURL=email-automation.js.map