# Maya Sub-Modules Analysis - Complete CRUD Systems

**Date:** October 12, 2025  
**Branch:** main  
**Current Migration Status:** 18/21 endpoints (86% complete)

---

## EXECUTIVE SUMMARY

All 5 Maya sub-modules are **already pure Vercel serverless** but have **critical authentication issues**:

- ✅ **Architecture:** Pure VercelRequest/VercelResponse (no Express types)
- ✅ **Database:** Direct Drizzle ORM queries (no abstraction issues)
- ✅ **Validation:** Zod schemas for request validation
- 🔴 **Authentication:** ALL use hardcoded `userId = 'demo-user'` placeholder
- 🔴 **Security:** Major vulnerability - no real user verification

**Immediate Action Required:** Replace placeholder auth with proper Stack Auth integration in all 5 modules.

---

## 1. CONCEPTS MODULE - `server/maya/concepts/index.ts`

### Overview
Complete CRUD system for Maya concept cards (brand strategy templates).

### Architecture ✅
- **Pure Serverless:** VercelRequest, VercelResponse
- **Database:** Direct Drizzle ORM with `mayaConcepts` table
- **Validation:** Zod schemas (`createConceptSchema`, `updateConceptSchema`, `conceptQuerySchema`)
- **Lines:** 239 lines

### Supported Operations
| Method | Endpoint Pattern | Function | Features |
|--------|-----------------|----------|----------|
| GET | `/maya/concepts` | List concepts | Filtering, pagination, sorting, search |
| POST | `/maya/concepts` | Create concept | Full validation |
| PUT | `/maya/concepts?conceptId=X` | Update concept | Partial updates |
| DELETE | `/maya/concepts?conceptId=X` | Delete concept | Soft/hard delete |

### Query Features
```typescript
// Query params supported:
- type: 'portrait' | 'flatlay' | 'lifestyle' | 'brand'
- status: 'active' | 'archived' | 'draft'
- isTemplate: boolean
- search: string (searches title)
- page: number (pagination)
- limit: number (default 20, max 50)
- sortBy: 'created' | 'usage' | 'rating'
- sortOrder: 'asc' | 'desc'
```

### 🔴 CRITICAL ISSUE
```typescript
// LINE 48 - HARDCODED USER ID
const userId = 'demo-user'; // ❌ SECURITY VULNERABILITY
```

**Impact:** All users would share the same concepts, complete data leak.

### ✅ Required Fix
```typescript
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendUnauthorized } from '../../_utils/response-helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);
    
    const userId = user.id; // ✅ Real Stack Auth user ID
    
    // ... rest of logic
```

### Migration Path
1. Import auth helpers
2. Replace placeholder auth at line 48
3. Add proper error handling
4. No other changes needed (already serverless-compatible)

---

## 2. IMAGES MODULE - `server/maya/images/index.ts`

### Overview
Complete CRUD system for Maya-generated images (separate from main gallery).

### Architecture ✅
- **Pure Serverless:** VercelRequest, VercelResponse
- **Database:** Direct Drizzle ORM with `mayaImages` table
- **Validation:** Zod schemas (`createImageSchema`, `updateImageSchema`, `imageQuerySchema`)
- **Lines:** 229 lines

### Supported Operations
| Method | Endpoint Pattern | Function | Features |
|--------|-----------------|----------|----------|
| GET | `/maya/images` | List images | Filtering, pagination, sorting |
| POST | `/maya/images` | Create image | Full validation |
| PUT | `/maya/images?imageId=X` | Update image | Auto view count increment |
| DELETE | `/maya/images?imageId=X` | Delete image | TODO: S3 cleanup |

### Query Features
```typescript
// Query params supported:
- category: string
- isFavorite: boolean
- isArchived: boolean
- page: number (pagination)
- limit: number (default 20, max 100)
- sortBy: 'created' | 'rating' | 'views'
- sortOrder: 'asc' | 'desc'
```

### Special Features
- **Auto View Count:** Increments on PUT if not explicitly set
- **S3 Cleanup TODO:** Line 221 - needs implementation

### 🔴 CRITICAL ISSUE
```typescript
// LINE 43 - HARDCODED USER ID
const userId = 'demo-user'; // ❌ SECURITY VULNERABILITY
```

### ✅ Required Fix
Same auth pattern as concepts module.

---

## 3. MODELS MODULE - `server/maya/models/index.ts`

### Overview
Read-only and update system for user LoRA models (wraps `userModels` table).

