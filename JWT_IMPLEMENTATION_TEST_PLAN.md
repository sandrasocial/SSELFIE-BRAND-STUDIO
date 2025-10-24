# JWT Token Authentication Implementation - Test Plan

**Date:** October 24, 2025
**Status:** Phase 1 & 2 Complete - Ready for Testing
**Implementation:** 100% Complete

---

## Implementation Summary

### ✅ Phase 1: Critical Fixes (COMPLETE)

1. **Anonymous User Support** ✅
   - Added support for anonymous issuer and audience
   - Validates against both regular and anonymous tokens
   - File: `api/_middleware/auth.ts` (lines 125-174)

2. **Token Refresh Mechanism** ✅
   - Automatic token refresh on expiration
   - Calls Stack Auth refresh endpoint
   - Sets new token in Set-Cookie header
   - File: `api/_middleware/auth.ts` (lines 251-289)

3. **Refresh Token Extraction** ✅
   - Extracts `stack-refresh` cookie
   - Supports fallback cookie names
   - File: `api/_middleware/auth.ts` (lines 219-248)

### ✅ Phase 2: Improvements (COMPLETE)

4. **Token Extraction** ✅
   - Supports cookies (primary)
   - Supports Authorization header (Bearer token)
   - Supports custom headers (x-stack-access-token)
   - File: `api/_middleware/auth.ts` (lines 176-217)

5. **Error Handling** ✅
   - Specific error codes for different failures
   - ERR_JWT_EXPIRED, ERR_JWT_INVALID_SIGNATURE, etc.
   - Better logging for debugging
   - File: `api/_middleware/auth.ts` (lines 346-365)

---

## Testing Checklist

### Unit Tests

#### Test 1: Regular User Authentication
- [ ] Extract token from `stack-access` cookie
- [ ] Verify JWT signature with JWKS
- [ ] Validate issuer claim
- [ ] Validate audience claim
- [ ] Create/update database user
- [ ] Return authenticated user

**Expected:** ✅ Success with user data

#### Test 2: Anonymous User Authentication
- [ ] Extract token from `stack-access` cookie
- [ ] Token has anonymous issuer
- [ ] Token has anonymous audience (`:anon`)
- [ ] Verify JWT signature
- [ ] Accept anonymous token
- [ ] Return authenticated user

**Expected:** ✅ Success with anonymous user data

#### Test 3: Token Refresh on Expiration
- [ ] Extract expired token
- [ ] Detect token expiration
- [ ] Extract refresh token from `stack-refresh` cookie
- [ ] Call Stack Auth refresh endpoint
- [ ] Receive new access token
- [ ] Set new token in Set-Cookie header
- [ ] Retry verification with new token
- [ ] Return authenticated user

**Expected:** ✅ Success with refreshed token

#### Test 4: Authorization Header Token
- [ ] Send token in `Authorization: Bearer <token>` header
- [ ] Extract token from header
- [ ] Verify and validate token
- [ ] Return authenticated user

**Expected:** ✅ Success with user data

#### Test 5: Custom Header Token
- [ ] Send token in `x-stack-access-token` header
- [ ] Extract token from custom header
- [ ] Verify and validate token
- [ ] Return authenticated user

**Expected:** ✅ Success with user data

#### Test 6: Invalid Signature Error
- [ ] Send token with tampered signature
- [ ] Detect invalid signature
- [ ] Return error code: `ERR_JWT_INVALID_SIGNATURE`
- [ ] Return 401 status

**Expected:** ✅ 401 with specific error code

#### Test 7: Invalid Audience Error
- [ ] Send token for different project
- [ ] Detect invalid audience
- [ ] Return error code: `ERR_JWT_INVALID_AUDIENCE`
- [ ] Return 401 status

**Expected:** ✅ 401 with specific error code

#### Test 8: Invalid Issuer Error
- [ ] Send token with wrong issuer
- [ ] Detect invalid issuer
- [ ] Return error code: `ERR_JWT_INVALID_ISSUER`
- [ ] Return 401 status

**Expected:** ✅ 401 with specific error code

#### Test 9: Malformed Token Error
- [ ] Send malformed token (not 3 parts)
- [ ] Detect malformed token
- [ ] Return error code: `ERR_JWT_MALFORMED`
- [ ] Return 401 status

