export const config = { runtime: 'edge' } as const;

export default function handler(req: Request) {
  return new Response(
    JSON.stringify({ ok: true, route: 'api/edge-ping', method: req.method }),
    { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }
  );
}