### Architecture ✅
- **Pure Serverless:** VercelRequest, VercelResponse
- **Database:** Direct Drizzle ORM with `mayaModels` (alias for `userModels`)
- **Validation:** Zod schema (`updateModelSchema`)
- **Lines:** 148 lines
- **Note:** Uses `(req as any).user?.claims?.sub` - partial Stack Auth integration

### Supported Operations
| Method | Endpoint Pattern | Function | Features |
|--------|-----------------|----------|----------|
| GET | `/maya/models` | List user models | Status filtering |
| PUT | `/maya/models?modelId=X` | Update model status | Training status updates |
| DELETE | `/maya/models?modelId=X` | Delete model | Permanent deletion |

### Query Features
```typescript
// Query params supported:
- status: 'pending' | 'training' | 'completed' | 'failed'
```

### Data Transformation
```typescript
// Transforms userModels to Maya-compatible format
const mayaCompatibleModels = models.map(model => ({
  id: model.id,
  userId: model.userId,
  modelType: 'lora', // All user models are LoRA
  trainingStatus: model.trainingStatus || 'unknown',
  replicateVersionId: model.replicateVersionId,
  metadata: {
    replicateModelId: model.replicateModelId,
    generationCount: 0 // Could be calculated
  }
}));
```

### ⚠️ PARTIAL ISSUE
```typescript
// LINE 20 - Attempts Stack Auth but falls back to no auth
const userId = (req as any).user?.claims?.sub;
if (!userId) {
  return res.status(401).json({ error: 'Authentication required' }); // ✅ Good
}
```

**Status:** Better than other modules but should use proper helper:

### ✅ Required Fix
```typescript
import { getUserFromRequest } from '../../_utils/auth-helpers.js';

const user = await getUserFromRequest(req);
if (!user) return sendUnauthorized(res);
const userId = user.id; // ✅ Consistent with other endpoints
```

---

## 4. PROFILE MODULE - `server/maya/profile/index.ts`

### Overview
Maya user profile management (onboarding, preferences, generation tracking).

### Architecture ✅
- **Pure Serverless:** VercelRequest, VercelResponse
- **Database:** Direct Drizzle ORM with `mayaProfile` table
- **Validation:** Zod schemas (`insertMayaProfileSchema`, `updateProfileSchema`)
- **Lines:** 181 lines

### Supported Operations
| Method | Endpoint Pattern | Function | Features |
|--------|-----------------|----------|----------|
| GET | `/maya/profile` | Get profile | Auto-create if missing |
| POST | `/maya/profile` | Create profile | Conflict detection |
| PUT | `/maya/profile` | Update profile | Generation tracking, monthly reset |

### Special Features
- **Auto-Creation:** Creates default profile if none exists on GET
- **Monthly Reset Logic:** Automatically resets `monthlyGenerations` counter
- **Onboarding Tracking:** Steps 1-6, completion status

### Profile Schema
```typescript
{
  onboardingStatus: 'pending' | 'in_progress' | 'completed',
  onboardingStep: 1-6,
  completedSteps: number[],
  preferences: {
    communicationStyle, generationSettings, 
    privacySettings, notificationSettings
  },
  billingInfo: { company, vatNumber, billingAddress },
  featureAccess: {
    advancedPrompts, priorityGeneration, 
    customModels, apiAccess, whiteLabel
  },
  monthlyGenerations: number,
  lastResetDate: Date
}
```

### 🔴 CRITICAL ISSUE
```typescript
// LINE 51 - HARDCODED USER ID
const userId = 'demo-user'; // ❌ SECURITY VULNERABILITY
```

### ✅ Required Fix
Same auth pattern as concepts module.

---

## 5. PAYMENTS MODULE - `server/maya/payments/index.ts`

### Overview
Stripe integration for Maya subscriptions (separate from main SSELFIE billing).

### Architecture ✅
- **Pure Serverless:** VercelRequest, VercelResponse
- **Database:** Direct Drizzle ORM with `mayaPayments` table
- **Validation:** Zod schemas (`createPaymentSessionSchema`, `updatePaymentSchema`)
- **External:** Stripe SDK integration
- **Lines:** 270 lines

### Supported Operations
| Method | Endpoint Pattern | Function | Features |
|--------|-----------------|----------|----------|
| GET | `/maya/payments` | List payments | Active subscription detection |
| POST | `/maya/payments` | Create checkout | Stripe session creation |
| PUT | `/maya/payments?paymentId=X` | Update payment | Subscription status changes |
| DELETE | `/maya/payments` | Cancel subscription | Stripe cancellation |

