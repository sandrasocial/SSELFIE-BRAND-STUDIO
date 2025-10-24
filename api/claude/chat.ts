/**
 * Vercel Serverless Function - /api/claude/chat
 * Claude AI chat endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../server/api/claude/chat.js';

export default async function claudeChatHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
  memory: 3008
};

