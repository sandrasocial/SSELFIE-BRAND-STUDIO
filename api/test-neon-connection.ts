import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkDatabaseHealth, cleanup } from '../server/db';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 10
} as const;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Testing Neon serverless database connection...');
    
    // Test database health with Neon serverless driver
    const startTime = Date.now();
    const healthResult = await checkDatabaseHealth();
    const totalTime = Date.now() - startTime;
    
    const responseBody = {
      success: healthResult.healthy,
      driver: 'Neon Serverless Driver',
      timestamp: new Date().toISOString(),
      health: healthResult,
      performance: {
        totalRequestTime: totalTime,
        databaseLatency: healthResult.latency,
        overhead: totalTime - (healthResult.latency || 0)
      },
      configuration: {
        httpConnection: true,
        websocketPoolAvailable: true,
        serverlessOptimized: true
      }
    };

    // Cleanup connections for serverless environment
    await cleanup();
    
    const statusCode = healthResult.healthy ? 200 : 503;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    return res.status(statusCode).json(responseBody);
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    
    // Cleanup on error too
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError);
    }
    
    const errorResponse = {
      success: false,
      driver: 'Neon Serverless Driver',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      configuration: {
        httpConnection: 'unknown',
        websocketPoolAvailable: 'unknown',
        serverlessOptimized: true
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
}