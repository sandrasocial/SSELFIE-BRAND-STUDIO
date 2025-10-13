import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Route to Maya models serverless endpoint
import modelsHandler from './api/maya/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return modelsHandler(req, res);
}
