import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Authentication Diagnostic Endpoint
 * 
 * This endpoint helps diagnose OAuth and authentication issues by checking:
 * - Stack Auth configuration
 * - Cookie presence and format
 * - Token validation
 * - Database connectivity
 */

const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || 
                              process.env.VITE_STACK_PROJECT_ID || 
                              '253d7343-a0d4-43a1-be5c-822f590d40be';

const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const diagnostics: {
    timestamp: string;
    checks: Record<string, unknown>;
    status?: string;
    summary?: string;
  } = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // 1. Check Stack Auth configuration
    diagnostics.checks.stackAuthConfig = {
      projectId: STACK_AUTH_PROJECT_ID,
      hasPublishableKey: !!process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
      hasSecretKey: !!process.env.STACK_AUTH_SECRET_KEY,
      status: (process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY && process.env.STACK_AUTH_SECRET_KEY) 
        ? 'configured' 
        : 'missing_keys'
    };

    // 2. Check Stack Auth API connectivity
    try {
      const jwksUrl = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;
      const jwksResponse = await fetch(jwksUrl, { 
        method: 'GET',
        headers: { 'User-Agent': 'SSELFIE-Diagnostic/1.0' }
      });
      
      diagnostics.checks.stackAuthApi = {
        reachable: jwksResponse.ok,
        status: jwksResponse.status,
        url: jwksUrl.replace(STACK_AUTH_PROJECT_ID, '***'),
        message: jwksResponse.ok 
          ? 'Stack Auth API is reachable' 
          : `Stack Auth API returned ${jwksResponse.status}`
      };
    } catch (error) {
      diagnostics.checks.stackAuthApi = {
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Cannot reach Stack Auth API'
      };
    }

    // 3. Check cookies
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const stackCookies = cookies.filter(c => c.startsWith('stack-'));
      
      diagnostics.checks.cookies = {
        totalCookies: cookies.length,
        stackCookies: stackCookies.length,
        hasStackAccess: stackCookies.some(c => c.startsWith('stack-access')),
        hasOAuthCookies: stackCookies.some(c => 
          c.startsWith('stack-oauth-outer') || c.startsWith('stack-oauth-inner')
        ),
        stackCookieNames: stackCookies.map(c => {
          const [name] = c.split('=');
          return name;
        }),
        message: stackCookies.length > 0 
          ? `Found ${stackCookies.length} Stack Auth cookies` 
          : 'No Stack Auth cookies found'
      };
    } else {
      diagnostics.checks.cookies = {
        message: 'No cookies present in request',
        hasStackAccess: false,
        hasOAuthCookies: false
      };
    }

    // 4. Check if authenticated (try to extract token)
    let hasValidToken = false;
    let tokenInfo: { hasToken: boolean; format?: string; parts?: number; tokenPreview?: string; error?: string } | null = null;

    if (cookieHeader) {
      const cookies: Record<string, string> = {};
      for (const part of cookieHeader.split(';')) {
        const idx = part.indexOf('=');
        if (idx > -1) {
          const k = part.slice(0, idx).trim();
          const v = decodeURIComponent(part.slice(idx + 1).trim());
          cookies[k] = v;
        }
      }

      // Try to extract stack-access token
      const stackAccessCookie = cookies['stack-access'];
      if (stackAccessCookie) {
        try {
          const parsed = JSON.parse(stackAccessCookie);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            const token = parsed[1];
            // Don't verify token here, just check format
            const parts = token.split('.');
            hasValidToken = parts.length === 3;
            tokenInfo = {
              hasToken: true,
              format: 'JWT',
              parts: parts.length,
              tokenPreview: token.substring(0, 20) + '...'
            };
          }
        } catch {
          tokenInfo = { hasToken: false, error: 'Failed to parse stack-access cookie' };
        }
      }
    }

    diagnostics.checks.authentication = {
      hasValidToken,
      tokenInfo,
      message: hasValidToken 
        ? 'Valid access token found' 
        : 'No valid access token found'
    };

    // 5. Check database connectivity
    try {
      const { storage } = await import('../server/storage.js');
      // Try a simple database query
      await storage.getUser('diagnostic-test');
      diagnostics.checks.database = {
        reachable: true,
        message: 'Database is reachable'
      };
    } catch (error) {
      diagnostics.checks.database = {
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database connection failed'
      };
    }

    // 6. Overall status
    const allChecks = Object.values(diagnostics.checks);
    const hasIssues = allChecks.some((check: unknown) =>
      (check as Record<string, unknown>).status === 'missing_keys' ||
      (check as Record<string, unknown>).reachable === false ||
      (check as Record<string, unknown>).hasValidToken === false
    );

    diagnostics.status = hasIssues ? 'issues_detected' : 'healthy';
    diagnostics.summary = hasIssues 
      ? 'Some authentication components are not properly configured' 
      : 'All authentication components are healthy';

    // Return diagnostic results
    return res.status(200).json(diagnostics);

  } catch (error) {
    console.error('❌ Diagnostic endpoint error:', error);
    return res.status(500).json({
      error: 'Diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
