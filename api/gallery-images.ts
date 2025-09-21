import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { 
copilot/fix-ee2db0a5-9ab3-4bee-ac60-3664c7c5f2ca
  runtime: 'nodejs20.x',
  maxDuration: 20

  runtime: 'nodejs',
  maxDuration: 25
 main
} as const;
import main from './index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return main(req, res);
}


