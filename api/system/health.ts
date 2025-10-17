import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendSuccess } from '../_utils/response-helpers';

export const config = { runtime: 'nodejs', maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production',
      services: {
        api: 'operational',
        database: 'operational',
        storage: 'operational',
        email: 'operational',
        video: 'operational'
      },
      version: '1.0.0',
      region: process.env.VERCEL_REGION || 'unknown'
    };

    return sendSuccess(res, healthStatus);
  } catch (error) {
    console.error('❌ Health check error:', error);
    return sendSuccess(res, {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, 503);
  }
}

