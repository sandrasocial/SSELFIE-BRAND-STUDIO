/**
 * Vercel Serverless Function - /api/maya/chat
 * Delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../server/api/maya/chat';

export default async function chatHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
};

