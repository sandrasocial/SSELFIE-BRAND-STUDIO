import { Router } from 'express';
import { requireStackAuth } from '../stack-auth.js';
const router = Router();
const userPreferences = {};
router.get('/', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        if (userId !== '42585527') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const preferences = userPreferences[userId] || {
            slackEnabled: true,
            emailEnabled: false,
            frequency: 'immediate',
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            },
            priorities: {
                high: true,
                medium: true,
                low: false
            },
            insightTypes: {
                strategic: true,
                technical: true,
                operational: true,
                urgent: true
            },
            agents: {
                elena: true,
                aria: true,
                zara: true,
                maya: true,
                victoria: true,
                rachel: true,
                ava: false,
                quinn: false,
                sophia: false,
                martha: true,
                diana: false,
                wilma: false,
                olga: false,
                flux: false
            }
        };
        res.json({
            success: true,
            preferences
        });
    }
    catch (error) {
        console.error('Get notification preferences error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        if (userId !== '42585527') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const preferences = req.body;
        const requiredFields = ['slackEnabled', 'frequency', 'priorities', 'insightTypes', 'agents'];
        for (const field of requiredFields) {
            if (!(field in preferences)) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required field: ${field}`
                });
            }
        }
        userPreferences[userId] = preferences;
        console.log(`✅ PREFERENCES: Updated notification preferences for user ${userId}`);
        res.json({
            success: true,
            message: 'Notification preferences updated successfully',
            preferences
        });
    }
    catch (error) {
        console.error('Save notification preferences error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/should-notify', async (req, res) => {
    try {
        const { userId, agentName, insightType, priority } = req.body;
        if (!userId || !agentName || !insightType || !priority) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, agentName, insightType, priority'
            });
        }
        const preferences = userPreferences[userId];
        if (!preferences) {
            return res.json({
                success: true,
                shouldNotify: true,
                reason: 'No preferences set - defaulting to notify'
            });
        }
        if (!preferences.slackEnabled) {
            return res.json({
                success: true,
                shouldNotify: false,
                reason: 'Slack notifications disabled'
            });
        }
        if (!preferences.agents[agentName]) {
            return res.json({
                success: true,
                shouldNotify: false,
                reason: `Notifications disabled for agent: ${agentName}`
            });
        }
        if (!preferences.insightTypes[insightType]) {
            return res.json({
                success: true,
                shouldNotify: false,
                reason: `Notifications disabled for insight type: ${insightType}`
            });
        }
        if (!preferences.priorities[priority]) {
            return res.json({
                success: true,
                shouldNotify: false,
                reason: `Notifications disabled for priority: ${priority}`
            });
        }
        if (preferences.quietHours?.enabled) {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            const startTime = preferences.quietHours.start;
            const endTime = preferences.quietHours.end;
            if (startTime > endTime) {
                if (currentTime >= startTime || currentTime <= endTime) {
                    return res.json({
                        success: true,
                        shouldNotify: false,
                        reason: `Quiet hours active (${startTime} - ${endTime})`
                    });
                }
            }
            else {
                if (currentTime >= startTime && currentTime <= endTime) {
                    return res.json({
                        success: true,
                        shouldNotify: false,
                        reason: `Quiet hours active (${startTime} - ${endTime})`
                    });
                }
            }
        }
        res.json({
            success: true,
            shouldNotify: true,
            reason: 'All preference checks passed'
        });
    }
    catch (error) {
        console.error('Should notify check error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/reset', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        if (userId !== '42585527') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        delete userPreferences[userId];
        res.json({
            success: true,
            message: 'Notification preferences reset to defaults'
        });
    }
    catch (error) {
        console.error('Reset preferences error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
//# sourceMappingURL=notification-preferences.js.map