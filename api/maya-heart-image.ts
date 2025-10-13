import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Route to Maya heart-image serverless endpoint
import heartImageHandler from '../server/api/maya/heart-image';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return heartImageHandler(req, res);
}