### Plan Configuration
```typescript
const PLAN_PRICES = {
  basic: { monthly: 2900, yearly: 31900 },      // $29/mo, $319/yr
  pro: { monthly: 4900, yearly: 53900 },        // $49/mo, $539/yr
  enterprise: { monthly: 9900, yearly: 108900 } // $99/mo, $1089/yr
};
```

### Stripe Integration
- **Checkout Sessions:** Creates hosted checkout pages
- **Customer Management:** Creates/reuses Stripe customers
- **Subscription Tracking:** Stores subscription status in DB
- **Cancellation:** Handles immediate cancellation

### 🔴 CRITICAL ISSUE
```typescript
// LINE 45 - HARDCODED USER ID
const userId = 'demo-user'; // ❌ SECURITY VULNERABILITY
```

**Impact:** All users would share the same payment records and subscriptions - **catastrophic security issue**.

### ✅ Required Fix
Same auth pattern as concepts module.

---

## MIGRATION PRIORITY MATRIX

### Priority 1: Security Fixes (CRITICAL - 2 hours)
All 5 modules need authentication replacement:

1. **concepts/index.ts** - Line 48
2. **images/index.ts** - Line 43
3. **models/index.ts** - Line 20 (partial fix)
4. **profile/index.ts** - Line 51
5. **payments/index.ts** - Line 45

**Action:** Replace placeholder auth with `getUserFromRequest()` helper.

### Priority 2: Route Registration (30 minutes)
Add to `vercel.json`:

```json
{
  "src": "server/maya/concepts/index.ts",
  "use": "@vercel/node",
  "config": { "maxDuration": 30, "memory": 512 }
}
// + 4 more for images, models, profile, payments
```

### Priority 3: Testing (1 hour)
- Verify Stack Auth JWT validation
- Test CRUD operations for each module
- Verify user data isolation
- Test Stripe integration (payments module)

### Priority 4: S3 Cleanup Implementation (optional)
`images/index.ts` line 221 - implement S3 file deletion on image delete.

---

## ENDPOINT INVENTORY

### New Endpoints to Register
```
GET    /maya/concepts              - List concept cards
POST   /maya/concepts              - Create concept
PUT    /maya/concepts?conceptId=X  - Update concept
DELETE /maya/concepts?conceptId=X  - Delete concept

GET    /maya/images                - List Maya images
POST   /maya/images                - Create image record
PUT    /maya/images?imageId=X      - Update image (view count)
DELETE /maya/images?imageId=X      - Delete image

GET    /maya/models                - List user models
PUT    /maya/models?modelId=X      - Update model status
DELETE /maya/models?modelId=X      - Delete model

GET    /maya/profile               - Get/create profile
POST   /maya/profile               - Create profile
PUT    /maya/profile               - Update profile

GET    /maya/payments              - List payments
POST   /maya/payments              - Create checkout session
PUT    /maya/payments?paymentId=X  - Update payment
DELETE /maya/payments              - Cancel subscription
```

**Total:** 20 new endpoints (all already serverless-compatible)

---

## CODE QUALITY ASSESSMENT

### ✅ Strengths
1. **Pure Serverless:** No Express dependencies
2. **Type Safety:** Zod validation throughout
3. **Direct Database:** No abstraction overhead
4. **Pagination:** Built-in for all list operations
5. **Error Handling:** Proper try/catch and status codes
6. **Drizzle ORM:** Type-safe database queries

### 🔴 Critical Issues
1. **Authentication:** Hardcoded user IDs in 4/5 modules
2. **Security:** Major data leak vulnerability
3. **Consistency:** Mixed auth approaches

### ⚠️ Minor Issues
1. **S3 Cleanup:** TODO comment in images module
2. **Models Module:** Transforms userModels data (unnecessary complexity)
3. **Error Messages:** Could be more specific

---

## RECOMMENDED MIGRATION APPROACH

### Step 1: Create Fixed Versions (1 hour)
Create new files with proper auth:
```
server/api/maya/concepts.ts      - Fixed concepts module
server/api/maya/images.ts        - Fixed images module  
server/api/maya/models.ts        - Fixed models module (not /maya/models.ts utility)
server/api/maya/profile.ts       - Fixed profile module
server/api/maya/payments.ts      - Fixed payments module
```

### Step 2: Add to vercel.json (30 minutes)
Register all 20 endpoints with proper routing.

