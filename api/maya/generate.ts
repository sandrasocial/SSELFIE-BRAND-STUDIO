/**
 * Vercel Serverless Function - /api/maya/generate
 * Maya AI image generation endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../dist/server/server/api/maya/generate.js';

export default async function mayaGenerateHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
  memory: 3008
};

