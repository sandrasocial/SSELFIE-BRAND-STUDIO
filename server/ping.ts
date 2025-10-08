import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
  maxDuration: 5
};

interface VercelResponseLike {
  setHeader?: (name: string, value: string) => void;
  status?: (code: number) => { json: (data: unknown) => void; end?: (body?: string) => void };
}

interface WebResponseLike {
  Response: new (body: string, init?: { status?: number; headers?: Record<string, string> }) => Response;
}

function isVercelResponse(res: VercelResponse): res is VercelResponse & VercelResponseLike {
  return typeof (res as VercelResponseLike).status === 'function';
}

function hasWebResponse(global: typeof globalThis): global is typeof globalThis & WebResponseLike {
  return 'Response' in global && typeof global.Response === 'function';
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const vercelRes = res as VercelResponseLike;

    if (vercelRes.setHeader) {
      vercelRes.setHeader('Cache-Control', 'no-store');
    }

    if (isVercelResponse(res)) {
      return res.status(200).json({
        ok: true,
        route: 'api/ping',
        method: req.method ?? 'UNKNOWN',
        timestamp: new Date().toISOString()
      });
    }

    // Fallback if res is not Node-style
    if (hasWebResponse(globalThis)) {
      return new globalThis.Response(JSON.stringify({
        ok: true,
        route: 'api/ping',
        method: req.method ?? 'UNKNOWN',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
      });
    }

    throw new Error('Unsupported response type');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const body = JSON.stringify({
      ok: false,
      route: 'api/ping',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });

    const vercelRes = res as VercelResponseLike;

    if (isVercelResponse(res) && vercelRes.setHeader) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).end(body);
    }

    if (hasWebResponse(globalThis)) {
      return new globalThis.Response(body, {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    throw new Error('Unsupported response type');
  }
}