**Expected:** ✅ 401 with specific error code

#### Test 10: No Token Error
- [ ] Send request without token
- [ ] Detect missing token
- [ ] Return 401 status
- [ ] Return error: "No authentication token provided"

**Expected:** ✅ 401 with appropriate message

### Integration Tests

#### Test 11: Token Caching
- [ ] First request: Verify token, cache payload
- [ ] Second request (same token): Use cached payload
- [ ] Verify cache duration (5 minutes)
- [ ] Cache expires after 5 minutes

**Expected:** ✅ Cached payload used, performance improved

#### Test 12: JWKS Caching
- [ ] First request: Fetch JWKS from Stack Auth
- [ ] Second request: Use cached JWKS
- [ ] Verify cache duration (1 hour)
- [ ] Cache invalidates on verification failure

**Expected:** ✅ JWKS cached, performance improved

#### Test 13: Optional Authentication
- [ ] Request without token
- [ ] Optional auth enabled
- [ ] Continue without user
- [ ] Handler receives request without user

**Expected:** ✅ Success without user

#### Test 14: Database User Sync
- [ ] New user from Stack Auth
- [ ] Create user in database
- [ ] Existing user from Stack Auth
- [ ] Update user in database
- [ ] Update last login timestamp

**Expected:** ✅ User synced correctly

### End-to-End Tests

#### Test 15: Complete Authentication Flow
1. User signs in via Stack Auth
2. Receive access and refresh tokens
3. Make authenticated request
4. Verify token and return user data
5. Token expires after 10 minutes
6. Make another request
7. Detect expiration and refresh token
8. Continue with new token

**Expected:** ✅ Complete flow works seamlessly

#### Test 16: Multiple Concurrent Requests
- [ ] Send 10 concurrent requests with same token
- [ ] All requests succeed
- [ ] No race conditions
- [ ] User created only once

**Expected:** ✅ All requests succeed, no duplicates

---

## Manual Testing Steps

### Setup
```bash
# 1. Deploy to staging environment
vercel deploy --prod

# 2. Get test tokens from Stack Auth
# - Regular user token
# - Anonymous user token
# - Expired token (if available)
```

### Test Regular User
```bash
curl -H "Authorization: Bearer <regular_token>" \
  https://staging.sselfie.ai/api/me
# Expected: 200 with user data
```

### Test Anonymous User
```bash
curl -H "Authorization: Bearer <anonymous_token>" \
  https://staging.sselfie.ai/api/me
# Expected: 200 with anonymous user data
```

### Test Token Refresh
```bash
# 1. Wait for token to expire (10 minutes)
# 2. Make request with expired token
# 3. Check response headers for Set-Cookie
# 4. Verify new token is set
# Expected: 200 with new token in Set-Cookie
```

### Test Error Scenarios
```bash
# Invalid signature
curl -H "Authorization: Bearer invalid.token.here" \
  https://staging.sselfie.ai/api/me
# Expected: 401 with ERR_JWT_INVALID_SIGNATURE

# No token
curl https://staging.sselfie.ai/api/me
# Expected: 401 with "No authentication token provided"
```

---

## Monitoring & Validation

### Logs to Check
- ✅ Token verification logs
- ✅ Token refresh logs
- ✅ Error logs with specific error codes
- ✅ Cache hit/miss logs
- ✅ Database user sync logs

### Metrics to Monitor
- ✅ Authentication success rate
- ✅ Token refresh rate
- ✅ Error rate by type
- ✅ Cache hit rate
- ✅ Average response time

### Production Checklist
- [ ] All tests pass
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Token refresh working
- [ ] Anonymous users working
- [ ] Error handling working
- [ ] Database sync working

---

## Rollback Plan

If issues occur:

1. **Revert commit:** `git revert <commit_hash>`
2. **Deploy previous version:** `vercel deploy --prod`
3. **Monitor logs:** Check for errors
4. **Notify team:** Alert about rollback

---

## Success Criteria

✅ All 16 tests pass
✅ No errors in production logs
✅ Token refresh working correctly
✅ Anonymous users authenticated
✅ Error codes specific and helpful
✅ Performance acceptable
✅ Database sync working

---

**Status:** Ready for Phase 3 Testing
**Next Steps:** Execute test plan and validate implementation

