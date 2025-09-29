export const config = { runtime: 'nodejs' };
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const STACK_AUTH_BASE_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`;
function getStackAuthUrl(req) {
    const path = req.url?.replace(/^\/api\/auth/, '') || '';
    return STACK_AUTH_BASE_URL + path;
}
function filterHeaders(headers) {
    const filtered = {};
    for (const [key, value] of Object.entries(headers)) {
        if (!['host', 'connection', 'content-length'].includes(key.toLowerCase()) && value !== undefined) {
            filtered[key] = value;
        }
    }
    return filtered;
}
export default async function handler(req, res) {
    try {
        const url = getStackAuthUrl(req);
        const method = req.method || 'GET';
        const headers = filterHeaders(req.headers);
        if (req.headers.cookie) {
            headers['cookie'] = req.headers.cookie;
        }
        const fetchOptions = {
            method,
            headers,
            body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
                ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
                : undefined,
            redirect: 'manual',
        };
        const stackRes = await fetch(url, fetchOptions);
        res.status(stackRes.status);
        stackRes.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'set-cookie') {
                const cookies = stackRes.headers.get('set-cookie');
                if (cookies)
                    res.setHeader('set-cookie', cookies.split(', '));
            }
            else {
                res.setHeader(key, value);
            }
        });
        const contentType = stackRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await stackRes.json();
            res.json(data);
        }
        else {
            const buffer = await stackRes.arrayBuffer();
            res.send(Buffer.from(buffer));
        }
    }
    catch (error) {
        console.error('❌ Stack Auth proxy error:', error);
        res.status(502).json({ error: 'Stack Auth proxy failed', message: error.message });
    }
}
//# sourceMappingURL=%5B...auth%5D.js.map