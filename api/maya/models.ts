/**
 * Vercel Serverless Function - /api/maya/models
 * Maya AI models endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../dist/server/server/api/maya/models.js';

export default async function mayaModelsHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
  memory: 3008
};
