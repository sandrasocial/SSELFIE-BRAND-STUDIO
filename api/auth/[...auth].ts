
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Stack Auth project config (should match your server setup)
const STACK_AUTH_PROJECT_ID = '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const STACK_AUTH_BASE_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`;

// Utility: get the Stack Auth endpoint for the incoming request
function getStackAuthUrl(req: VercelRequest) {
  // Remove '/api/auth' prefix and forward the rest
  const path = req.url?.replace(/^\/api\/auth/, '') || '';
  return STACK_AUTH_BASE_URL + path;
}

// Utility: copy headers, filtering out host and connection
function filterHeaders(headers: VercelRequest['headers']) {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase()) && value !== undefined) {
      filtered[key] = value as string;
    }
  }
  return filtered;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = getStackAuthUrl(req);
    const method = req.method || 'GET';
    const headers = filterHeaders(req.headers);

    // Forward cookies for session continuity
    if (req.headers.cookie) {
      headers['cookie'] = req.headers.cookie;
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      // Only send body for methods that allow it
      body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        : undefined,
      redirect: 'manual',
    };

    // Proxy the request to Stack Auth
    const stackRes = await fetch(url, fetchOptions);

    // Copy status and headers
    res.status(stackRes.status);
    stackRes.headers.forEach((value, key) => {
      // Forward Set-Cookie headers for auth/session
      if (key.toLowerCase() === 'set-cookie') {
        // Vercel/Node requires setHeader for multiple cookies
        const cookies = stackRes.headers.get('set-cookie');
        if (cookies) res.setHeader('set-cookie', cookies.split(', '));
      } else {
        res.setHeader(key, value);
      }
    });

    // Forward response body
    const contentType = stackRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await stackRes.json();
      res.json(data);
    } else {
      const buffer = await stackRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error: any) {
    console.error('❌ Stack Auth proxy error:', error);
    res.status(502).json({ error: 'Stack Auth proxy failed', message: error.message });
  }
}
