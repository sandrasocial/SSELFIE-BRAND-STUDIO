import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 60
} as const;

// Route to Maya image generation serverless endpoint
import generateHandler from '../server/api/maya/generate.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return generateHandler(req, res);
}
