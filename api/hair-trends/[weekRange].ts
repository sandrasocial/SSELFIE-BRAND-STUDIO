import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withTimeout } from '../_utils/timing';

export const config = { 
  runtime: 'nodejs20.x',
  maxDuration: 30 
};

interface TrendDataResponse {
  id: number;
  week_range: string;
  trend_data: any;
  summary: string;
  confidence: number;
  created_at: string;
}

// Mock database connection for Vercel
async function getDatabase() {
  return {
    execute: async (sql: any, weekRange: string) => {
      // Mock specific week data
      return [
        {
          id: 1,
          week_range: weekRange,
          trend_data: {
            trends: {
              hairStyles: ['Blunt Bob', 'Curtain Bangs', 'Layered Lob'],
              colorTrends: ['Chocolate Brown', 'Honey Highlights', 'Balayage'],
              techniques: ['Texturizing', 'Blowout Styling', 'Heat Protection'],
              socialMediaInsights: ['TikTok Hair Hacks', 'Instagram Reels', 'YouTube Tutorials']
            }
          },
          summary: `Trend analysis for ${weekRange} shows strong emphasis on classic cuts with modern styling techniques.`,
          confidence: 85,
          created_at: new Date().toISOString()
        }
      ];
    }
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const { weekRange } = req.query;

    if (!weekRange || typeof weekRange !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Week range parameter is required'
      });
    }

    console.log('📊 Specific hair trend requested for week:', weekRange);

    // Get database with timeout
    const db = await withTimeout(getDatabase(), 5000, 'database-connection');

    // Fetch specific week trends with timeout
    const trends = await withTimeout(
      db.execute('SELECT * FROM hair_trends WHERE week_range = ?', weekRange),
      8000,
      'trends-fetch'
    ) as TrendDataResponse[];

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
    
    if (error instanceof Error && error.message.includes('TIMEOUT')) {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - please try again'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch specific hair trend'
    });
  }
}
