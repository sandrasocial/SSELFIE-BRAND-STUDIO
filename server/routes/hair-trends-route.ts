import { Router } from 'express';
import { requireStackAuth } from '../stack-auth';
import { db } from '../drizzle';
import { sql } from 'drizzle-orm';
import { sophia } from '../scheduled-tasks/fetch-hair-trends';

const router = Router();

interface TrendDataResponse {
  id: number;
  week_range: string;
  trend_data: any;
  summary: string;
  confidence: number;
  created_at: string;
}

/**
 * Get latest hair and beauty trends for members
 * Protected route - requires authentication
 */
router.get('/hair-trends', requireStackAuth, async (req: any, res) => {
  try {
    console.log('📊 Hair trends requested by user:', req.user?.id);

    // Fetch latest trends from database
    const trends = await db.execute(sql`
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
    `) as TrendDataResponse[];

    if (!trends || trends.length === 0) {
      return res.json({
        success: true,
        message: 'No trend data available yet',
        trends: [],
        lastUpdate: null
      });
    }

    // Format response data
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

  } catch (error) {
    console.error('❌ Hair trends fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hair trends',
      trends: []
    });
  }
});

/**
 * Get specific week's trend data
 */
router.get('/hair-trends/:weekRange', requireStackAuth, async (req: any, res) => {
  try {
    const { weekRange } = req.params;
    
    const trends = await db.execute(sql`
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
    `) as TrendDataResponse[];

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

  } catch (error) {
    console.error('❌ Specific hair trend fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch specific hair trend'
    });
  }
});

/**
 * Manual trigger for Sophia trend analysis (development only)
 */
router.post('/hair-trends/analyze', requireStackAuth, async (req: any, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Manual analysis not available in production'
      });
    }

    console.log('🔧 Manual Sophia trend analysis triggered by user:', req.user?.id);

    // Trigger manual analysis
    await sophia.runManualAnalysis();

    res.json({
      success: true,
      message: 'Manual trend analysis triggered',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Manual trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger manual trend analysis'
    });
  }
});

/**
 * Get trend analysis status and configuration
 */
router.get('/hair-trends/status', requireStackAuth, async (req: any, res) => {
  try {
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    const isProduction = process.env.NODE_ENV === 'production';

    // Get latest trend entry to check last update
    const latestTrends = await db.execute(sql`
      SELECT created_at 
      FROM hair_trends 
      ORDER BY created_at DESC 
      LIMIT 1
    `) as { created_at: string }[];

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

  } catch (error) {
    console.error('❌ Trend status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check trend analysis status'
    });
  }
});

export default router;