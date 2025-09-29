export const config = {
    runtime: 'nodejs',
    maxDuration: 30
};
export default async function handler(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) {
            console.error('❌ CRON_SECRET not configured');
            return res.status(500).json({ error: 'Cron secret not configured' });
        }
        if (authHeader !== `Bearer ${cronSecret}`) {
            console.error('❌ Unauthorized cron job request');
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log('🕐 Cron job executed at:', new Date().toISOString());
        res.json({
            success: true,
            message: 'Cron job executed successfully',
            timestamp: new Date().toISOString(),
            service: 'SSELFIE Studio Cron'
        });
    }
    catch (error) {
        console.error('❌ Cron job failed:', error);
        res.status(500).json({
            success: false,
            error: 'Cron job execution failed'
        });
    }
}
//# sourceMappingURL=cron.js.map