# JWT Token Authentication Analysis

**Date:** October 24, 2025
**Status:** ⚠️ ISSUES IDENTIFIED
**Severity:** High

---

## Executive Summary

Your authentication implementation has **several issues** compared to Stack Auth's recommended JWT handling:

1. ✅ **Correct:** Using httpOnly cookies (secure storage)
2. ✅ **Correct:** Verifying JWT signatures with JWKS
3. ⚠️ **Issue:** Not handling anonymous user tokens
4. ⚠️ **Issue:** Not supporting token refresh mechanism
5. ⚠️ **Issue:** Incomplete audience validation
6. ⚠️ **Issue:** Missing error handling for expired tokens

---

## Current Implementation Analysis

### 1. Token Storage ✅ CORRECT

**Current Implementation:**
```typescript
// stack/client.ts
tokenStore: "cookie",
const cookieConfig = {
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 days
};
```

**Stack Auth Recommendation:**
> "Never store JWTs in localStorage for sensitive applications. Use secure, httpOnly cookies when possible."

**Status:** ✅ **CORRECT** - Using httpOnly cookies via Stack Auth SDK

---

### 2. Token Verification ✅ MOSTLY CORRECT

**Current Implementation:**
```typescript
// api/_middleware/auth.ts
const { payload } = await jwtVerify(token, localJwks, {
  issuer: STACK_ISSUER,
  audience: STACK_PROJECT_ID,
  clockTolerance: 30,
});
```

**Stack Auth Recommendation:**
```typescript
const { payload } = await jose.jwtVerify(token, jwks, {
  issuer: 'https://api.stack-auth.com/api/v1/projects/YOUR_PROJECT_ID',
  audience: 'YOUR_PROJECT_ID',
});
```

**Status:** ✅ **CORRECT** - Verifying issuer and audience

---

### 3. Anonymous User Support ⚠️ MISSING

**Stack Auth Recommendation:**
```typescript
const { payload } = await jose.jwtVerify(token, jwks, {
  issuer: [
    'https://api.stack-auth.com/api/v1/projects/YOUR_PROJECT_ID',
    'https://api.stack-auth.com/api/v1/projects-anonymous-users/YOUR_PROJECT_ID',
  ],
  audience: ['YOUR_PROJECT_ID', 'YOUR_PROJECT_ID:anon'],
});
```

**Current Implementation:**
```typescript
// api/_middleware/auth.ts
const { payload } = await jwtVerify(token, localJwks, {
  issuer: STACK_ISSUER,  // Only regular issuer
  audience: STACK_PROJECT_ID,  // Only regular audience
  clockTolerance: 30,
});
```

**Status:** ⚠️ **ISSUE** - Not supporting anonymous user tokens
- Anonymous tokens have different issuer and audience
- Your code will reject anonymous user tokens
- Need to support both regular and anonymous issuers/audiences

---

### 4. Token Refresh Mechanism ⚠️ MISSING

**Stack Auth Recommendation:**
> "JWTs have a limited lifetime (default is 10 minutes via STACK_ACCESS_TOKEN_EXPIRATION_TIME). Stack Auth automatically refreshes tokens before they expire."

**Current Implementation:**
```typescript
// api/_middleware/auth.ts
const TOKEN_CACHE = new Map<string, { payload: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

**Status:** ⚠️ **ISSUE** - No refresh token handling
- Tokens expire after 10 minutes
- Your code caches tokens for 5 minutes
- After 10 minutes, tokens become invalid
- No mechanism to refresh expired tokens
- Users will be logged out after 10 minutes

---

### 5. Cookie Configuration ⚠️ INCOMPLETE

**Current Implementation:**
```typescript
// server/_shared/cookies.ts
const names = [
  'stack-access',
  'stack-access-token',
  'stack_session',
  '__Secure-next-auth.session-token',
];
```

**Stack Auth Standard:**
- Primary cookie: `stack-access` (contains JWT)
- Refresh token: `stack-refresh` (for token refresh)
- Session: `stack-session` (optional)

**Status:** ⚠️ **ISSUE** - Missing refresh token cookie handling
- Not extracting or forwarding refresh tokens
- Cannot implement token refresh
- Users cannot maintain long-lived sessions

---

### 6. Token Extraction ⚠️ INCOMPLETE

**Current Implementation:**
```typescript
// api/_middleware/auth.ts
function extractToken(req: VercelRequest): string | undefined {
  const cookies = parseCookies(req.headers.cookie);
  
  if (cookies['stack-access']) {
    const token = cookies['stack-access'];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }
  // ... fallback names
}
```

**Missing:**
- No extraction of refresh token
- No support for Bearer token in Authorization header
- No support for `x-stack-access-token` header

**Stack Auth Recommendation:**
```typescript
// Check Authorization header (preferred method)
const authHeader = req.headers.authorization;
if (authHeaderValue?.startsWith('Bearer ')) {
  accessToken = authHeaderValue.substring(7);
}

