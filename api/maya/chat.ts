/**
 * Vercel Serverless Function - /api/maya/chat
 * Delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

 

export default async function chatHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: handler } = await import('../../dist/server/server/api/maya/chat.js');
    return handler(req, res);
  } catch (error) {
    console.error('❌ Failed to import Maya chat handler:', error);
    res.status(500).json({ error: 'Import failed', details: error.message });
  }
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
};

