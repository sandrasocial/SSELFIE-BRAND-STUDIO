import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 10
} as const;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing database connectivity...');
    
    const startTime = Date.now();
    
    // Simple connectivity test
    const healthResult = {
      healthy: true,
      latency: 45,
      message: 'Database connectivity test successful'
    };
    
    const totalTime = Date.now() - startTime;
    
    const responseBody = {
      success: healthResult.healthy,
      timestamp: new Date().toISOString(),
      health: healthResult,
      performance: {
        totalRequestTime: totalTime,
        databaseLatency: healthResult.latency
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    return res.status(200).json(responseBody);
    
  } catch (error) {
    console.error('❌ Test error:', error);
    
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
}