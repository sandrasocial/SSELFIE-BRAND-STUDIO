import { withTimeout } from '../_utils/timing.js';
export const config = {
    runtime: 'nodejs',
    maxDuration: 20
};
export default async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
        const isProduction = process.env.NODE_ENV === 'production';
        // Mock database check with timeout
        const mockResult = [{ created_at: new Date().toISOString() }];
        const result = await withTimeout(Promise.resolve(mockResult), 5000, 'status-check');
        // Convert Date objects to ISO strings
        const latestTrends = Array.isArray(result) ? result.map(row => ({
            created_at: new Date(row.created_at).toISOString()
        })) : [];
        res.json({
            success: true,
            status: {
                configured: hasApiKey,
                environment: isProduction ? 'production' : 'development',
                lastAnalysis: latestTrends[0]?.created_at || null,
                schedulingActive: hasApiKey,
                manualTriggerAvailable: !isProduction
            },
            sophia: {
                name: 'Sophia Trend Analyzer',
                specialty: 'Hair & Beauty Trends',
                updateFrequency: 'Weekly (Mondays)',
                analysisScope: ['Hair Styles', 'Color Trends', 'Techniques', 'Social Media Insights']
            }
        });
    }
    catch (error) {
        console.error('❌ Trend status check error:', error);
        if (error instanceof Error && error.message.includes('TIMEOUT')) {
            return res.status(504).json({
                success: false,
                error: 'Request timeout - please try again'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to check trend analysis status'
        });
    }
}
