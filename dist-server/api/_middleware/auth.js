const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;
let JWKS = null;
let JWKS_LAST_FETCH = 0;
const JWKS_CACHE_TIME = 3600000;
function parseCookieHeader(cookieHeader) {
    if (!cookieHeader)
        return {};
    const out = {};
    for (const part of cookieHeader.split(';')) {
        const idx = part.indexOf('=');
        if (idx > -1) {
            const k = part.slice(0, idx).trim();
            const v = decodeURIComponent(part.slice(idx + 1).trim());
            out[k] = v;
        }
    }
    return out;
}
async function timedFetch(url, ms = 3000, init) {
    const AbortCtor = typeof AbortController !== 'undefined' ? AbortController : globalThis.AbortController;
    const ac = new AbortCtor();
    const id = setTimeout(() => ac.abort(), ms);
    try {
        const f = globalThis.fetch || fetch;
        return await f(url, { ...(init || {}), signal: ac.signal });
    }
    finally {
        clearTimeout(id);
    }
}
async function getJWKS() {
    const now = Date.now();
    if (JWKS && (now - JWKS_LAST_FETCH) < JWKS_CACHE_TIME) {
        return JWKS;
    }
    try {
        const jose = await import('jose');
        const resp = await timedFetch(JWKS_URL, 3000);
        if (!resp.ok)
            throw new Error(`JWKS HTTP ${resp.status}`);
        const jwks = await resp.json();
        JWKS = jose.createLocalJWKSet(jwks);
        JWKS_LAST_FETCH = now;
        return JWKS;
    }
    catch (error) {
        console.error('Failed to fetch JWKS:', error);
        return JWKS;
    }
}
async function verifyJWTToken(token) {
    try {
        const jose = await import('jose');
        const jwks = await getJWKS();
        if (!jwks) {
            throw new Error('No JWKS available');
        }
        const { payload } = await jose.jwtVerify(token, jwks, {
            issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
            audience: STACK_AUTH_PROJECT_ID,
        });
        return payload;
    }
    catch (error) {
        throw new Error(`JWT verification failed: ${error.message}`);
    }
}
export async function getAuthenticatedUser(req) {
    let accessToken;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        console.log('🔐 Found Bearer token in Authorization header');
    }
    if (!accessToken) {
        const cookiesSource = req.cookies ||
            parseCookieHeader(req.headers.cookie);
        if (cookiesSource) {
            const cookiesToTry = [
                'stack-access',
                'stack-access-token',
                'stack_session',
                '__Secure-next-auth.session-token',
            ];
            for (const cookieName of cookiesToTry) {
                const cookieValue = cookiesSource[cookieName];
                if (cookieValue) {
                    try {
                        if (cookieValue.startsWith('[')) {
                            const stackAccessArray = JSON.parse(cookieValue);
                            if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2) {
                                accessToken = stackAccessArray[1];
                                break;
                            }
                        }
                        if (cookieValue.startsWith('{')) {
                            const stackAccessObj = JSON.parse(cookieValue);
                            if (stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt) {
                                accessToken = stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt;
                                break;
                            }
                        }
                        if (cookieValue.length > 20 && cookieValue.includes('.')) {
                            accessToken = cookieValue;
                            break;
                        }
                    }
                    catch {
                        if (cookieValue.length > 20 && cookieValue.includes('.')) {
                            accessToken = cookieValue;
                            break;
                        }
                    }
                }
            }
        }
    }
    if (!accessToken) {
        throw new Error('No access token found');
    }
    const userInfo = await verifyJWTToken(accessToken);
    const userId = String(userInfo.sub || userInfo.user_id || userInfo.id || '');
    const userEmail = String(userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email || '');
    const userName = String(userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name || '');
    if (!userId || !userEmail) {
        throw new Error('Invalid user info: missing required fields');
    }
    const user = {
        id: userId,
        email: userEmail,
        firstName: userName?.split(' ')[0] || undefined,
        lastName: userName?.split(' ').slice(1).join(' ') || undefined,
        plan: 'sselfie-studio',
        role: 'user',
        stackUser: userInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
        monthlyGenerationLimit: 100,
        generationsUsedThisMonth: 0,
        mayaAiAccess: true,
        victoriaAiAccess: false,
        hasRetrainingAccess: false,
        trainingCoachingStarted: false,
        trainingCoachingCompleted: false,
        trainingCoachingStep: 0,
        preferredOnboardingMode: 'conversational',
        onboardingProgress: {}
    };
    return user;
}
export async function withAuth(req, res, handler, options = {}) {
    if (options.bypass || req.url?.startsWith('/api/cron/')) {
        console.log('🔓 Bypassing auth:', {
            url: req.url,
            method: req.method,
            headers: req.headers,
            query: req.query,
            bypass: options.bypass
        });
        try {
            return await handler(req, res);
        }
        catch (error) {
            console.error('❌ Handler failed:', {
                url: req.url,
                method: req.method,
                error: error instanceof Error ? { message: error.message, stack: error.stack } : error
            });
            throw error;
        }
    }
    try {
        const authenticatedUser = await getAuthenticatedUser(req);
        const extendedReq = req;
        extendedReq.user = authenticatedUser;
        return await handler(extendedReq, res);
    }
    catch (error) {
        if (options.optional) {
            console.log('📝 Optional auth failed, continuing without user');
            const optionalReq = req;
            optionalReq.user = undefined;
            return await handler(optionalReq, res);
        }
        console.error('❌ Auth failed:', error);
        const expired = [
            'stack-access',
            'stack-access-token',
            'stack_session',
            '__Secure-next-auth.session-token'
        ].map(name => `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
        res.setHeader('Set-Cookie', expired);
        const response = {
            status: 401,
            message: 'Authentication required',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(401).json(response);
        return response;
    }
}
//# sourceMappingURL=auth.js.map