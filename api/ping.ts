export default function handler(req: any, res: any) {
  try {
    if (res?.setHeader) res.setHeader('Cache-Control', 'no-store');
    if (res?.status) {
      return res.status(200).json({ ok: true, route: 'api/ping', method: req?.method ?? 'UNKNOWN' });
    }
    // Fallback if res is not Node-style
    // @ts-ignore
    return new Response(JSON.stringify({ ok: true, route: 'api/ping', method: req?.method ?? 'UNKNOWN' }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
    });
  } catch (e: any) {
    const body = JSON.stringify({ ok: false, route: 'api/ping', error: e?.message ?? String(e) });
    if (res?.status && res?.setHeader) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).end(body);
    }
    // @ts-ignore
    return new Response(body, { status: 500, headers: { 'content-type': 'application/json' } });
  }
}


