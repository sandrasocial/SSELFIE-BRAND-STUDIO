import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';

export const config = { runtime: 'nodejs', maxDuration: 20 } as const;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const start = Date.now();
    const users = await storage.getAllUsers?.();
    const elapsed = Date.now() - start;
    return res.status(200).json({ ok: true, hasMethod: !!storage.getAllUsers, count: Array.isArray(users) ? users.length : null, elapsedMs: elapsed });
  } catch (error) {
    return res.status(500).json({ ok: false, error: (error as Error).message });
  }
}

