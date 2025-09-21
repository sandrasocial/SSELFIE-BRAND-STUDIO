import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withTimeout } from '../_utils/timing';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 300 // 5 minutes for trend analysis
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify cron secret for security
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

    console.log('🔍 Sophia starting weekly hair & beauty trend analysis...');

    // Get current week range
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    const weekRange = `${year}-W${week.toString().padStart(2, '0')}`;

    // Mock trend analysis (replace with actual AI analysis)
    const trendData = {
      week: weekRange,
      trends: {
        hairStyles: [
          'Blunt Bob',
          'Curtain Bangs', 
          'Layered Lob',
          'Textured Pixie',
          'Long Layers'
        ],
        colorTrends: [
          'Chocolate Brown',
          'Honey Highlights',
          'Balayage',
          'Money Piece',
          'Root Smudge'
        ],
        techniques: [
          'Texturizing',
          'Blowout Styling',
          'Heat Protection',
          'Curl Definition',
          'Volume Techniques'
        ],
        socialMediaInsights: [
          'TikTok Hair Hacks trending',
          'Instagram Reels showing styling techniques',
          'YouTube tutorials on color maintenance',
          'Pinterest boards featuring seasonal looks',
          'Influencer collaborations with hair brands'
        ]
      },
      summary: `Week ${weekRange} shows strong trends toward classic cuts with modern twists, emphasizing natural textures and professional styling techniques. Social media is driving interest in DIY styling and maintenance routines.`,
      confidence: 85
    };

    // Simulate AI analysis with timeout
    await withTimeout(
      new Promise(resolve => setTimeout(resolve, 2000)), // 2 second delay
      10000, // 10 second timeout
      'trend-analysis'
    );

    // Store results (mock database operation)
    console.log('✅ Hair trends analysis completed for week:', weekRange);
    console.log('📊 Trends found:', Object.keys(trendData.trends).length, 'categories');
    console.log('🎯 Confidence score:', trendData.confidence + '%');

    res.json({
      success: true,
      message: 'Weekly hair trends analysis completed',
      weekRange: trendData.week,
      trendsCount: Object.keys(trendData.trends).length,
      confidence: trendData.confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Hair trends analysis failed:', error);
    
    if (error instanceof Error && error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        success: false,
        error: 'Analysis timeout - please try again'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to complete trend analysis'
    });
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
