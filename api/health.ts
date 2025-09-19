// Minimal health endpoint using Node runtime default handler
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ ok: true, source: 'api/health', runtime: 'node' });
  } catch (e: any) {
    // Fallback for any unexpected surface
    // @ts-ignore
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Internal error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}


