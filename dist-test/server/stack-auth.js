/* eslint-disable no-console */
import { jwtVerify, createRemoteJWKSet } from 'jose';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath, URL } from 'url';
// ES module __dirname equivalent - with Node16 compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Stack Auth configuration - use environment variables
const STACK_AUTH_PROJECT_ID = process.env.STACK_AUTH_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const STACK_AUTH_API_URL = 'https://api.stack-auth.com/api/v1';
const JWKS_URL = `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}/.well-known/jwks.json`;
// Create JWKS resolver or use test public key in test mode
import { createPublicKey } from 'crypto';
let testPublicKey;
let remoteJwks;
if (process.env['NODE_ENV'] === 'test') {
    // Use test public key for JWT verification as a KeyObject
    const testPubKeyPath = path.join(__dirname, '__tests__', 'test-public.key');
    const testPublicKeyPem = fs.readFileSync(testPubKeyPath, 'utf8');
    testPublicKey = createPublicKey({ key: testPublicKeyPem, format: 'pem', type: 'spki' });
}
else {
    remoteJwks = createRemoteJWKSet(new URL(JWKS_URL));
}
const authCache = new Map();
const CACHE_DURATION = 3 * 60 * 1000; // Reduced from 5 to 3 minutes for faster auth updates
const MAX_CACHE_SIZE = 500; // Reduced from 1000 to 500 for better memory management
// Clean expired cache entries
function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of Array.from(authCache.entries())) {
        if (now - cached.timestamp > CACHE_DURATION) {
            authCache.delete(key);
        }
    }
    // Prevent memory leaks by limiting cache size
    if (authCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(authCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toDelete = entries.slice(0, authCache.size - MAX_CACHE_SIZE + 100);
        toDelete.forEach(([key]) => authCache.delete(key));
    }
}
// Simple hash function for tokens
function hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}
// ✅ SIMPLIFIED: Direct Stack Auth integration - no token exchange needed
// Verify JWT token directly using Stack Auth JWKS or test public key with timeout
async function verifyJWTToken(token) {
    try {
        // Add timeout to JWT verification to prevent hanging
        const verificationPromise = new Promise((resolve, reject) => {
            (async () => {
                try {
                    let payload;
                    if (process.env['NODE_ENV'] === 'test' && testPublicKey) {
                        // Use test public key and RS256
                        const { payload: testPayload } = await jwtVerify(token, testPublicKey, {
                            algorithms: ['RS256'],
                            issuer: `${STACK_AUTH_API_URL}/projects/${STACK_AUTH_PROJECT_ID}`,
                            audience: STACK_AUTH_PROJECT_ID,
                        });
                        payload = testPayload;
                    }
                    else {
                        // Verify JWT using Stack Auth's JWKS
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
            })();
        });
        // Race between verification and timeout
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
        // Skip authentication for non-protected routes to improve performance
        const skipPaths = ['/api/proxy-image', '/notification-preferences'];
        if (skipPaths.some(path => req.path.startsWith(path))) {
            return next();
        }
        // Check Authorization header for Bearer token
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }
        // Check cookies for stored access token
        if (!accessToken && req.cookies) {
            // Helper: attempt to parse token from any cookie named like 'stack-access*'
            const tryParseAccessFromCookieValue = (val) => {
                if (!val || typeof val !== 'string')
                    return undefined;
                try {
                    // New format: JSON array ["token_id", "jwt"]
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[1] === 'string') {
                        return parsed[1];
                    }
                }
                catch {
                    // Some environments may store the raw JWT as a string
                    if (val.split('.').length === 3)
                        return val; // looks like a JWT
                }
                return undefined;
            };
            // 1) Exact key
            const exact = req.cookies['stack-access'];
            if (!accessToken && exact) {
                const token = tryParseAccessFromCookieValue(exact);
                if (token) {
                    accessToken = token;
                }
            }
            // 2) Any cookie whose name starts with 'stack-access'
            if (!accessToken) {
                const matchingKeys = Object.keys(req.cookies).filter(k => k.startsWith('stack-access'));
                for (const key of matchingKeys) {
                    const token = tryParseAccessFromCookieValue(req.cookies[key]);
                    if (token) {
                        accessToken = token;
                        break;
                    }
                }
            }
            // 3) Legacy fallback
            if (!accessToken) {
                const legacy = req.cookies['stack-access-token'];
                if (legacy) {
                    accessToken = legacy;
                }
            }
            if (!accessToken) {
                // Log cookie names only (no values) to avoid leaking data
            }
        }
        if (!accessToken) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Check cache first for performance
        const tokenHash = hashToken(accessToken);
        const cached = authCache.get(tokenHash);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            req.user = cached.dbUser;
            return next();
        }
        // Clean expired cache periodically
        if (Math.random() < 0.1) {
            cleanExpiredCache();
        }
        // Verify JWT token directly
        const userInfo = await verifyJWTToken(accessToken);
        // Extract user information with multiple field name attempts and enhanced debugging
        const userId = userInfo?.sub || userInfo?.user_id || userInfo?.id || '';
        const userEmail = userInfo?.email || userInfo?.primary_email || userInfo?.primaryEmail || userInfo?.email_address || userInfo?.user_email || '';
        const userName = userInfo?.displayName || userInfo?.display_name || userInfo?.name || userInfo?.given_name || userInfo?.full_name || 'User';
        // 🔍 ENHANCED DEBUGGING: Log all available fields to identify email field
        console.log('🔍 Available userInfo fields:', {
            email: userInfo.email,
            primary_email: userInfo.primary_email,
            primaryEmail: userInfo.primaryEmail,
            email_address: userInfo.email_address,
            user_email: userInfo.user_email
        });
        console.log('🔍 Creating/linking user with:', {
            id: userId,
            email: userEmail,
            name: userName
        });
        // Get or create user in our database with email-based linking for existing users
        const { storage } = await import('./storage.js');
        // Step 1: Try to find user by Stack Auth ID first
        let dbUser;
        try {
            dbUser = await storage.getUserByStackAuthId(userId);
            console.log('🔍 Step 1 - getUserByStackAuthId result:', {
                userId,
                found: !!dbUser,
                dbUserId: dbUser?.id,
                dbUserEmail: dbUser?.email
            });
        }
        catch (error) {
            console.error('❌ Step 1 - getUserByStackAuthId error:', error);
        }
        if (!dbUser) {
            // Step 2: Try to find existing user by email (for migration from integer IDs)
            if (userEmail) {
                try {
                    dbUser = await storage.getUserByEmail(userEmail);
                    console.log('🔍 Step 2 - getUserByEmail result:', {
                        userEmail,
                        found: !!dbUser,
                        dbUserId: dbUser?.id,
                        dbUserStackAuthId: dbUser?.stackAuthId
                    });
                    if (dbUser) {
                        // Step 3: Link existing user to Stack Auth ID
                        console.log('🔗 Step 3 - Linking existing user to Stack Auth ID');
                        dbUser = await storage.linkStackAuthId(dbUser.id, userId);
                        console.log('✅ Step 3 - Successfully linked user:', {
                            dbUserId: dbUser.id,
                            stackAuthId: userId
                        });
                    }
                }
                catch (error) {
                    console.error('❌ Step 2/3 error:', error);
                }
            }
        }
        if (!dbUser) {
            // Step 4: Create new user if not found by Stack Auth ID or email
            dbUser = await storage.upsertUser({
                id: userId,
                stackAuthId: userId,
                email: userEmail || null,
                firstName: userName?.split(' ')[0] || null,
                lastName: userName?.split(' ').slice(1).join(' ') || null,
                profileImageUrl: userInfo.profileImageUrl || userInfo.profile_image_url || userInfo.avatar_url || null,
                plan: null, // New users have no plan until they subscribe
                monthlyGenerationLimit: 0, // No generations until they subscribe
                mayaAiAccess: false // No AI access until they subscribe
            });
        }
        else {
            // User exists, continue with existing user data
        }
        // Set user information in request from database user
        req.user = dbUser;
        // Cache the authenticated user for performance
        authCache.set(tokenHash, {
            dbUser,
            timestamp: Date.now(),
            tokenHash
        });
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
// ✅ REMOVED: Complex OAuth callback handler no longer needed with direct Stack Auth integration
// Middleware that requires authentication
// Middleware to check active subscription for workspace access
export function requireActiveSubscription(req, res, next) {
    requireStackAuth(req, res, async () => {
        try {
            const user = req.user;
            if (!user || !user.id) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            // Check if user has active subscription
            const { storage } = await import('./storage.js');
            const subscription = await storage.getUserSubscription(user.id);
            // Allow admin users and users with active subscriptions
            if (user.role === 'admin' || user.monthlyGenerationLimit === -1) {
                return next();
            }
            if (!subscription || subscription.status !== 'active') {
                return res.status(402).json({
                    message: 'SSELFIE Studio subscription required (€47/month)',
                    redirectTo: '/checkout',
                    requiresPayment: true
                });
            }
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
// Optional authentication - doesn't block if no token
export async function optionalStackAuth(req, res, next) {
    try {
        await verifyStackAuthToken(req, res, () => { }); // Don't call next() in callback
        next(); // Call next here if verification succeeds
    }
    catch {
        // If verification fails, still continue but without user
        req.user = undefined;
        next();
    }
}
// Admin authentication - requires admin role
export async function authenticateAdmin(req, res, next) {
    try {
        await verifyStackAuthToken(req, res, () => { });
        // Check if user has admin role
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }
    catch {
        // Authentication failed, return 401
        return res.status(401).json({ error: 'Authentication required' });
    }
}
