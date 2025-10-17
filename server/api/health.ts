/**
 * GET /api/health
 * 
 * Health check endpoint - public, no authentication required
 * ✅ MIGRATED from server/routes/modules/utility.ts
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const responseData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      env: process.env['NODE_ENV'] || 'development',
      service: 'SSELFIE Studio API'
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ GET /api/health failed:', error);
    return res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

