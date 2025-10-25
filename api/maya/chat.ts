/**
 * Vercel Serverless Function - /api/maya/chat
 * Maya AI chat endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../dist/server/server/api/maya/chat.js';

export default async function mayaChatHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
  memory: 3008
};

