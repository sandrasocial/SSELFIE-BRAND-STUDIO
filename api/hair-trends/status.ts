import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withTimeout } from '../_utils/timing';

export const config = { 
  maxDuration: 20 
};

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

    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    const isProduction = process.env.NODE_ENV === 'production';

    // Mock database check with timeout
    const db = await withTimeout(
      Promise.resolve({
        execute: async () => [
          { created_at: new Date().toISOString() }
        ]
      }),
      5000,
      'database-connection'
    );

    const latestTrends = await withTimeout(
      db.execute('SELECT created_at FROM hair_trends ORDER BY created_at DESC LIMIT 1'),
      5000,
      'status-check'
    ) as { created_at: string }[];

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
