// Minimal health endpoint using Node runtime default handler
import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { runtime: 'nodejs20.x' } as const;

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true, source: 'api/health', runtime: 'node' });
}


