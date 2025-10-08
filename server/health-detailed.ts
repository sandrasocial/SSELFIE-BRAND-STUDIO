import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 10
} as const;

interface DatabaseHealth {
  status: 'healthy' | 'unhealthy';
  count: number;
  latency: number;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  timestamp: string;
  performance: {
    totalLatency: number;
    databaseLatency?: number;
    databaseStatus?: string;
    userCount?: number;
  };
  environment?: {
    nodeVersion: string;
    platform: string;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
  };
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const { storage } = await import('../server/storage.js');
    const dbStart = Date.now();
    
    // Quick database health check
    const dbHealth = await Promise.race([
      storage.getUserCount().then(count => ({ 
        status: 'healthy' as const, 
        count, 
        latency: Date.now() - dbStart 
      })),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
    ]) as DatabaseHealth;
    
    const totalTime = Date.now() - startTime;
    
    const response: HealthResponse = {
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
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    const response: HealthResponse = {
      status: 'unhealthy',
      service: 'SSELFIE Studio API',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      performance: {
        totalLatency: totalTime
      }
    };
    
    return res.status(500).json(response);
  }
}
