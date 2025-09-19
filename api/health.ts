// Minimal health endpoint using Node runtime default handler
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, source: 'api/health', method: req.method });
}


