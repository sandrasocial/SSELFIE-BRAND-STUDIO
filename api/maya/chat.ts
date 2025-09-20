import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { runtime: 'nodejs20.x' } as const;
import main from '../index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Delegate to the consolidated API handler which returns JSON
  return main(req, res);
}