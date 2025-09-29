export const config = {
    runtime: 'nodejs',
    maxDuration: 5
};
export default function handler(req, res) {
    try {
        if (res?.setHeader)
            res.setHeader('Cache-Control', 'no-store');
        if (res?.status) {
            return res.status(200).json({
                ok: true,
                route: 'api/ping',
                method: req?.method ?? 'UNKNOWN',
                timestamp: new Date().toISOString()
            });
        }
        return new Response(JSON.stringify({
            ok: true,
            route: 'api/ping',
            method: req?.method ?? 'UNKNOWN',
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
        });
    }
    catch (e) {
        const body = JSON.stringify({
            ok: false,
            route: 'api/ping',
            error: e?.message ?? String(e),
            timestamp: new Date().toISOString()
        });
        if (res?.status && res?.setHeader) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).end(body);
        }
        return new Response(body, { status: 500, headers: { 'content-type': 'application/json' } });
    }
}
//# sourceMappingURL=ping.js.map