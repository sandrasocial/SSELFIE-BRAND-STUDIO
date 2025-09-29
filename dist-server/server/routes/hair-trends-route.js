import { requireStackAuth } from '../stack-auth.js';
import { db } from '../drizzle.js';
import { sql } from 'drizzle-orm';
import { sophia } from '../scheduled-tasks/fetch-hair-trends.js';
import { Router } from 'express';
const router = Router();
router.get('/hair-trends', requireStackAuth, async (req, res) => {
    try {
        console.log('📊 Hair trends requested by user:', req.user?.id);
        const result = await db.execute(sql `
      SELECT 
        id,
        week_range,
        trend_data,
        summary,
        confidence,
        created_at
      FROM hair_trends 
      ORDER BY created_at DESC 
      LIMIT 4
    `);
        const trends = result.rows.map(row => ({
            id: Number(row.id),
            week_range: String(row.week_range),
            trend_data: row.trend_data,
            summary: String(row.summary),
            confidence: Number(row.confidence),
            created_at: String(row.created_at)
        }));
        const trends = result.rows;
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
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hair trends',
            trends: []
        });
    }
});
router.get('/hair-trends/:weekRange', requireStackAuth, async (req, res) => {
    try {
        const { weekRange } = req.params;
        const result = await db.execute(sql `
      SELECT 
        id,
        week_range,
        trend_data,
        summary,
        confidence,
        created_at
      FROM hair_trends 
      WHERE week_range = ${weekRange}
      LIMIT 1
    `);
        const trends = result.rows.map(row => ({
            id: Number(row.id),
            week_range: String(row.week_range),
            trend_data: row.trend_data,
            summary: String(row.summary),
            confidence: Number(row.confidence),
            created_at: String(row.created_at)
        }));
        const trends = result.rows;
        if (!trends || trends.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Trend data not found for specified week',
                weekRange
            });
        }
        const trend = trends[0];
        res.json({
            success: true,
            trend: {
                id: trend.id,
                weekRange: trend.week_range,
                trends: trend.trend_data?.trends || {},
                summary: trend.summary,
                confidence: trend.confidence,
                lastUpdate: trend.created_at
            }
        });
    }
    catch (error) {
        console.error('❌ Specific hair trend fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch specific hair trend'
        });
    }
});
router.post('/hair-trends/analyze', requireStackAuth, async (req, res) => {
    try {
        if (process.env['NODE_ENV'] === 'production') {
            return res.status(403).json({
                success: false,
                error: 'Manual analysis not available in production'
            });
        }
        console.log('🔧 Manual Sophia trend analysis triggered by user:', req.user?.id);
        await sophia.runManualAnalysis();
        res.json({
            success: true,
            message: 'Manual trend analysis triggered',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Manual trend analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger manual trend analysis'
        });
    }
});
router.get('/hair-trends/status', requireStackAuth, async (req, res) => {
    try {
        const hasApiKey = !!process.env['ANTHROPIC_API_KEY'];
        const isProduction = process.env['NODE_ENV'] === 'production';
        const result = await db.execute(sql `
      SELECT created_at 
      FROM hair_trends 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
        const latestTrends = result.rows;
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
        res.status(500).json({
            success: false,
            error: 'Failed to check trend analysis status'
        });
    }
});
export default router;
//# sourceMappingURL=hair-trends-route.js.map