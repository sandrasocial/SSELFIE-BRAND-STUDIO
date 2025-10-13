import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Route to Maya status serverless endpoint
import statusHandler from './api/maya/status';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return statusHandler(req, res);
}
