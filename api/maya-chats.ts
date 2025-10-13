import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Route to Maya chats list serverless endpoint
import chatsHandler from '../server/api/maya/chats';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return chatsHandler(req, res);
}
