import type { VercelRequest, VercelResponse} from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Route to Maya env-check serverless endpoint
import envCheckHandler from '../server/api/maya/env-check.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return envCheckHandler(req, res);
}
