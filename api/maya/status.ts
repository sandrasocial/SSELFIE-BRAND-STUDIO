/**
 * Vercel Serverless Function - /api/maya/status
 * Delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

 

export default async function statusHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: handler } = await import('../../dist/server/server/api/maya/status.js');
    return handler(req, res);
  } catch (error) {
    console.error('❌ Failed to import Maya status handler:', error);
    res.status(500).json({ error: 'Import failed', details: error.message });
  }
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
};
