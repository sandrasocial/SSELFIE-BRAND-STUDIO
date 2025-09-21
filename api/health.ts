// Minimal health endpoint using Node runtime default handler
import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { runtime: 'nodejs' } as const;

export default function handler(_req: VercelRequest, res: VercelResponse) {
  // Support both VercelResponse and Web-standard Response surfaces
  const anyRes: any = res as any;
  const body = { ok: true, source: 'api/health' };
  try { anyRes.setHeader?.('Cache-Control', 'no-store'); } catch {}
  try { anyRes.setHeader?.('Content-Type', 'application/json'); } catch {}
  if (typeof anyRes.status === 'function') {
    return anyRes.status(200).json(body);
  }
  const NodeResponse = (globalThis as any).Response;
  return new NodeResponse(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}


