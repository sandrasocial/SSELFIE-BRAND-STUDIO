# Gallery System - Complete Migration Analysis

**Date:** October 12, 2025  
**Status:** Analysis Phase - Migration Planning  
**Purpose:** Map Gallery endpoints, identify migration priorities, create execution plan

---

## EXECUTIVE SUMMARY

### Current Architecture

**Gallery System Overview:**
- **17 total endpoints** in `server/routes/modules/gallery.ts` (596 lines)
- **All Express Router** - No pure serverless versions yet
- **2 production-critical endpoints** with circuit breaker pattern
- **11 mock/stub endpoints** requiring actual implementation
- **4 endpoints** fully functional (favorites + main gallery)

**Key Findings:**
1. ✅ **2 core gallery endpoints are production-ready** (circuit breaker, parallel fetching, error recovery)
2. ⚠️ **Most endpoints are stubs** - Quick implementations but need full service layer
3. 🔄 **All routed through Express Router adapter** via `server/[...route].ts`
4. 📊 **High usage endpoints** - Gallery is core to user experience

---

## 1. COMPLETE ENDPOINT INVENTORY

### A. Production-Critical Endpoints (2) - ✅ Fully Functional

#### 1. GET `/api/gallery` - Main Gallery View
```typescript
// server/routes/modules/gallery.ts:165
router.get('/api/gallery', requireStackAuth, asyncHandler(...))
```

**Purpose:** Fetch all user gallery images (combined AI + Generated)  
**Features:**
- ✅ Circuit breaker pattern (503 when open)
- ✅ Parallel fetching with Promise.all
- ✅ 2.5s timeout per data source
- ✅ Error recovery (continues on partial failure)
- ✅ Combined AI images + Generated images
- ✅ Sorted by creation date (newest first)
- ✅ Formatted for frontend consumption

**Business Logic:**
```typescript
const [aiImages, generatedImages] = await Promise.all([
  withTimeout(storage.getAIImages(userId), 2500, 'getAIImages'),
  withTimeout(storage.getGeneratedImages(userId), 2500, 'getGeneratedImages')
]);

// Format and combine
const galleryImages = [
  ...aiImages.map(img => ({ ...format, type: 'ai_generated' })),
  ...generatedImages.map(img => ({ ...format, type: 'generated' }))
];
```

**Usage:** Primary gallery display in UI  
**Priority:** 🔴 **CRITICAL** - Core user experience

---

#### 2. GET `/api/gallery-images` - Gallery Images (Duplicate)
```typescript
// server/routes/modules/gallery.ts:235
router.get('/api/gallery-images', requireStackAuth, asyncHandler(...))
```

**Purpose:** Same as `/api/gallery` (duplicate endpoint)  
**Features:** Identical implementation to `/api/gallery`  
**Note:** ⚠️ This is a **duplicate** of `/api/gallery` - same code, different route

**Business Logic:** Identical to `/api/gallery`

**Usage:** Frontend calls this endpoint  
**Priority:** 🔴 **CRITICAL** - Core user experience  
**Action:** ✅ Consolidate with `/api/gallery` during migration

---

### B. Favorites Management (2) - ✅ Fully Functional

#### 3. GET `/api/images/favorites` - Get Favorite Images
```typescript
// server/routes/modules/gallery.ts:122
router.get('/api/images/favorites', requireStackAuth, asyncHandler(...))
```

**Purpose:** Get list of user's favorite image IDs  
**Features:**
- ✅ Filters by `isFavorite` OR `isSelected` flags
- ✅ 5s timeout with fallback
- ✅ Returns array of image IDs
- ✅ Graceful error handling (returns empty array on failure)

**Business Logic:**
```typescript
const ai = await withTimeout(storage.getAIImages(userId), 5000, 'getAIImages');
const favIds = ai
  .filter(img => Boolean(img.isFavorite || img.isSelected))
  .map(img => img.id);
```

