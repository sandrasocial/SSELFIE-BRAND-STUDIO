/**
 * Vercel Serverless Function - /api/maya/generation-status
 * Maya AI generation status endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../server/api/maya/generation-status';

export default async function mayaGenerationStatusHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};