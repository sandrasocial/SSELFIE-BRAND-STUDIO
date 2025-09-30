import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Stack Auth Handler - Comprehensive authentication endpoint proxy
 * 
 * This handler provides proper routing for all Stack Auth endpoints including:
 * - Sign in/Sign up flows
 * - OAuth callbacks
 * - Token refresh
 * - User management
 */

const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID;
const STACK_AUTH_API_BASE = 'https://api.stack-auth.com/api/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for Stack Auth
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token, x-stack-project-id, x-stack-publishable-client-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate Stack Auth configuration
  if (!STACK_AUTH_PROJECT_ID) {
    console.error('❌ Stack Auth: Missing project ID');
    return res.status(500).json({
      error: 'Stack Auth configuration error',
      message: 'Missing project ID'
    });
  }

  // Extract the path after /api/auth/
  const authPath = req.url?.replace('/api/auth', '') || '';
  const stackAuthUrl = `${STACK_AUTH_API_BASE}/projects/${STACK_AUTH_PROJECT_ID}${authPath}`;

  console.log('🔐 Stack Auth request:', {
    method: req.method,
    path: authPath,
    url: stackAuthUrl,
    hasBody: !!req.body,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });

  try {
    // Prepare headers for Stack Auth API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-stack-project-id': STACK_AUTH_PROJECT_ID,
      'User-Agent': req.headers['user-agent'] || 'SSELFIE-Studio/1.0',
    };

    // Add publishable client key if available
    if (process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY) {
      headers['x-stack-publishable-client-key'] = process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;
    }

    // Forward relevant headers
    const forwardHeaders = [
      'authorization',
      'x-stack-access-token',
      'x-stack-refresh-token',
      'x-stack-admin-access-token',
      'cookie'
    ];

    forwardHeaders.forEach(header => {
      if (req.headers[header]) {
        headers[header] = req.headers[header] as string;
      }
    });

    // Make request to Stack Auth API
    const response = await fetch(stackAuthUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
    });

    // Get response data
    const contentType = response.headers.get('content-type') || 'application/json';
    const responseData = await response.text();

    // Forward response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');

    // Forward authentication cookies
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    // Forward other important headers
    const forwardResponseHeaders = [
      'x-stack-request-id',
      'x-stack-actual-status',
      'x-stack-known-error'
    ];

    forwardResponseHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    console.log('✅ Stack Auth response:', {
      status: response.status,
      contentType,
      hasSetCookie: !!setCookieHeader,
      responseSize: responseData.length
    });

    return res.status(response.status).send(responseData);

  } catch (error) {
    console.error('❌ Stack Auth proxy error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: stackAuthUrl,
      method: req.method
    });

    return res.status(500).json({
      error: 'Authentication service unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}