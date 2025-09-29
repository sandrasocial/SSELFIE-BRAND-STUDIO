import { jwtVerify, createRemoteJWKSet } from 'jose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;
import { createPublicKey } from 'crypto';
let testPublicKey;
let remoteJwks;
if (process.env['NODE_ENV'] === 'test') {
    const testPubKeyPath = path.join(__dirname, '__tests__', 'test-public.key');
    const testPublicKeyPem = fs.readFileSync(testPubKeyPath, 'utf8');
    testPublicKey = createPublicKey({ key: testPublicKeyPem, format: 'pem', type: 'spki' });
}
else {
    remoteJwks = createRemoteJWKSet(new URL(JWKS_URL));
}
const authCache = new Map();
const CACHE_DURATION = 3 * 60 * 1000;
const MAX_CACHE_SIZE = 500;
function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of authCache.entries()) {
        if (now - cached.timestamp > CACHE_DURATION) {
            authCache.delete(key);
        }
    }
    if (authCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(authCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toDelete = entries.slice(0, authCache.size - MAX_CACHE_SIZE + 100);
        toDelete.forEach(([key]) => authCache.delete(key));
    }
}
function hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}
async function verifyJWTToken(token) {
    try {
        const verificationPromise = new Promise(async (resolve, reject) => {
            try {
                let payload;
                if (process.env['NODE_ENV'] === 'test' && testPublicKey) {
                    const { payload: testPayload } = await jwtVerify(token, testPublicKey, {
                        algorithms: ['RS256'],
                        issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
                        audience: STACK_AUTH_PROJECT_ID,
                    });
                    payload = testPayload;
                }
                else {
                    const { payload: prodPayload } = await jwtVerify(token, remoteJwks, {
                        issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
                        audience: STACK_AUTH_PROJECT_ID,
                    });
                    payload = prodPayload;
                }
                resolve(payload);
            }
            catch (error) {
                reject(error);
            }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('JWT verification timeout after 3s')), 3000));
        return await Promise.race([verificationPromise, timeoutPromise]);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`JWT verification failed: ${message}`);
    }
}
export async function verifyStackAuthToken(req, res, next) {
    try {
        let accessToken;
        const skipPaths = ['/api/proxy-image', '/notification-preferences'];
        if (skipPaths.some(path => req.path.startsWith(path))) {
            return next();
        }
        console.log('🔍 Stack Auth: Starting token verification');
        console.log('🔍 Request path:', req.path);
        console.log('🔍 Available cookies:', Object.keys(req.cookies || {}));
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
            console.log('🔐 Stack Auth: Found Bearer token in Authorization header');
        }
        if (!accessToken && req.cookies) {
            const tryParseAccessFromCookieValue = (val) => {
                if (!val || typeof val !== 'string')
                    return undefined;
                try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[1] === 'string') {
                        return parsed[1];
                    }
                }
                catch {
                    if (val.split('.').length === 3)
                        return val;
                }
                return undefined;
            };
            const exact = req.cookies['stack-access'];
            if (!accessToken && exact) {
                const token = tryParseAccessFromCookieValue(exact);
                if (token) {
                    accessToken = token;
                    console.log('🔐 Stack Auth: Found access token in stack-access cookie');
                }
            }
            if (!accessToken) {
                const matchingKeys = Object.keys(req.cookies).filter(k => k.startsWith('stack-access'));
                for (const key of matchingKeys) {
                    const token = tryParseAccessFromCookieValue(req.cookies[key]);
                    if (token) {
                        accessToken = token;
                        console.log(`🔐 Stack Auth: Found access token in cookie '${key}'`);
                        break;
                    }
                }
            }
            if (!accessToken) {
                const legacy = req.cookies['stack-access-token'];
                if (legacy) {
                    accessToken = legacy;
                    console.log('🔐 Stack Auth: Found access token in stack-access-token cookie');
                }
            }
            if (!accessToken) {
                console.log('🔍 Stack Auth: No access token cookies found');
                console.log('🔍 Available cookies:', Object.keys(req.cookies));
            }
        }
        if (!accessToken) {
            console.log('❌ Stack Auth: No access token found');
            console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
            return res.status(401).json({ message: 'Authentication required' });
        }
        console.log('🔐 Stack Auth: Verifying JWT token...');
        console.log('🔍 Token preview:', accessToken.substring(0, 20) + '...');
        const tokenHash = hashToken(accessToken);
        const cached = authCache.get(tokenHash);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            console.log('⚡ Stack Auth: Using cached authentication');
            req.user = cached.dbUser;
            return next();
        }
        if (Math.random() < 0.1) {
            cleanExpiredCache();
        }
        const userInfo = await verifyJWTToken(accessToken);
        console.log('✅ Stack Auth: JWT verified successfully');
        console.log('🔍 Stack Auth: Full JWT payload:', JSON.stringify(userInfo, null, 2));
        const jwtUserInfo = userInfo;
        const userId = jwtUserInfo?.sub || jwtUserInfo?.user_id || jwtUserInfo?.id || '';
        const userEmail = jwtUserInfo?.email || jwtUserInfo?.primary_email || jwtUserInfo?.primaryEmail || jwtUserInfo?.email_address || jwtUserInfo?.user_email || '';
        const userName = jwtUserInfo?.displayName || jwtUserInfo?.display_name || jwtUserInfo?.name || jwtUserInfo?.given_name || jwtUserInfo?.full_name || 'User';
        console.log('🔍 Stack Auth: Full JWT user info keys:', Object.keys(userInfo));
        console.log('🔍 Stack Auth: Email field search:', {
            email: jwtUserInfo.email,
            primary_email: jwtUserInfo.primary_email,
            primaryEmail: jwtUserInfo.primaryEmail,
            email_address: jwtUserInfo.email_address,
            user_email: jwtUserInfo.user_email
        });
        console.log('📊 Stack Auth: Extracted user info:', {
            id: userId,
            email: userEmail,
            name: userName
        });
        const { storage } = await import('./storage.js');
        let dbUser = await storage.getUserByStackAuthId(userId);
        if (!dbUser) {
            if (userEmail) {
                dbUser = await storage.getUserByEmail(userEmail);
                if (dbUser) {
                    console.log(`🔗 Stack Auth: Linking existing user ${dbUser.email} (ID: ${dbUser.id}) to Stack Auth ID: ${userId}`);
                    dbUser = await storage.linkStackAuthId(dbUser.id, userId);
                    console.log('✅ Stack Auth: Existing user successfully linked to Stack Auth');
                }
            }
        }
        if (!dbUser) {
            console.log('🔄 Stack Auth: Creating new user in database...');
            dbUser = await storage.upsertUser({
                id: userId,
                stackAuthId: userId,
                email: userEmail || null,
                firstName: userName?.split(' ')[0] || null,
                lastName: userName?.split(' ').slice(1).join(' ') || null,
                profileImageUrl: jwtUserInfo.profileImageUrl || jwtUserInfo.profile_image_url || jwtUserInfo.avatar_url || null,
                plan: null,
                monthlyGenerationLimit: 0,
                mayaAiAccess: false
            });
            console.log('✅ Stack Auth: New user created (no subscription):', dbUser.email);
        }
        else {
            console.log('✅ Stack Auth: User authenticated successfully:', dbUser.email);
        }
        req.user = dbUser;
        authCache.set(tokenHash, {
            dbUser,
            timestamp: Date.now(),
            tokenHash
        });
        console.log('🎯 Stack Auth: User authenticated successfully, ID:', dbUser.id, 'Plan:', dbUser.plan || 'No subscription');
        next();
    }
    catch (error) {
        console.error('❌ Stack Auth: Token verification failed:', error);
        if (error instanceof Error) {
            console.error('❌ Error type:', error.constructor.name);
            console.error('❌ Error message:', error.message);
        }
        return res.status(401).json({
            message: 'Invalid or expired token',
            error: process.env['NODE_ENV'] === 'development' && error instanceof Error ? error.message : undefined
        });
    }
}
export function requireActiveSubscription(req, res, next) {
    requireStackAuth(req, res, async () => {
        try {
            const user = req.user;
            if (!user || !user.id) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            const { storage } = await import('./storage.js');
            const subscription = await storage.getUserSubscription(user.id);
            if (user.role === 'admin' || user.monthlyGenerationLimit === -1) {
                console.log('✅ Admin user access granted:', user.email);
                return next();
            }
            if (!subscription || subscription.status !== 'active') {
                console.log('❌ No active subscription for user:', user.email);
                return res.status(402).json({
                    message: 'SSELFIE Studio subscription required (€47/month)',
                    redirectTo: '/checkout',
                    requiresPayment: true
                });
            }
            console.log('✅ Active subscription verified for user:', user.email);
            next();
        }
        catch (_error) {
            console.error('❌ Subscription validation error:', _error);
            res.status(500).json({ message: 'Subscription validation failed' });
        }
    });
}
export function requireStackAuth(req, res, next) {
    return verifyStackAuthToken(req, res, next);
}
export async function optionalStackAuth(req, res, next) {
    try {
        await verifyStackAuthToken(req, res, () => { });
        next();
    }
    catch {
        req.user = undefined;
        next();
    }
}
export async function authenticateAdmin(req, res, next) {
    try {
        await verifyStackAuthToken(req, res, () => { });
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }
    catch {
        return res.status(401).json({ error: 'Authentication required' });
    }
}
//# sourceMappingURL=stack-auth.js.map