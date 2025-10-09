import { withTimeout, withDatabaseTimeout, withDatabaseTimeoutAndRetry, withExternalApiTimeout, isTimeoutError } from './_utils/timing.js';
export const config = {
    runtime: 'nodejs',
    maxDuration: 40
};
let _jose = null;
async function getJose() {
    if (_jose)
        return _jose;
    const mod = await import('jose');
    _jose = { jwtVerify: mod.jwtVerify, createLocalJWKSet: mod.createLocalJWKSet, createRemoteJWKSet: mod.createRemoteJWKSet };
    return _jose;
}
// Stack Auth configuration
const STACK_AUTH_PROJECT_ID = process.env['STACK_AUTH_PROJECT_ID'] || process.env['VITE_STACK_PROJECT_ID'] || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;
// Create JWKS resolver
let JWKS;
async function timedFetch(url, ms = 3000, init) {
    return withExternalApiTimeout(async () => {
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
    }, 
    // Create a Node.js compatible response object instead of using Response constructor
    {
        ok: false,
        status: 408,
        statusText: 'Request Timeout',
        json: async () => ({ error: 'Network timeout' }),
        text: async () => 'Network timeout'
    }, ms, 1, `fetch-${url}`);
}
// Cookie management
function setLogoutCookies(res) {
    const expired = [
        'stack-access',
        'stack-access-token',
        'stack_session',
        '__Secure-next-auth.session-token'
    ].map(name => `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    const existing = res.getHeader('Set-Cookie');
    if (Array.isArray(existing)) {
        res.setHeader('Set-Cookie', [...existing, ...expired]);
    }
    else if (typeof existing === 'string' && existing.length > 0) {
        res.setHeader('Set-Cookie', [existing, ...expired]);
    }
    else {
        res.setHeader('Set-Cookie', expired);
    }
}
const circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    isOpen: false
};
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_TIME = 60000;
function checkCircuitBreaker() {
    const now = Date.now();
    if (circuitBreaker.isOpen && now - circuitBreaker.lastFailure > CIRCUIT_BREAKER_RESET_TIME) {
        circuitBreaker.isOpen = false;
        circuitBreaker.failures = 0;
    }
    return !circuitBreaker.isOpen;
}
function recordCircuitBreakerFailure() {
    circuitBreaker.failures++;
    circuitBreaker.lastFailure = Date.now();
    if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitBreaker.isOpen = true;
    }
}
function recordCircuitBreakerSuccess() {
    if (circuitBreaker.failures > 0) {
        circuitBreaker.failures = 0;
    }
}
// Logging utilities
function nowMs() {
    const perf = globalThis.performance;
    return typeof perf?.now === 'function' ? perf.now() : Date.now();
}
function logStart(route, meta) {
    const start = nowMs();
    try {
    }
    catch {
        // Ignore logging errors
    }
    return {
        end: (outcome, extra) => {
            const elapsed = Math.round(nowMs() - start);
            try {
            }
            catch {
                // Ignore logging errors
            }
            return elapsed;
        }
    };
}
// Categorize concepts
function getCategoryFromTitle(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('professional') || titleLower.includes('headshot') || titleLower.includes('business')) {
        return 'Professional';
    }
    else if (titleLower.includes('lifestyle') || titleLower.includes('casual') || titleLower.includes('relaxed')) {
        return 'Lifestyle';
    }
    else if (titleLower.includes('executive') || titleLower.includes('authority') || titleLower.includes('commanding')) {
        return 'Executive';
    }
    else if (titleLower.includes('creative') || titleLower.includes('artistic')) {
        return 'Creative';
    }
    else if (titleLower.includes('editorial') || titleLower.includes('fashion') || titleLower.includes('street')) {
        return 'Editorial';
    }
    else {
        return 'General';
    }
}
// JWT verification
async function verifyJWTToken(token) {
    try {
        const jose = await getJose();
        const { jwtVerify, createLocalJWKSet } = jose;
        if (!JWKS) {
            const resp = await timedFetch(JWKS_URL, 3000);
            if (!resp.ok)
                throw new Error(`JWKS HTTP ${resp.status}`);
            const jwks = await resp.json();
            JWKS = createLocalJWKSet(jwks);
        }
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
            audience: STACK_AUTH_PROJECT_ID,
        });
        return payload;
    }
    catch (error) {
        throw new Error(`JWT verification failed: ${error.message}`);
    }
}
// Default user fields
function getDefaultUserFields(overrides = {}) {
    return {
        id: overrides.id ?? '',
        email: overrides.email ?? null,
        displayName: overrides.displayName ?? null,
        firstName: overrides.firstName ?? null,
        lastName: overrides.lastName ?? null,
        profileImageUrl: overrides.profileImageUrl ?? null,
        plan: overrides.plan ?? 'sselfie-studio',
        role: overrides.role ?? 'user',
        monthlyGenerationLimit: overrides.monthlyGenerationLimit ?? 100,
        mayaAiAccess: overrides.mayaAiAccess ?? true,
        victoriaAiAccess: overrides.victoriaAiAccess ?? false,
        onboardingProgress: overrides.onboardingProgress ?? JSON.stringify({ source: 'direct-signup' }),
        preferredOnboardingMode: overrides.preferredOnboardingMode ?? 'conversational',
        lastLoginAt: overrides.lastLoginAt ?? new Date(),
    };
}
// Parse cookie header
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
// Main handler function
export default async function handler(req, res) {
    try {
        // Vercel Skew Protection
        if (process.env['VERCEL_SKEW_PROTECTION_ENABLED'] === '1' && process.env['VERCEL_DEPLOYMENT_ID']) {
            try {
                const cookieValue = `__vdpl=${process.env['VERCEL_DEPLOYMENT_ID']}; Path=/; HttpOnly; Secure; SameSite=Lax`;
                const existing = res.getHeader('Set-Cookie');
                if (Array.isArray(existing)) {
                    res.setHeader('Set-Cookie', [...existing, cookieValue]);
                }
                else if (typeof existing === 'string' && existing.length > 0) {
                    res.setHeader('Set-Cookie', [existing, cookieValue]);
                }
                else {
                    res.setHeader('Set-Cookie', cookieValue);
                }
            }
            catch (e) {
            }
        }
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-stack-access-token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        // Safe JSON responder
        const json = (response, status, body) => {
            const r = response;
            if (typeof r?.status === 'function') {
                return response.status(status).json(body);
            }
            const NodeResponse = globalThis.Response;
            try {
                return new NodeResponse(JSON.stringify(body), {
                    status,
                    headers: { 'content-type': 'application/json' }
                });
            }
            catch {
                return {
                    status,
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body)
                };
            }
        };
        // Health check
        if (req.url?.includes('/api/health')) {
            return res.status(200).json({
                status: 'healthy',
                service: 'SSELFIE Studio API',
                timestamp: new Date().toISOString(),
            });
        }
        // Sandra Images API - Public access for image serving
        if (req.url?.startsWith('/api/sandra-images/')) {
            const sandraImagesHandler = await import('./sandra-images.js');
            return sandraImagesHandler.default(req, res);
        }
        // Logout endpoint
        if (req.url === '/api/logout') {
            setLogoutCookies(res);
            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({ ok: true, loggedOut: true });
        }
        // Get authenticated user helper function
        async function getAuthenticatedUser() {
            let accessToken;
            // Check Authorization header
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                accessToken = authHeader.substring(7);
            }
            // Check cookies
            const cookiesSource = req.cookies || parseCookieHeader(req.headers.cookie);
            if (!accessToken && cookiesSource) {
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
                            // Try parsing as JSON array
                            if (cookieValue.startsWith('[')) {
                                const stackAccessArray = JSON.parse(cookieValue);
                                if (Array.isArray(stackAccessArray) && stackAccessArray.length >= 2) {
                                    accessToken = stackAccessArray[1];
                                    break;
                                }
                            }
                            // Try parsing as JSON object
                            if (cookieValue.startsWith('{')) {
                                const stackAccessObj = JSON.parse(cookieValue);
                                if (stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt) {
                                    accessToken = stackAccessObj.accessToken || stackAccessObj.token || stackAccessObj.jwt;
                                    break;
                                }
                            }
                            // Try as direct token
                            if (cookieValue.length > 20 && cookieValue.includes('.')) {
                                accessToken = cookieValue;
                                break;
                            }
                        }
                        catch (parseError) {
                            if (cookieValue.length > 20) {
                                accessToken = cookieValue;
                                break;
                            }
                        }
                    }
                }
                if (!accessToken) {
                }
            }
            if (!accessToken) {
                throw new Error('No access token found');
            }
            // Verify JWT token
            const userInfo = await verifyJWTToken(accessToken);
            // Extract user information
            const userId = String(userInfo.sub || userInfo.user_id || userInfo.id || '');
            const userEmail = String(userInfo.email || userInfo.primary_email || userInfo.primaryEmail || userInfo.email_address || userInfo.user_email || '');
            const userName = String(userInfo.displayName || userInfo.display_name || userInfo.name || userInfo.given_name || userInfo.full_name || '');
            console.log('🔍 ENHANCED DEBUG: User info extracted:', {
                id: userId,
                email: userEmail,
                name: userName
            });
            return {
                id: userId,
                email: userEmail,
                firstName: userName?.split(' ')[0] || null,
                lastName: userName?.split(' ').slice(1).join(' ') || null,
                plan: 'sselfie-studio',
                role: 'user',
                stackUser: userInfo
            };
        }
        // Ensure DB user exists
        async function ensureDbUserFromStack(stackUser) {
            const { storage } = await import('../server/storage.js');
            const stackId = (stackUser.id || '');
            const email = (stackUser.email || '');
            // Try by ID
            let dbUser = stackId ? await storage.getUser(stackId) : undefined;
            if (dbUser)
                return dbUser;
            // Try by linked stack auth id
            if (!dbUser && stackId) {
                dbUser = await storage.getUserByStackAuthId(stackId);
                if (dbUser)
                    return dbUser;
            }
            // Try by email, then link
            if (!dbUser && email) {
                const byEmail = await storage.getUserByEmail(email);
                if (byEmail) {
                    return await storage.linkStackAuthId(byEmail.id, stackId || byEmail.id);
                }
            }
            // Create new user
            return await storage.upsertUser(getDefaultUserFields({
                id: stackId || email || `user_${Date.now()}`,
                email: email || null,
                displayName: stackUser.displayName || null,
                firstName: stackUser.firstName || (stackUser.displayName ? stackUser.displayName.split(' ')[0] : null),
                lastName: stackUser.lastName || (stackUser.displayName ? stackUser.displayName.split(' ').slice(1).join(' ') : null),
                profileImageUrl: stackUser.profileImageUrl || null,
            }));
        }
        // Admin export: trained users document
        if (req.url === '/api/admin/export-trained-users-doc') {
            if (req.method !== 'GET')
                return res.status(405).json({ error: 'Method not allowed' });
            try {
                const adminToken = req.headers['x-admin-token'];
                const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
                if (adminToken !== expected)
                    return res.status(401).json({ error: 'Unauthorized' });
                const { storage } = await import('../server/storage.js');
                const models = await storage.getAllCompletedTrainings();
                const header = [
                    '# Trained Users Export',
                    '',
                    'Copy/paste this table into your Stack dashboard import or keep as a reference.',
                    '',
                    '| Email | LegacyUserId | StackId | TriggerWord | ModelStatus | ModelName | ReplicateModelId | ReplicateVersionId | CompletedAt |',
                    '|---|---:|---|---|---|---|---|---|---|'
                ].join('\n');
                const rows = [];
                for (const m of models) {
                    const u = await storage.getUser(m.userId);
                    const email = u?.email || '';
                    const legacyId = u?.id || m.userId;
                    const stackId = u?.stackAuthId || '';
                    const trigger = m?.triggerWord || '';
                    const status = m?.trainingStatus || '';
                    const modelName = m?.modelName || '';
                    const replicateModelId = m?.replicateModelId || '';
                    const replicateVersionId = m?.replicateVersionId || '';
                    const completedAt = m?.completedAt ? new Date(m.completedAt).toISOString() : '';
                    rows.push(`| ${email} | ${legacyId} | ${stackId} | ${trigger} | ${status} | ${modelName} | ${replicateModelId} | ${replicateVersionId} | ${completedAt} |`);
                }
                const markdown = `${header}\n${rows.join('\n')}\n`;
                res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).send(markdown);
            }
            catch (error) {
                return res.status(500).json({ error: 'Failed to export trained users', message: error.message });
            }
        }
        // Auto-registration endpoint
        if (req.url === '/api/auth/auto-register') {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }
            try {
                const { email, plan, source } = req.body || {};
                if (!email || !plan) {
                    return res.status(400).json({ error: 'Email and plan are required' });
                }
                const { storage } = await import('../server/storage.js');
                const existingUser = await storage.getUserByEmail(email);
                if (existingUser) {
                    const updatedUser = await storage.updateUserProfile(existingUser.id, {
                        plan: plan,
                        monthlyGenerationLimit: plan === 'sselfie-studio' ? 100 : -1,
                        mayaAiAccess: true,
                        lastLoginAt: new Date()
                    });
                    return res.status(200).json({
                        success: true,
                        message: 'Account updated successfully',
                        userId: updatedUser.id,
                        email: updatedUser.email,
                        action: 'updated'
                    });
                }
                const newUserId = `user_${Date.now()}_${email.split('@')[0]}`;
                const newUser = await storage.upsertUser(getDefaultUserFields({
                    id: newUserId,
                    email: email,
                    displayName: email.split('@')[0],
                    firstName: null,
                    lastName: null,
                    profileImageUrl: null,
                    plan: plan,
                    monthlyGenerationLimit: plan === 'sselfie-studio' ? 100 : -1,
                    onboardingProgress: JSON.stringify({ source: source || 'payment-success' })
                }));
                res.setHeader('Cache-Control', 'no-store');
                return res.status(201).json({
                    success: true,
                    message: 'Account pre-created successfully',
                    userId: newUser.id,
                    email: newUser.email,
                    plan: newUser.plan,
                    action: 'created'
                });
            }
            catch (error) {
                console.error('❌ AUTO-REGISTRATION: Failed:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create account',
                    message: error.message
                });
            }
        }
        // Stack Auth API proxy endpoints
        if (req.url?.startsWith('/api/auth/') && !req.url.includes('auto-register')) {
            try {
                const stackAuthPath = req.url.replace('/api/auth', '');
                const stackAuthUrl = `https://api.stack-auth.com/api/v1/projects/${STACK_AUTH_PROJECT_ID}${stackAuthPath}`;
                const proxyResponse = await fetch(stackAuthUrl, {
                    method: req.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': req.headers.authorization || '',
                        'x-stack-project-id': STACK_AUTH_PROJECT_ID,
                        'x-stack-access-type': 'client', // 🔥 CRITICAL FIX: Required header for Stack Auth API
                        'x-stack-publishable-client-key': process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '',
                        ...(req.body ? {} : {})
                    },
                    body: req.body ? JSON.stringify(req.body) : undefined
                });
                const responseData = await proxyResponse.text();
                res.setHeader('Content-Type', proxyResponse.headers.get('content-type') || 'application/json');
                res.setHeader('Cache-Control', 'no-store');
                return res.status(proxyResponse.status).send(responseData);
            }
            catch (error) {
                return res.status(500).json({
                    error: 'Stack Auth proxy failed',
                    message: error.message
                });
            }
        }
        // Auth user endpoint
        if (req.url?.includes('/api/auth/user')) {
            try {
                const user = await getAuthenticatedUser();
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json(user);
            }
            catch (error) {
                return res.status(401).json({
                    message: 'Authentication required',
                    error: error.message
                });
            }
        }
        // Admin endpoints
        if (req.url === '/api/admin/backfill-stack-users') {
            if (req.method !== 'POST')
                return res.status(405).json({ error: 'Method not allowed' });
            const adminToken = req.headers['x-admin-token'];
            const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
            if (adminToken !== expected)
                return res.status(401).json({ error: 'Unauthorized' });
            const users = (req.body && req.body.users) || [];
            if (!Array.isArray(users))
                return res.status(400).json({ error: 'users array required' });
            const results = [];
            for (const u of users) {
                const dbUser = await ensureDbUserFromStack({
                    id: u.id,
                    email: u.email,
                    displayName: u.displayName,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    profileImageUrl: u.profileImageUrl,
                });
                results.push({ id: dbUser.id, email: dbUser.email });
            }
            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({ ok: true, count: results.length, users: results });
        }
        if (req.url === '/api/admin/link-legacy-user') {
            if (req.method !== 'POST')
                return res.status(405).json({ error: 'Method not allowed' });
            const adminToken = req.headers['x-admin-token'];
            const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
            if (adminToken !== expected)
                return res.status(401).json({ error: 'Unauthorized' });
            const { legacyUserId, stackId } = (req.body || {});
            if (!legacyUserId || !stackId)
                return res.status(400).json({ error: 'legacyUserId and stackId required' });
            const { storage } = await import('../server/storage.js');
            const linked = await storage.linkStackAuthId(String(legacyUserId), String(stackId));
            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({ ok: true, linkedUserId: linked.id, email: linked.email });
        }
        if (req.url === '/api/admin/export-user-metadata') {
            if (req.method !== 'GET')
                return res.status(405).json({ error: 'Method not allowed' });
            const adminToken = req.headers['x-admin-token'];
            const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
            if (adminToken !== expected)
                return res.status(401).json({ error: 'Unauthorized' });
            const { storage } = await import('../server/storage.js');
            const users = await storage.getAllUsers();
            const result = [];
            for (const u of users) {
                const legacyUserId = u.id;
                const stackId = u.stackAuthId || null;
                const model = await storage.getUserModelByUserId(String(legacyUserId));
                const triggerWord = model?.triggerWord || `user${String(legacyUserId).replace(/[^a-zA-Z0-9]/g, '')}`;
                result.push({
                    email: u.email || null,
                    stackId,
                    legacyUserId,
                    triggerWord,
                    modelStatus: model?.trainingStatus || 'not_started',
                    modelName: model?.modelName || null
                });
            }
            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({ count: result.length, users: result });
        }
        if (req.url === '/api/admin/push-stack-metadata') {
            if (req.method !== 'POST')
                return res.status(405).json({ error: 'Method not allowed' });
            const adminToken = req.headers['x-admin-token'];
            const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
            if (adminToken !== expected)
                return res.status(401).json({ error: 'Unauthorized' });
            const PROJECT_ID = process.env['STACK_AUTH_PROJECT_ID'] || process.env['VITE_STACK_PROJECT_ID'];
            const STACK_KEY = process.env['STACK_ADMIN_KEY'] || process.env['STACK_SERVER_KEY'] || '';
            if (!PROJECT_ID || !STACK_KEY) {
                return res.status(500).json({ error: 'Missing STACK_AUTH_PROJECT_ID or STACK_ADMIN_KEY on server' });
            }
            try {
                const { storage } = await import('../server/storage.js');
                const trainedModels = await storage.getAllCompletedTrainings();
                const updated = [];
                const skipped = [];
                for (const m of trainedModels) {
                    const userId = m.userId;
                    const u = await storage.getUser(userId);
                    const email = u?.email || null;
                    const stackId = u?.stackAuthId || null;
                    if (!stackId) {
                        skipped.push({ userId, reason: 'No stackAuthId' });
                        continue;
                    }
                    const triggerWord = m.triggerWord || `user${String(userId).replace(/[^a-zA-Z0-9]/g, '')}`;
                    const modelStatus = m.trainingStatus || 'completed';
                    const modelName = m.modelName || '';
                    const replicateModelId = m.replicateModelId || '';
                    const replicateVersionId = m.replicateVersionId || '';
                    const body = {
                        metadata: {
                            legacyUserId: userId,
                            triggerWord,
                            modelStatus,
                            modelName,
                            replicateModelId,
                            replicateVersionId,
                        },
                    };
                    let status = 0;
                    try {
                        const resp = await timedFetch(`https://api.stack-auth.com/api/v1/projects/${PROJECT_ID}/users/${stackId}`, 8000, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${STACK_KEY}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body),
                        });
                        status = resp.status;
                        updated.push({ stackId, legacyUserId: userId, email, ok: resp.ok, status });
                    }
                    catch {
                        updated.push({ stackId, legacyUserId: userId, email, ok: false, status });
                    }
                }
                return res.status(200).json({
                    ok: true,
                    projectId: PROJECT_ID,
                    updatedCount: updated.filter(x => x.ok).length,
                    failedCount: updated.filter(x => !x.ok).length,
                    skippedCount: skipped.length,
                    updated,
                    skipped,
                });
            }
            catch (error) {
                return res.status(500).json({ error: 'Push to Stack failed', message: error.message });
            }
        }
        // Admin user repair endpoint
        if (req.url === '/api/admin/repair-users') {
            if (req.method !== 'POST')
                return res.status(405).json({ error: 'Method not allowed' });
            const adminToken = req.headers['x-admin-token'];
            const expected = process.env['ADMIN_TOKEN'] || 'sandra-admin-2025';
            if (adminToken !== expected)
                return res.status(401).json({ error: 'Unauthorized' });
            try {
                const { userSyncRepair } = await import('../server/user-sync-repair.js');
                const { action = 'check', userIdentifier } = req.body;
                switch (action) {
                    case 'check': {
                        const status = await userSyncRepair.checkUserSyncStatus();
                        return res.json({
                            success: true,
                            status,
                            message: `Found ${status.issuesFound.length} synchronization issues`
                        });
                    }
                    case 'repair-all': {
                        const result = await userSyncRepair.repairAllUsers();
                        return res.json({
                            success: true,
                            result,
                            message: `Repaired ${result.repaired} users with ${result.errors.length} errors`
                        });
                    }
                    case 'repair-user': {
                        if (!userIdentifier) {
                            return res.status(400).json({
                                success: false,
                                message: 'userIdentifier required for repair-user action'
                            });
                        }
                        const success = await userSyncRepair.repairUser(userIdentifier);
                        return res.json({
                            success,
                            message: success
                                ? `User ${userIdentifier} repaired successfully`
                                : `Failed to repair user ${userIdentifier}`
                        });
                    }
                    default:
                        return res.status(400).json({
                            success: false,
                            message: 'Invalid action. Use: check, repair-all, or repair-user'
                        });
                }
            }
            catch (error) {
                console.error('❌ User repair endpoint error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'User repair operation failed',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        // ✅ REMOVED DUPLICATE /api/me ENDPOINT - Now using dedicated api/me.ts with hardened middleware
        // User model endpoint - Enhanced with robust error handling and fallback logic
        if (req.url?.includes('/api/user-model')) {
            const t = logStart('GET /api/user-model');
            try {
                const user = await getAuthenticatedUser();
                const { storage } = await import('../server/storage.js');
                let dbUser = null;
                let userModel = null;
                // � BULLETPROOF: Use aggressive Stack Auth ID and email linking
                try {
                    const result = await withDatabaseTimeoutAndRetry(() => storage.getUserModelByStackAuthAndEmail(user.id, user.email || ''), { user: undefined, model: undefined }, 8000, // Increased from 3000ms to 8000ms for optimized JOIN query
                    2, // Increased retries from 1 to 2
                    'getUserModelByStackAuthAndEmail');
                    dbUser = result?.user || null;
                    userModel = result?.model || null;
                    console.log('🔍 ENHANCED DEBUG: Bulletproof lookup result:', {
                        foundUser: !!dbUser,
                        foundModel: !!userModel,
                        trainingStatus: userModel?.trainingStatus || 'not_started',
                        userEmail: dbUser?.email
                    });
                }
                catch (dbError) {
                    console.error('❌ Bulletproof user lookup failed:', {
                        userId: user.id,
                        email: user.email,
                        error: dbError.message
                    });
                    // Fallback to traditional lookup
                    try {
                        dbUser = await withDatabaseTimeout(storage.getUser(user.id), null, 2000, 'getUser');
                        if (!dbUser && user.email) {
                            dbUser = await withDatabaseTimeout(storage.getUserByEmail(user.email), null, 2000, 'getUserByEmail');
                        }
                    }
                    catch (fallbackError) {
                        console.error('❌ Fallback user lookup also failed:', fallbackError.message);
                    }
                }
                // 🎯 FIX: If no database user found, create minimal fallback model for new users
                if (!dbUser) {
                    console.warn(`❌ User ${user.id} authenticated but missing DB record. Creating minimal fallback model.`);
                    const minimalModel = {
                        id: null,
                        userId: user.id,
                        trainingStatus: 'not_started',
                        needsTraining: true,
                        canRetrain: false,
                        modelType: 'sselfie-studio',
                        createdAt: null,
                        updatedAt: null,
                        userPlan: 'sselfie-studio',
                        hasActiveSubscription: false,
                        onboardingSource: 'unknown'
                    };
                    res.setHeader('Cache-Control', 'no-store');
                    t.end('fallback');
                    return json(res, 200, minimalModel);
                }
                // Fetch user model if not already obtained from bulletproof lookup
                if (dbUser && !userModel) {
                    try {
                        const result = await withDatabaseTimeout(storage.getUserModel(dbUser.id), null, 8000, // Increased timeout for better reliability
                        'getUserModel');
                        userModel = result ?? null;
                    }
                    catch (error) {
                        console.warn('📊 Model fetch failed or timed out for:', dbUser.id, error.message);
                        // Continue with null model - will be handled as new user
                        userModel = null;
                    }
                }
                let trainingStatus = 'not_started';
                let needsTraining = true;
                let canRetrain = false;
                if (userModel) {
                    trainingStatus = userModel.trainingStatus || 'not_started';
                    needsTraining = trainingStatus !== 'completed';
                    canRetrain = true;
                    console.log('🔍 ENHANCED DEBUG: Model status:', {
                        id: userModel.id,
                        status: trainingStatus,
                        needsTraining,
                        canRetrain
                    });
                }
                else {
                    needsTraining = true;
                    canRetrain = false;
                }
                let onboardingSourceSafe = 'unknown';
                try {
                    const op = dbUser.onboardingProgress;
                    if (op) {
                        const obj = typeof op === 'string' ? JSON.parse(op) : op;
                        onboardingSourceSafe = (obj && obj.source) || 'unknown';
                    }
                }
                catch {
                    // Ignore parsing errors
                }
                const modelStatus = {
                    id: userModel?.id || null,
                    userId: dbUser.id,
                    trainingStatus: trainingStatus,
                    needsTraining: needsTraining,
                    canRetrain: canRetrain,
                    modelType: 'sselfie-studio',
                    createdAt: userModel?.createdAt || null,
                    updatedAt: userModel?.updatedAt || null,
                    userPlan: dbUser.plan,
                    hasActiveSubscription: (dbUser.monthlyGenerationLimit === -1 || (dbUser.monthlyGenerationLimit && dbUser.monthlyGenerationLimit > 0)),
                    onboardingSource: onboardingSourceSafe
                };
                console.log('🔍 ENHANCED DEBUG: Final model status:', {
                    trainingStatus,
                    needsTraining,
                    canRetrain,
                    userPlan: dbUser.plan,
                    onboardingSource: modelStatus.onboardingSource
                });
                res.setHeader('Cache-Control', 'no-store');
                t.end('ok');
                return json(res, 200, modelStatus);
            }
            catch (error) {
                const elapsed = t.end('error', { error: error.message });
                console.error('❌ Critical Error in /api/user-model:', {
                    error: error.message,
                    stack: error.stack,
                    elapsedMs: elapsed
                });
                // 🛑 Server-side error reporting - log to unified error handler
                // TODO: Add Slack/Sentry notification here
                // await notifyError('Critical /api/user-model failure', error);
                if (isTimeoutError(error)) {
                    return json(res, 500, {
                        error: 'Database timeout - please try again',
                        message: 'Service temporarily unavailable',
                        code: 'TIMEOUT'
                    });
                }
                // Return clean 500 error for any other failures
                return json(res, 500, {
                    error: 'Failed to retrieve user data',
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR'
                });
            }
        }
        // Maya video prompt endpoint
        if (req.url?.includes('/api/maya/get-video-prompt')) {
            const t = logStart('POST /api/maya/get-video-prompt');
            try {
                const user = await getAuthenticatedUser();
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Method not allowed' });
                }
                const { imageUrl } = req.body || {};
                if (!imageUrl) {
                    return res.status(400).json({ error: 'Image URL is required' });
                }
                const videoDirectorPrompt = `You are Maya, SSELFIE Studio's AI Creative Director and Video Director. 

🎬 VIDEO DIRECTION MODE: You are analyzing the actual image provided to create the perfect motion prompt for VEO 3 video generation.

Your expertise includes:
- Cinematic storytelling and visual narrative
- Fashion and lifestyle video aesthetics
- Professional portrait cinematography
- Understanding of what makes compelling short-form video content

TASK: Analyze the provided image carefully and create ONE single, cinematic motion prompt that perfectly enhances what you see in the image.

ANALYSIS INSTRUCTIONS:
1. Study the subject's pose, expression, and mood
2. Observe the lighting, background, and overall composition
3. Consider the style and aesthetic of the image
4. Identify the best camera movement that would enhance the scene

MOTION PROMPT GUIDELINES:
- Keep it to 1-2 sentences maximum
- Focus on movements that specifically enhance THIS image
- Use the actual elements you see (lighting, pose, background, mood)
- Use professional cinematography terminology
- Make it suitable for high-end fashion/lifestyle content
- Be specific to what you observe in the image

Analyze the image and respond with ONLY the motion prompt that perfectly captures and enhances what you see - no explanation, no additional text.`;
                try {
                    const claudeResponse = await timedFetch('https://api.anthropic.com/v1/messages', 15000, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': process.env['ANTHROPIC_API_KEY'] || '',
                            'anthropic-version': '2023-06-01'
                        },
                        body: JSON.stringify({
                            model: 'claude-3-5-sonnet-20241022',
                            max_tokens: 1000,
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            type: 'text',
                                            text: videoDirectorPrompt
                                        },
                                        imageUrl.startsWith('data:')
                                            ? {
                                                type: 'image',
                                                source: {
                                                    type: 'base64',
                                                    media_type: 'image/jpeg',
                                                    data: imageUrl.split(',')[1]
                                                }
                                            }
                                            : {
                                                type: 'image',
                                                source: {
                                                    type: 'url',
                                                    url: imageUrl
                                                }
                                            }
                                    ]
                                }
                            ]
                        })
                    });
                    let videoPrompt = 'Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.';
                    if (claudeResponse.ok) {
                        const data = await claudeResponse.json();
                        videoPrompt = data.content[0].text;
                    }
                    else {
                    }
                    res.setHeader('Cache-Control', 'no-store');
                    t.end('ok');
                    return res.status(200).json({
                        videoPrompt,
                        director: 'Maya - AI Creative Director',
                        timestamp: new Date().toISOString()
                    });
                }
                catch {
                    const fallbackPrompt = 'Gentle zoom in with soft natural lighting, creating an elegant and professional atmosphere.';
                    res.setHeader('Cache-Control', 'no-store');
                    t.end('fallback');
                    return res.status(200).json({
                        videoPrompt: fallbackPrompt,
                        director: 'Maya - AI Creative Director (Fallback)',
                        timestamp: new Date().toISOString()
                    });
                }
            }
            catch (authError) {
                t.end('unauthorized');
                return res.status(401).json({
                    error: 'Authentication required',
                    message: authError.message
                });
            }
        }
        // Maya generate endpoint
        if (req.url?.includes('/api/maya/generate')) {
            try {
                const user = await getAuthenticatedUser();
                const body = req.body || {};
                const { conceptCard } = body;
                if (!conceptCard || !conceptCard.fluxPrompt) {
                    return res.status(400).json({ error: 'Concept card with fluxPrompt is required' });
                }
                // Use the new MayaService instead of old ModelTrainingService
                const { mayaService } = await import('../server/services/maya-service.js');
                const generationResult = await mayaService.generateImages(user.id, {
                    conceptCard
                });
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json({
                    success: true,
                    generationId: generationResult.generationId,
                    status: generationResult.status,
                    message: generationResult.message
                });
            }
            catch (error) {
                return res.status(500).json({
                    message: 'Image generation failed',
                    error: error.message
                });
            }
        }
        // Maya generation status endpoint
        if (req.url?.includes('/api/maya/status')) {
            try {
                const user = await getAuthenticatedUser();
                const url = new globalThis.URL(req.url || '', `http://${req.headers.host}`);
                const generationId = url.searchParams.get('generationId') || url.searchParams.get('predictionId');
                if (!generationId) {
                    return res.status(400).json({ error: 'Generation ID is required' });
                }
                // Use the new MayaService instead of old ModelTrainingService
                const { mayaService } = await import('../server/services/maya-service.js');
                const statusResult = await mayaService.getGenerationStatus(user.id, generationId);
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json(statusResult);
            }
            catch (error) {
                return res.status(500).json({
                    message: 'Status check failed',
                    error: error.message
                });
            }
        }
        // Maya chat endpoints
        if (req.url?.includes('/api/maya/chat') || req.url?.includes('/api/maya-chat') || req.url?.includes('/api/maya-generate')) {
            const t = logStart('POST /api/maya/chat');
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed. Only POST requests are supported.' });
            }
            try {
                const user = await getAuthenticatedUser();
                const body = req.body || {};
                const { message, context = 'styling', conversationHistory = [] } = body;
                if (!message) {
                    return res.status(400).json({ error: 'Message is required' });
                }
                // Use the new MayaService instead of direct Claude API calls
                const { mayaService } = await import('../server/services/maya-service.js');
                const chatResult = await mayaService.processChat(user.id, {
                    message,
                    history: conversationHistory.map(entry => ({
                        user: entry.role === 'user' ? (entry.content || entry.message || '') : undefined,
                        maya: entry.role === 'assistant' ? (entry.content || entry.message || '') : undefined
                    })).filter(entry => entry.user || entry.maya)
                });
                const response = {
                    id: `maya_${Date.now()}`,
                    userId: user.id,
                    message: message,
                    response: chatResult.response,
                    conceptCards: chatResult.conceptCards,
                    timestamp: new Date().toISOString(),
                    context: context
                };
                res.setHeader('Cache-Control', 'no-store');
                t.end('ok', { concepts: response.conceptCards?.length || 0 });
                return res.status(200).json(response);
            }
            catch (error) {
                t.end('error', { error: error.message });
                if (isTimeoutError(error)) {
                    return res.status(503).json({
                        message: 'Maya is temporarily unavailable, please try again',
                        error: 'Service timeout',
                        code: 'TIMEOUT'
                    });
                }
                return res.status(401).json({
                    message: 'Authentication required',
                    error: error.message
                });
            }
        }
        // Maya chats list endpoint
        if (req.url?.includes('/api/maya-chats')) {
            try {
                const user = await getAuthenticatedUser();
                const chats = [
                    {
                        id: `chat_1_${user.id}`,
                        userId: user.id,
                        title: 'Professional Headshots',
                        lastMessage: 'I\'ve generated some professional headshot concepts for you.',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: `chat_2_${user.id}`,
                        userId: user.id,
                        title: 'Creative Portraits',
                        lastMessage: 'Here are some creative portrait ideas to explore.',
                        createdAt: new Date(Date.now() - 172800000).toISOString(),
                        updatedAt: new Date(Date.now() - 3600000).toISOString()
                    }
                ];
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json(chats);
            }
            catch (error) {
                return res.status(401).json({
                    message: 'Authentication required',
                    error: error.message
                });
            }
        }
        // Maya chat history endpoint - CRITICAL FOR CONVERSATION CONTINUITY
        if (req.url?.includes('/api/maya/chat-history')) {
            try {
                const user = await getAuthenticatedUser();
                const { storage } = await import('../server/storage.js');
                // Get Maya chat messages for this user
                const mayaChats = await storage.getMayaChats(user.id);
                if (mayaChats.length === 0) {
                    res.setHeader('Cache-Control', 'no-store');
                    return res.status(200).json({ messages: [] });
                }
                // Get messages from the most recent chat
                const latestChat = mayaChats[0];
                const messages = await storage.getMayaChatMessages(latestChat.id.toString(), user.id);
                // Transform messages to expected format
                const formattedMessages = messages.map(msg => ({
                    id: msg.id,
                    type: msg.role === 'user' ? 'user' : 'maya',
                    content: msg.content,
                    timestamp: msg.createdAt,
                    chatId: msg.chatId
                }));
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json({
                    messages: formattedMessages,
                    chatId: latestChat.id,
                    totalMessages: formattedMessages.length
                });
            }
            catch (error) {
                console.error('❌ Maya chat history error:', error);
                return res.status(401).json({
                    message: 'Authentication required',
                    error: error.message
                });
            }
        }
        // Training status endpoints
        if (req.url === '/api/training/status' || req.url?.startsWith('/api/training/status?')) {
            try {
                const user = await getAuthenticatedUser();
                const { storage } = await import('../server/storage.js');
                const model = await storage.getUserModelByUserId(user.id);
                const status = model?.trainingStatus || 'not_started';
                const progress = model?.trainingProgress || (status === 'completed' ? 100 : 0);
                const predictionId = (await storage.getUserGenerationTrackers(user.id))?.[0]?.predictionId || null;
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json({ status, progress, predictionId, model });
            }
            catch (error) {
                return res.status(401).json({ error: 'Authentication required', message: error.message });
            }
        }
        // Training status alias
        if (req.url === '/api/training-status' || req.url?.startsWith('/api/training-status?')) {
            req.url = '/api/training/status';
            return handler(req, res);
        }
        // Training progress endpoint
        if (req.url?.startsWith('/api/training-progress/')) {
            try {
                const user = await getAuthenticatedUser();
                const targetUserId = req.url.split('/').pop();
                if (user.id !== targetUserId) {
                    return res.status(403).json({ error: 'Forbidden' });
                }
                const { storage } = await import('../server/storage.js');
                const model = await storage.getUserModelByUserId(targetUserId);
                const progress = model?.trainingProgress || (model?.trainingStatus === 'completed' ? 100 : 0);
                return res.status(200).json({ progress });
            }
            catch {
                return res.status(401).json({ error: 'Authentication required' });
            }
        }
        // Cron endpoints
        if (req.url === '/api/cron/training-completion-monitor') {
            try {
                const { TrainingCompletionMonitor } = await import('../server/training-completion-monitor.js');
                await TrainingCompletionMonitor.checkAllInProgressTrainings();
                return res.status(200).json({ ok: true });
            }
            catch (error) {
                return res.status(500).json({ ok: false, error: error.message });
            }
        }
        // Gallery endpoints
        if (req.url === '/api/gallery' || req.url?.startsWith('/api/gallery?') || req.url === '/api/gallery-images' || req.url?.startsWith('/api/gallery-images?')) {
            const t = logStart('GET /api/gallery-images');
            try {
                if (!checkCircuitBreaker()) {
                    console.warn('⚠️ Circuit breaker open for gallery-images');
                    return res.status(503).json({
                        images: [],
                        total: 0,
                        message: 'Service temporarily unavailable',
                        code: 'CIRCUIT_BREAKER_OPEN'
                    });
                }
                const user = await getAuthenticatedUser();
                const { storage } = await import('../server/storage.js');
                const [aiImages, generatedImages] = await Promise.all([
                    withTimeout(storage.getAIImages(user.id), 2500, 'getAIImages').catch(err => {
                        console.warn('⚠️ AI images fetch failed:', err.message);
                        recordCircuitBreakerFailure();
                        return [];
                    }),
                    withTimeout(storage.getGeneratedImages(user.id), 2500, 'getGeneratedImages').catch(err => {
                        console.warn('⚠️ Generated images fetch failed:', err.message);
                        recordCircuitBreakerFailure();
                        return [];
                    })
                ]);
                if (aiImages.length > 0 || generatedImages.length > 0) {
                    recordCircuitBreakerSuccess();
                }
                const galleryImages = [
                    ...aiImages.map(img => ({
                        id: img.id.toString(),
                        userId: img.userId,
                        type: 'ai_generated',
                        title: img.style || 'AI Generated Image',
                        description: img.prompt || 'AI-generated image',
                        imageUrl: img.imageUrl,
                        createdAt: (img.createdAt || new Date()).toISOString(),
                        tags: img.style ? [img.style] : ['ai-generated']
                    })),
                    ...generatedImages.map(img => ({
                        id: `gen_${img.id}`,
                        userId: img.userId,
                        type: 'generated',
                        title: 'Generated Image',
                        description: img.prompt || 'Generated image',
                        imageUrl: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : null),
                        createdAt: (img.createdAt || new Date()).toISOString(),
                        tags: [img.category || 'generated']
                    }))
                ];
                galleryImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                res.setHeader('Cache-Control', 'no-store');
                t.end('ok', { count: galleryImages.length });
                return res.status(200).json(galleryImages);
            }
            catch (error) {
                t.end('error', { error: error.message });
                return res.status(500).json({
                    message: 'Failed to fetch gallery images',
                    error: error.message
                });
            }
        }
        // User gender update endpoint
        if (req.url === '/api/user/update-gender') {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }
            try {
                const user = await getAuthenticatedUser();
                const { gender } = req.body || {};
                if (!gender) {
                    return res.status(400).json({ error: 'Gender is required' });
                }
                if (!['man', 'woman', 'female', 'male', 'non-binary', 'other'].includes(gender.toLowerCase())) {
                    return res.status(400).json({ error: 'Invalid gender value' });
                }
                const { storage } = await import('../server/storage.js');
                await storage.updateUserProfile(user.id, { gender });
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json({
                    success: true,
                    message: 'Gender updated successfully'
                });
            }
            catch (error) {
                return res.status(500).json({
                    error: 'Failed to update gender',
                    message: error.message
                });
            }
        }
        // Test database connection endpoint
        if (req.url === '/api/test-db') {
            try {
                const { storage } = await import('../server/storage.js');
                const user = await getAuthenticatedUser();
                const dbUser = await storage.getUser(user.id);
                const aiImages = await storage.getAIImages(user.id);
                const generatedImages = await storage.getGeneratedImages(user.id);
                return res.status(200).json({
                    message: 'Database connection test',
                    user: {
                        id: user.id,
                        email: user.email,
                        dbUser: dbUser ? { id: dbUser.id, email: dbUser.email } : null
                    },
                    counts: {
                        aiImages: aiImages.length,
                        generatedImages: generatedImages.length
                    },
                    sampleAiImages: aiImages.slice(0, 3),
                    sampleGeneratedImages: generatedImages.slice(0, 3)
                });
            }
            catch (error) {
                return res.status(500).json({
                    message: 'Database connection failed',
                    error: error.message,
                    stack: error.stack
                });
            }
        }
        // Favorites endpoints
        if (req.url === '/api/images/favorites' || req.url?.startsWith('/api/images/favorites?')) {
            try {
                const user = await getAuthenticatedUser();
                const { storage } = await import('../server/storage.js');
                const ai = await withTimeout(storage.getAIImages(user.id), 5000, 'getAIImages');
                const favIds = ai
                    .filter((img) => Boolean(img.isFavorite || img.isSelected))
                    .map((img) => img.id);
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json({ favorites: favIds });
            }
            catch {
                return res.status(200).json({ favorites: [] });
            }
        }
        if (req.url?.startsWith('/api/images/') && req.url?.endsWith('/favorite')) {
            if (req.method !== 'POST')
                return res.status(405).json({ error: 'Method not allowed' });
            try {
                const user = await getAuthenticatedUser();
                const url = new globalThis.URL(req.url || '', `http://${req.headers.host}`);
                const parts = url.pathname.split('/');
                const idStr = parts[3];
                const imageId = parseInt(idStr, 10);
                if (!imageId || Number.isNaN(imageId))
                    return res.status(400).json({ error: 'Invalid image id' });
                const { storage } = await import('../server/storage.js');
                const img = await withTimeout(storage.getAIImage(user.id, imageId), 4000, 'getAIImage');
                const next = !(img?.isFavorite ?? false);
                await withTimeout(storage.updateAIImage(imageId, { isFavorite: next }), 4000, 'updateAIImage');
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json({ ok: true, id: imageId, isFavorite: next });
            }
            catch (error) {
                return res.status(500).json({ error: 'Failed to toggle favorite', message: error.message });
            }
        }
        // Delete AI image endpoint
        if (req.method === 'DELETE' && req.url?.startsWith('/api/ai-images/')) {
            try {
                const user = await getAuthenticatedUser();
                const url = new globalThis.URL(req.url || '', `http://${req.headers.host}`);
                const parts = url.pathname.split('/');
                const idStr = parts[3];
                const imageId = parseInt(idStr, 10);
                if (!imageId || Number.isNaN(imageId))
                    return res.status(400).json({ error: 'Invalid image id' });
                const { storage } = await import('../server/storage.js');
                const ok = await storage.deleteAIImage(user.id, imageId);
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json({ ok, id: imageId });
            }
            catch (error) {
                return res.status(500).json({ error: 'Failed to delete image', message: error.message });
            }
        }
        // 🔥 CRITICAL FIX: Stack Auth API Proxy for /api/v1/ requests
        if (req.url?.startsWith('/api/v1/')) {
            console.log('🔍 ENHANCED DEBUG: Stack Auth API Proxy request:', {
                url: req.url,
                method: req.method,
                headers: {
                    'x-stack-access-type': req.headers['x-stack-access-type'],
                    'x-stack-project-id': req.headers['x-stack-project-id'],
                    'x-stack-publishable-client-key': req.headers['x-stack-publishable-client-key']?.toString().substring(0, 20) + '...'
                }
            });
            try {
                // Forward request to Stack Auth API
                const stackAuthUrl = `https://api.stack-auth.com${req.url}`;
                const stackAuthHeaders = {
                    'Content-Type': 'application/json',
                };
                // Forward all Stack Auth headers
                const stackHeaders = [
                    'x-stack-access-type',
                    'x-stack-project-id',
                    'x-stack-publishable-client-key',
                    'x-stack-random-nonce',
                    'x-stack-allow-anonymous-user',
                    'x-stack-override-error-status',
                    'x-stack-client-version'
                ];
                stackHeaders.forEach(header => {
                    if (req.headers[header]) {
                        stackAuthHeaders[header] = req.headers[header];
                    }
                });
                const stackAuthResponse = await fetch(stackAuthUrl, {
                    method: req.method,
                    headers: stackAuthHeaders,
                    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
                });
                const responseData = await stackAuthResponse.json();
                console.log('🔍 ENHANCED DEBUG: Stack Auth response:', {
                    status: stackAuthResponse.status,
                    hasConfig: !!responseData.config,
                    hasSignUpEnabled: responseData.config?.sign_up_enabled !== undefined
                });
                // Return Stack Auth response with proper headers
                res.setHeader('Content-Type', 'application/json');
                return res.status(stackAuthResponse.status).json(responseData);
            }
            catch (error) {
                console.error('❌ Stack Auth API Proxy Error:', error);
                return res.status(500).json({
                    error: 'Stack Auth API proxy failed',
                    message: error.message
                });
            }
        }
        // Default response for non-Stack Auth requests
        return res.status(200).json({
            message: 'SSELFIE Studio API',
            endpoint: req.url
        });
    }
    catch (error) {
        console.error('❌ API Handler Error:', error);
        const body = { error: 'Internal server error', message: error.message };
        if (typeof res.status === 'function') {
            return res.status(500).json(body);
        }
        else {
            const NodeResponse = globalThis.Response;
            return new NodeResponse(JSON.stringify(body), {
                status: 500,
                headers: { 'content-type': 'application/json' }
            });
        }
    }
}
