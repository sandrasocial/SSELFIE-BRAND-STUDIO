# Stack Auth Configuration Guide

## Critical OAuth Setup Requirements

This document outlines the required Stack Auth dashboard configuration for OAuth to work correctly.

## Problem Statement

Users can complete Google OAuth flow but authentication system fails to:
- Create persistent authentication tokens/cookies (stack-access tokens missing)
- Link authenticated users to their database records and metadata
- Properly redirect authenticated users to /app after successful login

## Root Cause

Stack Auth OAuth callbacks require proper configuration in the Stack Auth dashboard. The redirect URLs must be whitelisted for OAuth token exchange to succeed.

## Required Stack Auth Dashboard Configuration

### 1. Navigate to Stack Auth Dashboard
- URL: https://app.stack-auth.com
- Select project: `253d7343-a0d4-43a1-be5c-822f590d40be`

### 2. Configure OAuth Settings

Go to **Settings > OAuth Providers** and ensure Google OAuth is enabled.

### 3. Add Allowed Redirect URLs

Navigate to **Settings > Domains & URLs** and add the following redirect URLs:

#### Production URLs (REQUIRED)
```
https://www.sselfie.ai/handler/oauth-callback
https://sselfie.ai/handler/oauth-callback
https://www.sselfie.ai/auth-success
https://sselfie.ai/auth-success
```

#### Development URLs (for local testing)
```
http://localhost:5173/handler/oauth-callback
http://localhost:3000/handler/oauth-callback
http://localhost:8080/handler/oauth-callback
http://localhost:5173/auth-success
http://localhost:3000/auth-success
```

### 4. Configure After-Sign-In URLs

In **Settings > URLs**, set:
- **After Sign In**: `/auth-success`
- **After Sign Up**: `/auth-success`
- **After Sign Out**: `/`

### 5. Verify API Keys

Ensure the following environment variables are set correctly:

```env
STACK_AUTH_PROJECT_ID=253d7343-a0d4-43a1-be5c-822f590d40be
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg
STACK_AUTH_SECRET_KEY=<your-secret-server-key>
```

## OAuth Flow Architecture

### Expected Flow
1. **User clicks "Sign in with Google"**
   - Client calls Stack Auth API
   - Stack Auth redirects to Google OAuth consent page

2. **User authorizes on Google**
   - Google redirects back to `/handler/oauth-callback` with `code` and `state`
   - URL: `https://www.sselfie.ai/handler/oauth-callback?code=...&state=...`

3. **OAuth Callback Processing**
   - `OAuthCallback` component calls `app.callOAuthCallback()`
   - Stack Auth exchanges authorization code for access tokens
   - Stack Auth sets `stack-access` cookie with JWT token

4. **Redirect to Auth Success**
   - Application redirects to `/auth-success`
   - Auth success page waits for `stack-access` token to be set
   - Once token detected, redirects to `/` (SmartHome routing)

5. **Database User Sync**
   - `SmartHome` component calls `/api/me`
   - API middleware extracts `stack-access` token
   - Middleware calls `getAuthenticatedUser` → `userService.getOrCreateUser`
   - User created/linked in database
   - User redirected to appropriate page based on training status

## Troubleshooting

### Issue: No `stack-access` token created after OAuth

**Symptoms:**
- OAuth cookies (`stack-oauth-outer`, `stack-oauth-inner`) present
- No `stack-access` cookie
- API returns 401 Unauthorized

**Solutions:**
1. Verify redirect URLs are whitelisted in Stack Auth dashboard
2. Check browser console for errors during OAuth callback
3. Verify `VITE_STACK_PUBLISHABLE_CLIENT_KEY` matches dashboard
4. Ensure `app.callOAuthCallback()` is being called in OAuth callback handler

### Issue: 307 Redirect Error

**Symptom:**
- Stack Auth API returns 307 status

**Solution:**
- This indicates redirect URL is not whitelisted
- Add the redirect URL to Stack Auth dashboard

### Issue: User not created in database

**Symptoms:**
- `stack-access` token created successfully
- `/api/me` returns 401 or empty response
- User can't access `/app`

**Solutions:**
1. Verify database connection
2. Check `userService.getOrCreateUser` logs
3. Ensure `api/_middleware/auth.ts` is properly extracting tokens
4. Verify Stack Auth secret key is set correctly

## Testing Checklist

After configuration, verify:
- [ ] User can click "Sign in with Google"
- [ ] Google OAuth consent page loads
- [ ] After authorization, user redirected to `/handler/oauth-callback`
- [ ] OAuth callback processes without errors
- [ ] `stack-access` cookie is set (check DevTools > Application > Cookies)
- [ ] User redirected to `/auth-success`
- [ ] Auth success detects token and redirects to `/`
- [ ] `/api/me` returns user data (not 401)
- [ ] User redirected to `/app` or `/simple-training` based on training status
- [ ] User can refresh page and remain authenticated

## Code References

### Client-Side OAuth Configuration
- Stack Auth client config: `stack/client.ts`
- OAuth callback handler: `client/src/pages/OAuthCallback.tsx`
- Auth success page: `client/src/pages/auth-success.tsx`
- Routing: `client/src/App.tsx`

### Server-Side Configuration
- API auth middleware: `api/_middleware/auth.ts`
- User service: `server/services/user-service.ts`
- Stack Auth server config: `stack/server.ts`

## Support

If issues persist after following this guide:
1. Check Stack Auth dashboard for configuration errors
2. Review browser console logs during OAuth flow
3. Check server logs for token verification errors
4. Verify all environment variables are set correctly