**Usage:** Favorite images feature  
**Priority:** 🟡 **HIGH** - User engagement feature

---

#### 4. POST `/api/images/:id/favorite` - Toggle Favorite Status
```typescript
// server/routes/modules/gallery.ts:137
router.post('/api/images/:id/favorite', requireStackAuth, asyncHandler(...))
```

**Purpose:** Toggle favorite status for specific image  
**Features:**
- ✅ Fetches current image state
- ✅ Toggles `isFavorite` flag
- ✅ 4s timeout per operation
- ✅ Returns new status

**Business Logic:**
```typescript
const img = await withTimeout(storage.getAIImage(userId, imageId), 4000, 'getAIImage');
const next = !(img?.isFavorite ?? false);
await withTimeout(storage.updateAIImage(imageId, { isFavorite: next }), 4000, 'updateAIImage');
```

**Usage:** Heart/unheart images in gallery  
**Priority:** 🟡 **HIGH** - User engagement feature

---

### C. Image Management (2) - ✅ Functional

#### 5. DELETE `/api/ai-images/:id` - Delete Image
```typescript
// server/routes/modules/gallery.ts:309
router.delete('/api/ai-images/:id', requireStackAuth, asyncHandler(...))
```

**Purpose:** Delete specific AI image from gallery  
**Features:**
- ✅ ID validation (parseInt with NaN check)
- ✅ Direct storage deletion
- ✅ Returns success status

**Business Logic:**
```typescript
const imageId = parseInt(req.params.id, 10);
const ok = await storage.deleteAIImage(userId, imageId);
```

**Usage:** Delete unwanted images  
**Priority:** 🟡 **HIGH** - User management

---

#### 6. GET `/api/debug/gallery-inspect` - Debug Gallery State
```typescript
// server/routes/modules/gallery.ts:572
router.get('/api/debug/gallery-inspect', requireStackAuth, asyncHandler(...))
```

**Purpose:** Debug tool to inspect gallery linkage (Stack Auth + Legacy)  
**Features:**
- ✅ Shows Stack Auth user ID
- ✅ Shows linked legacy user ID (if any)
- ✅ Image counts for both IDs
- ✅ Sample images from both sources

**Business Logic:**
```typescript
const stackUserId = req.user.id;
const linkedUser = await storage.getUserByStackAuthId(stackUserId);
const legacyUserId = linkedUser?.id;

// Fetch for both IDs
const aiStack = await storage.getAIImages(stackUserId);
const aiLegacy = await storage.getAIImages(String(legacyUserId));
```

**Usage:** Internal debugging tool  
**Priority:** 🟢 **LOW** - Developer tooling

---

### D. Mock/Stub Endpoints (11) - ⚠️ Need Implementation

