import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { 
  runtime: 'nodejs',
  maxDuration: 30
} as const;
import main from './index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return main(req, res);
}


