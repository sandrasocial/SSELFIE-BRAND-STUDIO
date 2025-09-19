import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { runtime: 'nodejs20.x' } as const;
import main from '../index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure CORS/preflight and non-POST methods never 405, to verify routing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, method: req.method, path: req.url, message: 'maya/chat function reachable' });
  }

  return main(req, res);
}


