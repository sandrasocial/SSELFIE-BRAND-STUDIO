/**
 * Vercel Serverless Function - /api/health
 * Health check endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../server/api/health.js';

export default async function healthHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};