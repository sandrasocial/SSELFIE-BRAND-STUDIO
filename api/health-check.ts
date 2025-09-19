import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { runtime: 'nodejs20.x' } as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, source: 'api/health-check', method: req.method });
}


