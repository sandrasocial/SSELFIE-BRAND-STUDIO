/**
 * Vercel Serverless Function - /api/maya/chat-history
 * Maya AI chat history endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../dist/server/server/api/maya/chat-history.js';

export default async function mayaChatHistoryHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};
