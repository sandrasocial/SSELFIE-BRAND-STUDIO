/**
 * Vercel Serverless Function - /api/maya/heart-image
 * Maya AI heart image endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../dist/server/server/api/maya/heart-image.js';

export default async function mayaHeartImageHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
  memory: 3008
};
