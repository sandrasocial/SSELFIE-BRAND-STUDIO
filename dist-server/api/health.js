export const config = { runtime: 'nodejs' };
export default function handler(_req, res) {
    // Support both VercelResponse and Web-standard Response surfaces
    const anyRes = res;
    const body = { ok: true, source: 'api/health' };
    try {
        anyRes.setHeader?.('Cache-Control', 'no-store');
    }
    catch { }
    try {
        anyRes.setHeader?.('Content-Type', 'application/json');
    }
    catch { }
    if (typeof anyRes.status === 'function') {
        return anyRes.status(200).json(body);
    }
    const NodeResponse = globalThis.Response;
    return new NodeResponse(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
