import type { VercelRequest, VercelResponse } from '@vercel/node';
import { quickHealthCheck } from './_utils/timing.js';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 5
} as const;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Fast health check without database dependency
    const healthResult = await quickHealthCheck();
    
    // Add database health check with timeout
    let dbHealth = { healthy: false, error: 'Not checked' };
    try {
      const { checkDatabaseHealth } = await import('../server/db.js');
      const dbPromise = checkDatabaseHealth();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DB health check timeout')), 2000)
      );
      
      dbHealth = await Promise.race([dbPromise, timeoutPromise]) as typeof dbHealth;
    } catch (error) {
      dbHealth = { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Database check failed' 
      };
    }
    
    const isHealthy = healthResult.status === 'healthy' && dbHealth.healthy;
    
    const anyRes: any = res as any;
    const body = {
      ok: isHealthy,
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: healthResult.timestamp,
      database: dbHealth,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      service: 'SSELFIE Studio API'
    };
    
    try { anyRes.setHeader?.('Cache-Control', 'no-store, max-age=0'); } catch {}
    try { anyRes.setHeader?.('Content-Type', 'application/json'); } catch {}
    
    if (typeof anyRes.status === 'function') {
      return anyRes.status(isHealthy ? 200 : 503).json(body);
    }
    
    const NodeResponse = (globalThis as any).Response;
    return new NodeResponse(JSON.stringify(body), { 
      status: isHealthy ? 200 : 503, 
      headers: { 
        'content-type': 'application/json', 
        'cache-control': 'no-store, max-age=0' 
      } 
    });
  } catch (error) {
    // Fast-fail error response
    const errorBody = {
      ok: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'SSELFIE Studio API',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    const anyRes: any = res as any;
    if (typeof anyRes.status === 'function') {
      return anyRes.status(503).json(errorBody);
    }
    
    const NodeResponse = (globalThis as any).Response;
    return new NodeResponse(JSON.stringify(errorBody), { 
      status: 503, 
      headers: { 
        'content-type': 'application/json' 
      } 
    });
  }
}