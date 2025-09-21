import type { VercelRequest, VercelResponse } from '@vercel/node';
import { quickHealthCheck } from './_utils/timing';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 8 
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Use the fast health check utility
    const health = await quickHealthCheck();
    
    const anyRes: any = res as any;
    const body = {
      ok: true,
      ...health,
      service: 'SSELFIE Studio API'
    };
    
    try { anyRes.setHeader?.('Cache-Control', 'no-store, max-age=0'); } catch {}
    try { anyRes.setHeader?.('Content-Type', 'application/json'); } catch {}
    
    if (typeof anyRes.status === 'function') {
      return anyRes.status(200).json(body);
    }
    
    const NodeResponse = (globalThis as any).Response;
    return new NodeResponse(JSON.stringify(body), { 
      status: 200, 
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
      return anyRes.status(500).json(errorBody);
    }
    
    const NodeResponse = (globalThis as any).Response;
    return new NodeResponse(JSON.stringify(errorBody), { 
      status: 500, 
      headers: { 
        'content-type': 'application/json' 
      } 
    });
  }
}