import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { runtime: 'nodejs20.x' } as const;
import main from '../index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return main(req, res);
}


