/**
 * Vercel Serverless Function - /api/maya/status
 * Delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../server/api/maya/status';

export default async function statusHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
};