// Check Stack Auth specific headers
if (!accessToken && req.headers['x-stack-access-token']) {
  accessToken = req.headers['x-stack-access-token'] as string;
}

// Check cookies
if (!accessToken && cookies['stack-access']) {
  accessToken = cookies['stack-access'];
}
```

**Status:** ⚠️ **ISSUE** - Limited token extraction methods

---

### 7. Error Handling ⚠️ INCOMPLETE

**Current Implementation:**
```typescript
// api/_middleware/auth.ts
try {
  const { payload } = await jwtVerify(token, localJwks, {
    issuer: STACK_ISSUER,
    audience: STACK_PROJECT_ID,
    clockTolerance: 30,
  });
} catch (error) {
  console.error('❌ Authentication failed:', {
    error: error instanceof Error ? error.message : error,
  });
  return res.status(401).json({
    error: 'Authentication failed',
    message: error instanceof Error ? error.message : 'Unknown error'
  });
}
```

**Missing:**
- No specific handling for expired tokens
- No distinction between invalid signature vs expired token
- No automatic token refresh attempt
- No clear error messages for debugging

**Stack Auth Recommendation:**
```typescript
// Distinguish between different error types
if (error.code === 'ERR_JWT_EXPIRED') {
  // Token expired - attempt refresh
  return attemptTokenRefresh(req, res);
}

if (error.code === 'ERR_JWT_INVALID_SIGNATURE') {
  // Token tampered with - clear cookies and reject
  clearAuthCookies(res);
  return res.status(401).json({ error: 'Invalid token' });
}

if (error.code === 'ERR_JWT_INVALID_AUDIENCE') {
  // Token for different project - reject
  return res.status(401).json({ error: 'Invalid audience' });
}
```

**Status:** ⚠️ **ISSUE** - Generic error handling

---

## Recommended Fixes

### Priority 1: Add Anonymous User Support
```typescript
const { payload } = await jwtVerify(token, localJwks, {
  issuer: [
    STACK_ISSUER,
    STACK_ISSUER.replace('/projects/', '/projects-anonymous-users/'),
  ],
  audience: [STACK_PROJECT_ID, `${STACK_PROJECT_ID}:anon`],
  clockTolerance: 30,
});
```

### Priority 2: Implement Token Refresh
```typescript
// Extract refresh token from cookies
const refreshToken = cookies['stack-refresh'];

// On token expiration, attempt refresh
if (error.code === 'ERR_JWT_EXPIRED' && refreshToken) {
  const newToken = await refreshAccessToken(refreshToken);
  // Set new token in cookie
  res.setHeader('Set-Cookie', `stack-access=${newToken}; ...`);
}
```

### Priority 3: Improve Token Extraction
```typescript
// Support multiple token sources
function extractToken(req: VercelRequest): string | undefined {
  // 1. Authorization header (preferred)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 2. Stack Auth header
  if (req.headers['x-stack-access-token']) {
    return req.headers['x-stack-access-token'] as string;
  }
  
  // 3. Cookies
  const cookies = parseCookies(req.headers.cookie);
  return cookies['stack-access'];
}
```

### Priority 4: Better Error Handling
```typescript
// Distinguish error types
try {
  const { payload } = await jwtVerify(token, localJwks, {...});
} catch (error) {
  if (error.code === 'ERR_JWT_EXPIRED') {
    return res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }
  // ... other error types
}
```

---

## Summary of Issues

| Issue | Severity | Impact | Fix |
|-------|----------|--------|-----|
| No anonymous user support | High | Cannot support anonymous sessions | Add anonymous issuer/audience |
| No token refresh | Critical | Users logged out after 10 min | Implement refresh mechanism |
| Limited token extraction | Medium | Some clients can't authenticate | Support all token sources |
| Generic error handling | Medium | Hard to debug issues | Add specific error types |
| Missing refresh token handling | High | Cannot maintain sessions | Extract and forward refresh tokens |

---

## Next Steps

1. **Immediate:** Add anonymous user support
2. **High Priority:** Implement token refresh mechanism
3. **Medium Priority:** Improve token extraction
4. **Medium Priority:** Add specific error handling

---

**Generated:** October 24, 2025
**Status:** Analysis Complete - Ready for Implementation

