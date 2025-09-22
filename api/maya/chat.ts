import type { VercelRequest, VercelResponse } from '@vercel/node';
import main from '../index.js';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 45
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Delegate to the consolidated API handler which returns JSON
  return main(req, res);
}