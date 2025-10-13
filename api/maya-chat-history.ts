import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Route to Maya chat history serverless endpoint
import chatHistoryHandler from '../server/api/maya/chat-history';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return chatHistoryHandler(req, res);
}
