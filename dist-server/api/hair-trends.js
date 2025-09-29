import { withTimeout } from './_utils/timing.js';
export const config = {
    runtime: 'nodejs',
    maxDuration: 30
};
async function getDatabase() {
    return {
        execute: async (sql) => {
            return [
                {
                    id: 1,
                    week_range: '2025-W37',
                    trend_data: {
                        trends: {
                            hairStyles: ['Blunt Bob', 'Curtain Bangs', 'Layered Lob'],
                            colorTrends: ['Chocolate Brown', 'Honey Highlights', 'Balayage'],
                            techniques: ['Texturizing', 'Blowout Styling', 'Heat Protection'],
                            socialMediaInsights: ['TikTok Hair Hacks', 'Instagram Reels', 'YouTube Tutorials']
                        }
                    },
                    summary: 'This week shows strong trends toward classic cuts with modern twists, emphasizing natural textures and professional styling techniques.',
                    confidence: 85,
                    created_at: new Date().toISOString()
                }
            ];
        }
    };
}
export default async function handler(req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        console.log('📊 Hair trends requested');
        const db = await withTimeout(getDatabase(), 5000, 'database-connection');
        const trends = await withTimeout(db.execute('SELECT id, trend_name, image_url, week_range FROM hair_trends ORDER BY created_at DESC LIMIT 4'), 8000, 'trends-fetch');
        if (!trends || trends.length === 0) {
            return res.json({
                success: true,
                message: 'No trend data available yet',
                trends: [],
                lastUpdate: null
            });
        }
        const formattedTrends = trends.map(trend => ({
            id: trend.id,
            weekRange: trend.week_range,
            trends: trend.trend_data?.trends || {},
            summary: trend.summary,
            confidence: trend.confidence,
            lastUpdate: trend.created_at
        }));
        res.json({
            success: true,
            trends: formattedTrends,
            lastUpdate: trends[0]?.created_at,
            totalWeeks: trends.length
        });
    }
    catch (error) {
        console.error('❌ Hair trends fetch error:', error);
        if (error instanceof Error && error.message.includes('TIMEOUT')) {
            return res.status(504).json({
                success: false,
                error: 'Request timeout - please try again',
                trends: []
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hair trends',
            trends: []
        });
    }
}
//# sourceMappingURL=hair-trends.js.map