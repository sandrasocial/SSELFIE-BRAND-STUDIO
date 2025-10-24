# JWT Token Authentication Fix Guide

**Date:** October 24, 2025
**Status:** Implementation Guide
**Priority:** High

---

## Overview

This guide provides step-by-step fixes for JWT token authentication issues identified in your SSELFIE Brand Studio project.

---

## Issue 1: Anonymous User Support

### Problem
Your code only validates regular user tokens and rejects anonymous user tokens.

### Solution

**File:** `api/_middleware/auth.ts`

**Current Code (Lines 140-143):**
```typescript
const { payload } = await jwtVerify(token, localJwks, {
  issuer: STACK_ISSUER,
  audience: STACK_PROJECT_ID,
  clockTolerance: 30,
});
```

**Fixed Code:**
```typescript
// Support both regular and anonymous user tokens
const anonymousIssuer = STACK_ISSUER.replace(
  '/projects/',
  '/projects-anonymous-users/'
);

const { payload } = await jwtVerify(token, localJwks, {
  issuer: [STACK_ISSUER, anonymousIssuer],
  audience: [STACK_PROJECT_ID, `${STACK_PROJECT_ID}:anon`],
  clockTolerance: 30,
});
```

### Why This Matters
- Anonymous users have different issuer and audience claims
- Without this, anonymous sessions will fail with "Invalid audience" error
- Stack Auth supports anonymous sessions for unauthenticated users

---

## Issue 2: Token Refresh Mechanism

### Problem
Tokens expire after 10 minutes, but your code doesn't refresh them.

### Solution

**File:** `api/_middleware/auth.ts`

**Add Refresh Token Extraction:**
```typescript
function extractRefreshToken(req: VercelRequest): string | undefined {
  const cookies = parseCookies(req.headers.cookie);
  
  // Stack Auth's refresh token cookie
  if (cookies['stack-refresh']) {
    const token = cookies['stack-refresh'];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }
  
  // Fallback names
  const fallbackNames = ['stack_refresh', 'stack-refresh-token'];
  for (const name of fallbackNames) {
    const token = cookies[name];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }
  
  return undefined;
}
```

**Add Refresh Function:**
```typescript
async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${STACK_AUTH_API_URL}/api/v1/auth/sessions/current/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-stack-project-id': STACK_PROJECT_ID,
          'x-stack-refresh-token': refreshToken,
        },
      }
    );

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.accessToken || data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}
```

**Update Error Handling:**
```typescript
try {
  const { payload } = await jwtVerify(token, localJwks, {...});
  // ... rest of code
} catch (error) {
  // Check if token is expired
  if (error.code === 'ERR_JWT_EXPIRED') {
    const refreshToken = extractRefreshToken(req);
    
    if (refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      
      if (newAccessToken) {
        // Set new token in cookie
        res.setHeader(
          'Set-Cookie',
          `stack-access=${newAccessToken}; Path=/; HttpOnly; Secure; SameSite=Lax`
        );
        
        // Retry verification with new token
        const { payload } = await jwtVerify(newAccessToken, localJwks, {...});
        const user = await getOrCreateDatabaseUser(payload);
        (req as AuthenticatedRequest).user = user;
        return await handler(req as AuthenticatedRequest, res);
      }
    }
  }
  
  // Token refresh failed or no refresh token
  return res.status(401).json({
    error: 'Authentication failed',
    message: 'Token expired and refresh failed'
  });
}
```

### Why This Matters
- Default token lifetime is 10 minutes
- Without refresh, users are logged out after 10 minutes
- Refresh tokens allow maintaining long-lived sessions
- Stack Auth automatically handles refresh on client side

---

## Issue 3: Improved Token Extraction

### Problem
Your code only checks cookies, missing other token sources.

### Solution

**File:** `api/_middleware/auth.ts`

**Current Code (Lines 171-194):**
```typescript
function extractToken(req: VercelRequest): string | undefined {
  const cookies = parseCookies(req.headers.cookie);
  
  if (cookies['stack-access']) {
    const token = cookies['stack-access'];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }
  
  const fallbackCookieNames = [
    'stack_access',
    'stack-access-token',
    'stack_access_token',
  ];
  
  for (const name of fallbackCookieNames) {
    const token = cookies[name];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }
}
```

