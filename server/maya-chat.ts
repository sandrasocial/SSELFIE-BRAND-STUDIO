import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 60
} as const;

// Route to Maya chat serverless endpoint
import chatHandler from './api/maya/chat';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return chatHandler(req, res);
}
