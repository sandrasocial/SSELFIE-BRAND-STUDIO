import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs20.x',
  maxDuration: 10 
};

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'SSELFIE Studio API'
  });
}