#### 7. POST `/api/gallery/upload` - Upload Image
```typescript
// server/routes/modules/gallery.ts:328
router.post('/api/gallery/upload', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns fake `imageId`  
**Purpose:** Upload new image to gallery  
**Required Implementation:**
- S3 upload integration
- Image validation (size, format, dimensions)
- Metadata extraction
- Thumbnail generation
- Database insertion

**Priority:** 🟡 **MEDIUM** - User-generated content feature

---

#### 8. POST `/api/gallery/save` - Save Image to Gallery
```typescript
// server/routes/modules/gallery.ts:341
router.post('/api/gallery/save', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns fake `imageId`  
**Purpose:** Save external image URL to gallery  
**Required Implementation:**
- URL validation
- Image download/migration to S3
- Metadata extraction
- Database insertion

**Priority:** 🟡 **MEDIUM** - Image collection feature

---

#### 9. POST `/api/gallery/generate` - Generate Gallery Image
```typescript
// server/routes/modules/gallery.ts:354
router.post('/api/gallery/generate', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns fake `jobId`  
**Purpose:** Trigger image generation from gallery  
**Note:** ⚠️ **This duplicates Maya generation** - Consider consolidation

**Required Implementation:**
- Integration with unified-generation-service.ts
- Job queue management
- Progress tracking
- Result notification

**Priority:** 🟢 **LOW** - Maya already handles this

---

#### 10. GET `/api/gallery/category/:category` - Get Images by Category
```typescript
// server/routes/modules/gallery.ts:368
router.get('/api/gallery/category/:category', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns empty array  
**Purpose:** Filter gallery by category  
**Required Implementation:**
- Category filtering in storage layer
- Support for categories: 'Maya AI', 'Professional', 'Casual', etc.

**Priority:** 🟡 **MEDIUM** - Gallery organization

---

#### 11. GET `/api/gallery/image/:imageId` - Get Specific Image
```typescript
// server/routes/modules/gallery.ts:386
router.get('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns fake image  
**Purpose:** Get single image details  
**Required Implementation:**
- Fetch from storage by ID
- Include metadata, tags, favorites status
- Potentially include related images

**Priority:** 🟡 **MEDIUM** - Image detail view

---

#### 12. POST `/api/gallery/image/:imageId` - Update Image Metadata
```typescript
// server/routes/modules/gallery.ts:410
router.post('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns success without action  
**Purpose:** Update image metadata (tags, description, etc.)  
**Required Implementation:**
- Metadata validation
- Storage update
- Cache invalidation

**Priority:** 🟢 **LOW** - Nice-to-have feature

---

#### 13. DELETE `/api/gallery/image/:imageId` - Delete Image (Duplicate)
```typescript
// server/routes/modules/gallery.ts:424
router.delete('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Doesn't actually delete  
**Note:** ⚠️ **Duplicate of `/api/ai-images/:id`** (endpoint #5)

**Priority:** 🔴 **CONSOLIDATE** - Use existing delete endpoint

---

#### 14. GET `/api/gallery/tracker/:trackerId` - Get Generation Tracker
```typescript
// server/routes/modules/gallery.ts:449
router.get('/api/gallery/tracker/:trackerId', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Always returns 'completed'  
**Purpose:** Check generation job status  
**Required Implementation:**
- Integration with generation-completion-monitor.ts
- Real-time status tracking
- Progress percentage

**Priority:** 🟡 **MEDIUM** - User feedback for async operations

---

#### 15. GET `/api/gallery/prediction/:predictionId` - Get Prediction Status
```typescript
// server/routes/modules/gallery.ts:469
router.get('/api/gallery/prediction/:predictionId', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Always returns 'completed'  
**Purpose:** Check Replicate prediction status  
**Note:** ⚠️ **Overlaps with generation tracker** - Consider consolidation

**Priority:** 🟢 **LOW** - Generation tracker covers this

---

#### 16. POST `/api/gallery/concept` - Generate Concept Images
```typescript
// server/routes/modules/gallery.ts:489
router.post('/api/gallery/concept', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns fake jobId  
**Purpose:** Generate images from concept  
**Note:** ⚠️ **Maya handles this via concept cards** - Likely duplicate

**Priority:** 🟢 **LOW** - Maya concept system is primary

---

#### 17. POST `/api/gallery/style` - Generate Style Images
```typescript
// server/routes/modules/gallery.ts:505
router.post('/api/gallery/style', requireStackAuth, asyncHandler(...))
```

**Status:** ⚠️ **MOCK** - Returns fake jobId  
**Purpose:** Generate images in specific style  
**Note:** ⚠️ **Maya handles this via recipes** - Likely duplicate

**Priority:** 🟢 **LOW** - Maya style recipes are primary

---

## 2. ARCHITECTURE ANALYSIS

### Current Routing (vercel.json)

```json
{
  "source": "/api/gallery-images",
  "destination": "/server/[...route].ts"
},
{
  "source": "/api/gallery",
  "destination": "/server/[...route].ts"
},
{
  "source": "/api/images/(.*)",
  "destination": "/server/[...route].ts"
}
```

**Flow:**
```
Request → vercel.json → server/[...route].ts → adaptExpressRouter(galleryRouter) → gallery.ts
```

### Dependencies

**server/[...route].ts** (Lines 29-32, 355-361):
```typescript
// Gallery routes handled by gallery.ts module
const GALLERY_ROUTES = [
  '/api/gallery',
  '/api/gallery-images',
];

// Router delegation
const isGalleryRoute = req.url && GALLERY_ROUTES.some(route => 
  req.url === route || req.url?.startsWith(route)
);
if (isGalleryRoute) {
  const galleryHandler = adaptExpressRouter(galleryRouter);
  return galleryHandler(req, res);
}
```

**Special Case: `/api/gallery-images` Duplication**

`server/gallery-images.ts` (11 lines):
```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return main(req, res); // Delegates to server/index.ts → [... route].ts → gallery.ts
}
```

**Analysis:** This is a **triple indirection** (gallery-images.ts → index.ts → [...route].ts → gallery.ts)

---

## 3. CIRCUIT BREAKER PATTERN (Production-Ready)

### Implementation in Gallery.ts

```typescript
interface CircuitBreakerState {
  failures: number;
  isOpen: boolean;
  lastFailure: number;
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  isOpen: false,
  lastFailure: 0
};

const CIRCUIT_BREAKER_THRESHOLD = 5;      // Open after 5 failures
const CIRCUIT_BREAKER_RESET_TIME = 60000; // Reset after 60 seconds
```

**Used By:**
- `/api/gallery` (main gallery view)
- `/api/gallery-images` (duplicate endpoint)

**Behavior:**
1. **Normal operation:** Requests proceed normally
2. **Failures accumulate:** Each failure increments counter
3. **Threshold reached (5 failures):** Circuit opens → returns 503 immediately
4. **Reset after 60s:** Circuit closes → normal operation resumes

**Benefits:**
- Protects database from cascading failures
- Fast-fail prevents long timeouts
- Automatic recovery

---

## 4. ENDPOINT PRIORITY MATRIX

| Priority | Endpoint | Type | Status | Lines of Code | Complexity |
|----------|----------|------|--------|---------------|------------|
| 🔴 **P0** | GET `/api/gallery` | View | ✅ Functional | ~70 | High (circuit breaker) |
| 🔴 **P0** | GET `/api/gallery-images` | View | ✅ Duplicate | ~70 | High (duplicate) |
| 🟡 **P1** | GET `/api/images/favorites` | Filter | ✅ Functional | ~15 | Low |
| 🟡 **P1** | POST `/api/images/:id/favorite` | Update | ✅ Functional | ~20 | Low |
| 🟡 **P1** | DELETE `/api/ai-images/:id` | Delete | ✅ Functional | ~15 | Low |
| 🟡 **P2** | POST `/api/gallery/upload` | Create | ⚠️ Mock | ~10 | **High** (S3) |
| 🟡 **P2** | POST `/api/gallery/save` | Create | ⚠️ Mock | ~10 | Medium |
| 🟡 **P2** | GET `/api/gallery/category/:category` | Filter | ⚠️ Mock | ~10 | Low |
| 🟡 **P2** | GET `/api/gallery/image/:imageId` | View | ⚠️ Mock | ~15 | Low |
| 🟡 **P2** | GET `/api/gallery/tracker/:trackerId` | Status | ⚠️ Mock | ~10 | Medium |
| 🟢 **P3** | POST `/api/gallery/image/:imageId` | Update | ⚠️ Mock | ~10 | Low |
| 🟢 **P3** | DELETE `/api/gallery/image/:imageId` | Delete | ⚠️ Duplicate | ~10 | N/A |
| 🟢 **P3** | POST `/api/gallery/generate` | Generate | ⚠️ Mock | ~10 | **Duplicate** |
| 🟢 **P3** | GET `/api/gallery/prediction/:predictionId` | Status | ⚠️ Mock | ~10 | **Duplicate** |
| 🟢 **P3** | POST `/api/gallery/concept` | Generate | ⚠️ Mock | ~10 | **Duplicate** |
| 🟢 **P3** | POST `/api/gallery/style` | Generate | ⚠️ Mock | ~10 | **Duplicate** |
| 🟢 **P3** | GET `/api/debug/gallery-inspect` | Debug | ✅ Functional | ~30 | Low |

**Summary:**
- **P0 (Critical):** 2 endpoints - Core gallery view (1 duplicate)
- **P1 (High):** 3 endpoints - Favorites + Delete
- **P2 (Medium):** 5 endpoints - User actions (mostly mocks)
- **P3 (Low):** 7 endpoints - Nice-to-have / duplicates

---

## 5. MIGRATION STRATEGY

### Option A: Phased Migration (Recommended)

**Phase 1: Core Gallery (2 endpoints) - Week 1**
- Migrate `/api/gallery` and `/api/gallery-images` to pure serverless
- Consolidate into single endpoint (eliminate duplication)
- Preserve circuit breaker pattern
- Estimated: 4-6 hours

**Phase 2: Favorites System (2 endpoints) - Week 1**
- Migrate `/api/images/favorites` (GET)
- Migrate `/api/images/:id/favorite` (POST)
- Estimated: 2-3 hours

**Phase 3: Image Management (1 endpoint) - Week 2**
- Migrate `/api/ai-images/:id` (DELETE)
- Estimated: 1-2 hours

**Phase 4: Mock Implementations (5 endpoints) - Week 2-3**
- Implement `/api/gallery/upload` (with S3 integration)
- Implement `/api/gallery/save`
- Implement `/api/gallery/category/:category`
- Implement `/api/gallery/image/:imageId`
- Implement `/api/gallery/tracker/:trackerId`
- Estimated: 8-12 hours

**Phase 5: Cleanup (Optional)**
- Remove duplicate/deprecated endpoints
- Remove `server/gallery-images.ts` delegation
- Remove Express Router from [...route].ts
- Estimated: 2-3 hours

**Total Estimated Time:** 17-26 hours over 2-3 weeks

---

### Option B: Big Bang Migration

**Approach:** Migrate all functional endpoints in one go, skip mocks

**Pros:**
- Complete migration faster
- Single testing cycle
- Clean architecture immediately

**Cons:**
- Higher risk (multiple endpoints change)
- Longer initial development
- Mock endpoints remain in Express Router

**Not Recommended:** Gallery is high-usage, phased approach is safer

---

## 6. TECHNICAL DECISIONS NEEDED

### Decision 1: Endpoint Consolidation

**Question:** Should we consolidate `/api/gallery` and `/api/gallery-images`?

**Current State:** Both endpoints have identical implementation  
**Recommendation:** ✅ **YES** - Keep `/api/gallery-images` (client uses this), deprecate `/api/gallery`

**Rationale:**
- Client already calls `/api/gallery-images`
- Better semantic naming (plural for collection)
- Reduces maintenance burden

---

### Decision 2: Mock Endpoint Handling

**Question:** How to handle 11 mock endpoints during migration?

**Options:**

**A. Migrate + Implement (Recommended)**
- Migrate endpoint structure to pure serverless
- Implement actual functionality as needed
- Prioritize based on user demand

**B. Leave in Express Router**
- Don't migrate mock endpoints
- Implement later when needed
- Keeps migration scope small

**C. Remove Entirely**
- Delete unused mock endpoints
- Add when actually needed
- Cleanest approach

**Recommendation:** ✅ **Option B** - Leave mocks in Express Router for now

**Rationale:**
- Focus migration on functional endpoints
- Mock endpoints have no users yet
- Can migrate when implementing actual functionality

---

### Decision 3: Circuit Breaker Preservation

**Question:** How to preserve circuit breaker pattern in pure serverless?

**Challenge:** Express Router maintains state in module scope  
**Pure serverless:** Each invocation is stateless

**Solution Options:**

**A. External State Store (Redis/Upstash)**
```typescript
import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_URL });

async function checkCircuitBreaker(key: string): Promise<boolean> {
  const state = await redis.get(`circuit:${key}`);
  // Check and update state
}
```

**B. Remove Circuit Breaker**
- Rely on Vercel's built-in rate limiting
- Database has its own connection pooling
- Simpler implementation

**C. Client-Side Retry Logic**
- Move responsibility to client
- Exponential backoff in frontend
- Serverless stays simple

**Recommendation:** ✅ **Option B** - Remove for now, add if needed

**Rationale:**
- Circuit breaker is premature optimization
- Database (NeonDB) has built-in protections
- Vercel handles rate limiting
- Can add later if issues arise

---

### Decision 4: File Organization

**Question:** Where to place pure serverless Gallery endpoints?

**Options:**

**A. `server/api/gallery/*.ts`** (Recommended)
```
server/api/gallery/
  ├── images.ts         (GET /api/gallery-images)
  ├── favorites.ts      (GET /api/images/favorites)
  ├── favorite.ts       (POST /api/images/:id/favorite)
  ├── delete.ts         (DELETE /api/ai-images/:id)
  └── ... (future endpoints)
```

**B. `server/api/gallery-*.ts`** (Flat structure)
```
server/api/
  ├── gallery-images.ts
  ├── gallery-favorites.ts
  ├── gallery-favorite-toggle.ts
  └── ... (clutters root)
```

**Recommendation:** ✅ **Option A** - Modular directory structure

---

## 7. SERVICE LAYER REQUIREMENTS

### Current Storage Interface Usage

**Gallery endpoints rely on these storage methods:**

```typescript
// AI Images
storage.getAIImages(userId: string): Promise<AiImage[]>
storage.getAIImage(userId: string, imageId: number): Promise<AiImage | undefined>
storage.updateAIImage(imageId: number, updates: Partial<AiImage>): Promise<void>
storage.deleteAIImage(userId: string, imageId: number): Promise<boolean>
storage.saveAIImage(data: GalleryImageInput): Promise<GalleryImage>

// Generated Images
storage.getGeneratedImages(userId: string): Promise<GeneratedImage[]>

// User Lookup
storage.getUserByStackAuthId(stackAuthId: string): Promise<User | undefined>
```

**All methods already exist in `server/storage.ts` - ✅ No new service layer needed**

---

## 8. TESTING STRATEGY

### Unit Tests (Per Endpoint)

```typescript
// Example: gallery-images.test.ts
describe('GET /api/gallery-images', () => {
  it('should return user gallery images', async () => {
    const res = await request(handler)
      .get('/api/gallery-images')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should return 401 without auth', async () => {
    const res = await request(handler).get('/api/gallery-images');
    expect(res.status).toBe(401);
  });

  it('should handle empty gallery', async () => {
    // Mock storage.getAIImages to return []
    const res = await request(handler)
      .get('/api/gallery-images')
      .set('Authorization', `Bearer ${newUserToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
```

### Integration Tests

```typescript
// Test full flow: Generate → Gallery → Favorite → Delete
describe('Gallery Integration', () => {
  it('should complete full gallery workflow', async () => {
    // 1. Generate image via Maya
    const genRes = await post('/api/maya/generate', { prompt: 'test' });
    const imageId = genRes.body.data.imageId;

    // 2. Image appears in gallery
    const galleryRes = await get('/api/gallery-images');
    expect(galleryRes.body.find(img => img.id === imageId)).toBeDefined();

    // 3. Mark as favorite
    await post(`/api/images/${imageId}/favorite`);
    const favRes = await get('/api/images/favorites');
    expect(favRes.body.favorites).toContain(imageId);

    // 4. Delete image
    await delete(`/api/ai-images/${imageId}`);
    const finalGallery = await get('/api/gallery-images');
    expect(finalGallery.body.find(img => img.id === imageId)).toBeUndefined();
  });
});
```

---

## 9. ROLLBACK PLAN

### Gradual Migration Safety

**Each phase can be rolled back independently:**

```typescript
// vercel.json - Progressive routing
{
  // New pure serverless (takes priority)
  "source": "/api/gallery-images",
  "destination": "/server/api/gallery/images.ts"
},
{
  // Fallback to Express Router (if serverless fails)
  "source": "/api/gallery/(.*)",
  "destination": "/server/[...route].ts"
}
```

**Rollback Procedure:**
1. Comment out new pure serverless route in vercel.json
2. Deploy with `vercel --prod`
3. Traffic automatically routes to Express Router
4. Fix issue in pure serverless version
5. Uncomment route and redeploy

**No data loss risk** - Database operations are identical

---

## 10. MIGRATION EXECUTION CHECKLIST

### Pre-Migration
- [ ] Backup current gallery.ts router
- [ ] Document current API contracts (request/response schemas)
- [ ] Identify all client-side callsites
- [ ] Set up monitoring/alerting for gallery endpoints
- [ ] Create feature flag for gradual rollout

### Phase 1: Core Gallery
- [ ] Create `server/api/gallery/images.ts`
- [ ] Implement Stack Auth JWT verification
- [ ] Migrate parallel fetching logic
- [ ] Add error handling (no circuit breaker initially)
- [ ] Add route to vercel.json
- [ ] Unit tests (3+ test cases)
- [ ] Integration test (full flow)
- [ ] Deploy to staging
- [ ] Load test (simulate production traffic)
- [ ] Deploy to production
- [ ] Monitor for 48 hours

### Phase 2: Favorites
- [ ] Create `server/api/gallery/favorites.ts` (GET)
- [ ] Create `server/api/gallery/favorite.ts` (POST toggle)
- [ ] JWT verification on both
- [ ] Unit tests for both endpoints
- [ ] Update vercel.json routes
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Monitor for 48 hours

### Phase 3: Delete
- [ ] Create `server/api/gallery/delete.ts`
- [ ] JWT verification
- [ ] ID validation logic
- [ ] Unit tests
- [ ] Update vercel.json
- [ ] Deploy to production
- [ ] Monitor for 48 hours

### Phase 4: Cleanup
- [ ] Remove `server/gallery-images.ts` delegation
- [ ] Remove gallery routes from `server/[...route].ts`
- [ ] Update documentation
- [ ] Archive old Express Router code

---

## 11. ESTIMATED EFFORT

### Development Time

| Phase | Endpoints | Development | Testing | Total |
|-------|-----------|-------------|---------|-------|
| Phase 1: Core | 2 | 4h | 2h | 6h |
| Phase 2: Favorites | 2 | 2h | 1h | 3h |
| Phase 3: Delete | 1 | 1h | 1h | 2h |
| Phase 4: Cleanup | - | 2h | 1h | 3h |
| **Total** | **5 functional** | **9h** | **5h** | **14h** |

**Mock Endpoints:** 11 endpoints × 1-2h each = 11-22h (deferred)

---

## 12. RISKS & MITIGATION

### Risk 1: Gallery Downtime
**Impact:** 🔴 **CRITICAL** - Core user experience  
**Probability:** 🟡 Medium  
**Mitigation:**
- Phased rollout with monitoring
- Feature flag for instant rollback
- Keep Express Router as fallback
- Load test before production

### Risk 2: Data Inconsistency
**Impact:** 🔴 **HIGH** - User trust  
**Probability:** 🟢 Low  
**Mitigation:**
- Identical storage calls in both versions
- Integration tests verify data flow
- No schema changes during migration

### Risk 3: Performance Regression
**Impact:** 🟡 **MEDIUM** - User experience  
**Probability:** 🟢 Low  
**Mitigation:**
- Parallel fetching preserved
- Timeout logic maintained
- Load testing before rollout
- Monitoring dashboards

### Risk 4: Circuit Breaker Removal
**Impact:** 🟡 **MEDIUM** - Database protection  
**Probability:** 🟢 Low (if database stable)  
**Mitigation:**
- Monitor database connections
- Add external circuit breaker if needed (Upstash Redis)
- Rely on NeonDB built-in protections

---

## 13. SUCCESS METRICS

### Technical Metrics
- [ ] TypeScript: 0 errors
- [ ] Response time: < 2s for gallery view (p95)
- [ ] Error rate: < 0.1%
- [ ] Test coverage: > 80%

### Business Metrics
- [ ] Gallery load time unchanged or improved
- [ ] User complaints: 0 related to gallery
- [ ] Image operations success rate: > 99.9%

---

## RECOMMENDATION

### Immediate Action: **Proceed with Phase 1**

**Start with core gallery endpoints (`/api/gallery-images`)**

**Why:**
1. ✅ **Production-ready code exists** - Just needs conversion to pure serverless
2. ✅ **Clear business value** - Core user experience
3. ✅ **Low risk** - Identical database operations
4. ✅ **Quick win** - 6 hours to migrate both core endpoints
5. ✅ **Validates approach** - Proves pattern for remaining endpoints

**Next Steps:**
1. Create `server/api/gallery/images.ts` (consolidate gallery + gallery-images)
2. Add Stack Auth JWT verification
3. Migrate parallel fetching logic
4. Add to vercel.json
5. Deploy to staging
6. Monitor and deploy to production

**Timeline:** Ready for production in 1-2 days

---

## APPENDIX

### A. Full Gallery Router Code Structure

```
server/routes/modules/gallery.ts (596 lines)
├── Circuit Breaker (Lines 14-52)
├── Type Definitions (Lines 54-118)
├── GET /api/images/favorites (Lines 122-135)
├── POST /api/images/:id/favorite (Lines 137-157)
├── GET /api/gallery (Lines 165-233)
├── GET /api/gallery-images (Lines 235-303)
├── DELETE /api/ai-images/:id (Lines 309-325)
├── POST /api/gallery/upload (Lines 328-339)
├── POST /api/gallery/save (Lines 341-352)
├── POST /api/gallery/generate (Lines 354-366)
├── GET /api/gallery/category/:category (Lines 368-384)
├── GET /api/gallery/image/:imageId (Lines 386-408)
├── POST /api/gallery/image/:imageId (Lines 410-422)
├── DELETE /api/gallery/image/:imageId (Lines 424-435)
├── GET /api/gallery/tracker/:trackerId (Lines 449-467)
├── GET /api/gallery/prediction/:predictionId (Lines 469-487)
├── POST /api/gallery/concept (Lines 489-503)
├── POST /api/gallery/style (Lines 505-519)
└── GET /api/debug/gallery-inspect (Lines 572-596)
```

### B. Dependencies Map

```
Gallery Endpoints Depend On:
├── server/storage.ts (Database operations)
├── server/stack-auth.ts (JWT verification)
├── server/_utils/timing.ts (withTimeout helper)
├── shared/types/ai-generation.ts (Type definitions)
└── server/routes/middleware/error-handler.ts (Error handling)

All dependencies already serverless-compatible ✅
```

---

**Status:** Ready for migration execution  
**Recommendation:** Start with Phase 1 (Core Gallery - 2 endpoints)  
**Estimated Phase 1 Completion:** 1-2 days  
**Risk Level:** 🟢 **LOW** (well-defined, proven pattern)
