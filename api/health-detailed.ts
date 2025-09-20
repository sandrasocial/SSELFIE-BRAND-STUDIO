import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs20.x',
  maxDuration: 10
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const { storage } = await import('../server/storage.js');
    const dbStart = Date.now();
    
    // Quick database health check
    const dbHealth = await Promise.race([
      storage.getUserCount().then(count => ({ status: 'healthy', count, latency: Date.now() - dbStart })),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
    ]);
    
    const totalTime = Date.now() - startTime;
    
    return res.status(200).json({
      status: 'healthy',
      service: 'SSELFIE Studio API',
      timestamp: new Date().toISOString(),
      performance: {
        totalLatency: totalTime,
        databaseLatency: dbHealth.latency,
        databaseStatus: dbHealth.status,
        userCount: dbHealth.count
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    return res.status(500).json({
      status: 'unhealthy',
      service: 'SSELFIE Studio API',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
      performance: {
        totalLatency: totalTime
      }
    });
  }
}