### Step 3: Test (1 hour)
- Unit test each CRUD operation
- Verify user data isolation
- Test Stripe webhooks

### Step 4: Deprecate Old Files (15 minutes)
Rename originals to `.backup` after testing.

---

## ALTERNATIVE: IN-PLACE FIX

Instead of creating new files, fix existing ones:

```typescript
// Pattern for all 5 modules:
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendUnauthorized } from '../../_utils/response-helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);
    const userId = user.id;
    
    // ... existing logic unchanged
```

**Pros:** Minimal changes, preserve existing structure  
**Cons:** May need to adjust imports in other files

---

## INTEGRATION WITH EXISTING SYSTEM

### Database Schema Compatibility
All modules use existing tables:
- ✅ `mayaConcepts` - Already in schema
- ✅ `mayaImages` - Already in schema
- ✅ `mayaModels` - Alias for `userModels`
- ✅ `mayaProfile` - Already in schema
- ✅ `mayaPayments` - Already in schema

### Service Layer Integration
These modules work independently of `MayaService` class:
- Concepts: Used by chat for brand strategy
- Images: Separate from main gallery
- Models: Read-only view of training status
- Profile: Onboarding and preferences
- Payments: Subscription management

### Client Integration
Frontend likely expects these endpoints:
```typescript
// Likely API calls from client:
fetch('/api/maya/concepts?type=portrait&page=1')
fetch('/api/maya/images?isFavorite=true')
fetch('/api/maya/profile')
fetch('/api/maya/payments')
```

---

## TESTING CHECKLIST

### Authentication Tests
- [ ] Verify JWT validation works for all 5 modules
- [ ] Test with expired tokens
- [ ] Test with missing auth headers
- [ ] Verify user data isolation (User A can't see User B's data)

### CRUD Operation Tests (per module)
- [ ] GET: List with filters and pagination
- [ ] POST: Create with validation
- [ ] PUT: Update with partial data
- [ ] DELETE: Permanent deletion

### Integration Tests
- [ ] Concepts → Used in Maya chat generation
- [ ] Images → Separate from main gallery
- [ ] Models → Syncs with userModels table
- [ ] Profile → Tracks onboarding progress
- [ ] Payments → Stripe webhook integration

### Edge Cases
- [ ] Profile auto-creation on first GET
- [ ] Monthly generation reset logic
- [ ] Image view count auto-increment
- [ ] Payment subscription cancellation
- [ ] Duplicate profile creation prevention

---

## ESTIMATED TIMELINE

### Immediate (Today - 2 hours)
1. ✅ Fix authentication in all 5 modules (1 hour)
2. ✅ Add routes to vercel.json (30 minutes)
3. ✅ Test TypeScript compilation (15 minutes)
4. ✅ Basic smoke tests (15 minutes)

### Short-term (Tomorrow - 2 hours)
1. Comprehensive testing of all CRUD operations
2. Verify Stripe integration
3. Test user data isolation
4. Update documentation

### Optional (Next Week - 2 hours)
1. Implement S3 cleanup in images module
2. Simplify models module (remove transformation)
3. Add rate limiting
4. Add audit logging

---

## SECURITY CONSIDERATIONS

### Current Vulnerabilities
1. **Data Leakage:** All users share 'demo-user' data
2. **Payment Fraud:** Anyone could access anyone's payment info
3. **No Audit Trail:** No logging of who accessed what

### Required Fixes
1. ✅ Replace all placeholder auth
2. ✅ Verify JWT on every request
3. ⚠️ Add rate limiting (future)
4. ⚠️ Add audit logging (future)

### Post-Migration Validation
```typescript
// Test script to verify user isolation:
const userA = await fetch('/api/maya/concepts', { 
  headers: { Authorization: `Bearer ${userA_token}` } 
});
const userB = await fetch('/api/maya/concepts', { 
  headers: { Authorization: `Bearer ${userB_token}` } 
});
// Verify userA.data !== userB.data
```

---

## CONCLUSION

**All 5 Maya sub-modules are architecturally ready for production** but require immediate authentication fixes.

**Effort Required:**
- Auth fixes: 2 hours
- Testing: 2 hours
- Documentation: 1 hour
- **Total: 5 hours**

**Risk Level:** LOW (purely auth replacement, no architectural changes)

**Recommended Approach:** In-place fixes to preserve existing structure and minimize refactoring.

**Next Step:** Proceed with authentication replacement in all 5 modules.