**Fixed Code:**
```typescript
function extractToken(req: VercelRequest): string | undefined {
  // 1. Authorization header (preferred method)
  const authHeader = req.headers.authorization;
  const authHeaderValue = Array.isArray(authHeader) 
    ? authHeader[0] 
    : authHeader;
  
  if (authHeaderValue?.startsWith('Bearer ')) {
    return authHeaderValue.substring(7);
  }
  
  // 2. Stack Auth specific headers
  if (req.headers['x-stack-access-token']) {
    const token = req.headers['x-stack-access-token'] as string;
    if (token && token.length > 20) {
      return token;
    }
  }
  
  // 3. Cookies (primary for browser clients)
  const cookies = parseCookies(req.headers.cookie);
  
  if (cookies['stack-access']) {
    const token = cookies['stack-access'];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }
  
  // 4. Fallback cookie names
  const fallbackCookieNames = [
    'stack_access',
    'stack-access-token',
    'stack_access_token',
  ];
  
  for (const name of fallbackCookieNames) {
    const token = cookies[name];
    if (token && typeof token === 'string' && token.length > 20) {
      return token;
    }
  }
  
  return undefined;
}
```

### Why This Matters
- Different clients send tokens in different ways
- Mobile apps use Authorization header
- Server-to-server uses custom headers
- Browser clients use cookies
- Supporting all methods ensures compatibility

---

## Issue 4: Better Error Handling

### Problem
Generic error messages make debugging difficult.

### Solution

**File:** `api/_middleware/auth.ts`

**Add Error Type Detection:**
```typescript
function getJWTErrorCode(error: any): string {
  if (error.code) return error.code;
  if (error.message?.includes('expired')) return 'ERR_JWT_EXPIRED';
  if (error.message?.includes('signature')) return 'ERR_JWT_INVALID_SIGNATURE';
  if (error.message?.includes('audience')) return 'ERR_JWT_INVALID_AUDIENCE';
  if (error.message?.includes('issuer')) return 'ERR_JWT_INVALID_ISSUER';
  return 'ERR_JWT_UNKNOWN';
}
```

**Update Error Handling:**
```typescript
catch (error) {
  const errorCode = getJWTErrorCode(error);
  
  console.error('❌ JWT verification failed:', {
    code: errorCode,
    message: error instanceof Error ? error.message : error,
    url: req.url,
    method: req.method
  });
  
  // Handle specific error types
  if (errorCode === 'ERR_JWT_EXPIRED') {
    return res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
      message: 'Your session has expired. Please sign in again.'
    });
  }
  
  if (errorCode === 'ERR_JWT_INVALID_SIGNATURE') {
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_SIGNATURE',
      message: 'Token signature is invalid'
    });
  }
  
  if (errorCode === 'ERR_JWT_INVALID_AUDIENCE') {
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_AUDIENCE',
      message: 'Token is for a different project'
    });
  }
  
  // Generic error
  return res.status(401).json({
    error: 'Authentication failed',
    code: errorCode,
    message: error instanceof Error ? error.message : 'Unknown error'
  });
}
```

### Why This Matters
- Specific error codes help with debugging
- Clients can handle different error types appropriately
- Better logging for monitoring and troubleshooting
- Follows Stack Auth best practices

---

## Implementation Order

1. **Step 1:** Add anonymous user support (5 min)
2. **Step 2:** Add token refresh mechanism (15 min)
3. **Step 3:** Improve token extraction (10 min)
4. **Step 4:** Add better error handling (10 min)
5. **Step 5:** Test all changes (20 min)

---

## Testing Checklist

- [ ] Regular user authentication works
- [ ] Anonymous user authentication works
- [ ] Token refresh works after 10 minutes
- [ ] Authorization header tokens work
- [ ] Custom header tokens work
- [ ] Cookie tokens work
- [ ] Expired token error is specific
- [ ] Invalid signature error is specific
- [ ] Invalid audience error is specific

---

## References

- [Stack Auth JWT Documentation](https://docs.stack-auth.com/react/concepts/jwt)
- [Jose Library Documentation](https://github.com/panva/jose)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Generated:** October 24, 2025
**Status:** Ready for Implementation

