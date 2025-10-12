# Maya Services & Personality Systems - Complete Migration Analysis

**Date:** October 12, 2025  
**Status:** Phase 3 Complete - 16 endpoints migrated to pure serverless  
**Remaining:** 6 Maya endpoints + Supporting services analysis

---

## 1. MIGRATION PROGRESS SUMMARY

### ✅ Completed (18 Pure Serverless Endpoints)
- **Auth (6):** user, auto-register, update-profile, update-gender, profile, me
- **Training (3):** user-model, status, progress
- **Maya Core (8):** chat, generate, heart-image, chats, chat-history, status, models, env-check
- **Profile (1):** GET /api/profile

**Commit:** a2275316 - "feat: migrate Maya utility endpoints (models, env-check) + complete migration analysis"

### ⏳ Remaining Maya Router Endpoints (3)

From `server/routes/modules/maya.ts` - Still in Express Router:

1. **POST /api/maya/get-video-prompt** (Line 38)
   - Uses Claude Vision API to analyze images
   - Generates video prompts for VEO integration
   - Dependencies: Anthropic SDK, timedFetch helper
   - Status: **FUTURE** - VEO not yet integrated, skip for now

2. **POST /api/maya-chat** (Line 488)
   - Legacy alias for /api/maya/chat
   - Status: **ALIAS** - Duplicate, can remove or redirect

3. **POST /api/maya-generate** (Line 511)
   - Legacy alias for /api/maya/generate
   - Status: **ALIAS** - Duplicate, can remove or redirect

### ✅ Just Completed (Commit a2275316)

4. **GET /api/maya/models** → `server/api/maya/models.ts`
   - Returns available FLUX models (flux-dev, flux-schnell)
   - Status: ✅ **MIGRATED**

5. **GET /api/maya/env-check** → `server/api/maya/env-check.ts`
   - Validates environment variables (ANTHROPIC_API_KEY, REPLICATE_API_TOKEN)
   - Status: ✅ **MIGRATED**

---

## 2. MAYA PERSONALITY & INTELLIGENCE SYSTEMS

### A. Maya Personality Configuration

**Location:** `server/agents/personalities/`

#### Files:
1. **`personality-config.ts`** (Included in tsconfig.deploy.json)
   - `PersonalityManager` class - Manages personality state
   - Personality selection and switching
   - Integration with Maya service layer
   - **Status:** ✅ Type-safe, no Express dependencies

2. **`maya-personality.ts`** (Included in tsconfig.deploy.json, 662 lines)
   - Complete fashion expertise system
   - Creative look definitions (6+ luxury styles)
   - Color theory, fabric knowledge, styling intelligence
   - Editorial direction and seasonal adaptation
   - **Status:** ✅ Pure TypeScript types and data
   - **Dependencies:** None - pure data structures

**Key Types:**
```typescript
export interface FashionExpertise {
  fabrics: { luxury, seasonal, texturePlay };
  colorTheory: { sophisticated, seasonalPalettes, complementaryPairs };
  accessories: { jewelry, bags, shoes, styling };
  hairMakeup: { hair, makeup, editorial };
}

export interface CreativeLook {
  name, description, keywords, lighting, scenery;
  fashionIntelligence, detailPropStyling, locationIntelligence;
  fashionDetails: { fabricChoices, colorPalette, silhouettes, layering, accessories, hairMakeup };
}
```

**Architecture:** These are **pure data/type files** - no HTTP handling, already serverless-ready.

---

### B. Maya Core Service Layer

**Location:** `server/services/maya-service.ts` (1,293 lines)

#### Main Class: `MayaService`

**Core Methods:**
1. `getOrCreateUserProfile(stackAuthId)` - Profile management
2. `getUserModel(userId)` - Fetch trained LoRA model
3. `processMessage(stackAuthId, request)` - Claude conversation orchestration
4. `generateImages(userId, request)` - FLUX generation coordination
5. `getConversations(stackAuthId)` - Conversation history
6. `getConversationMessages(conversationId, stackAuthId)` - Message retrieval

**Dependencies:**
- ✅ Anthropic SDK (Claude API)
- ✅ IStorage interface (database abstraction)
- ✅ PersonalityManager (Maya personality system)
- ✅ Type system from shared/types-override.ts

**Architecture Analysis:**
- **Pure service class** - no Express types
- **Instantiable** - takes IStorage in constructor
- **Used by endpoints** - generate.ts, chat.ts already call it
- **Status:** ✅ Serverless-compatible, no migration needed

**Current Usage:**
```typescript
// server/api/maya/generate.ts calls:
const { mayaService } = await import('../../services/maya-service.js');
const result = await mayaService.generateImages(dbUser.id, { conceptCard });
```

---

### C. Maya Module Handlers (Modular Endpoints)

**Location:** `server/maya/` (Vercel serverless structure)

#### Files:
1. **`server/maya/chat.ts`** - Wrapper delegating to `server/index.ts`
   - Current: Delegates to main Express router
   - **Replacement:** Already have `server/api/maya/chat.ts` (pure serverless)
   - **Status:** ⚠️ CLEANUP - Remove delegation wrapper

2. **`server/maya/concepts/index.ts`** (239 lines)
   - Concept card CRUD operations
   - Direct Drizzle ORM queries
   - Authentication: Simple header check (placeholder)
   - **Issue:** Uses hardcoded `userId = 'demo-user'`
   - **Status:** 🔴 NEEDS MIGRATION - Add proper Stack Auth

3. **`server/maya/images/index.ts`**
   - Image management operations (likely CRUD)
   - Not yet analyzed
   - **Status:** 🔍 NEEDS ANALYSIS

4. **`server/maya/models/index.ts`**
   - Model management operations
   - Not yet analyzed
   - **Status:** 🔍 NEEDS ANALYSIS

5. **`server/maya/profile/index.ts`**
   - Maya profile operations
   - Not yet analyzed
   - **Status:** 🔍 NEEDS ANALYSIS

6. **`server/maya/payments/index.ts`**
   - Payment integration
   - Not yet analyzed
   - **Status:** 🔍 NEEDS ANALYSIS

---

### D. Maya Chat Preview Service

**Location:** `server/maya-chat-preview-service.ts` (123 lines)

**Class:** `MayaChatPreviewService`

**Methods:**
1. `saveChatPreview(chatId, imageUrls, prompt, predictionId, userId)`
   - Saves AI-generated images as chat message previews
   - Returns ChatMessage with image previews
   - **Status:** ✅ Pure service class, serverless-ready

2. `heartImageToGallery(userId, imageUrl, prompt, category)`
   - Moves hearted preview images to permanent gallery
   - Marks as selected and favorite
   - **Status:** ✅ Already used by `server/api/maya/heart-image.ts`

**Dependencies:**
- ✅ IStorage interface (getDatabase())
- ✅ Type system from shared/types/chat.ts

**Architecture:** Pure service class, no HTTP handling - already serverless-compatible.

---

### E. Maya Diagnostic & Support Services

**Location:** `server/maya-diagnostic.ts`

**Purpose:** System health checks and debugging for Maya AI
- Training status validation
- API key verification
- Database connectivity tests
- Model version checks

**Status:** ✅ Utility service, no migration needed (internal tooling)

---

## 3. SUPPORTING INFRASTRUCTURE (Already Production-Ready)

### A. Image Storage & Migration
- ✅ `server/image-storage-service.ts` - S3 permanent storage
- ✅ `server/migration-monitor.ts` - Auto-migrate Replicate URLs
- ✅ `server/bulletproof-upload-service.ts` - Upload + validation

### B. Training Pipeline
- ✅ `server/model-training-service.ts` - LoRA training orchestration
- ✅ `server/training-completion-monitor.ts` - Status polling
- ✅ `server/model-validation-service.ts` - Quality checks

### C. Generation Pipeline
- ✅ `server/unified-generation-service.ts` - FLUX API coordination
- ✅ `server/generation-completion-monitor.ts` - Generation tracking

### D. User & Payment Services
- ✅ `server/services/user-migration-service.ts`
- ✅ `server/services/highlevel-service.ts` (CRM)
- ✅ `server/services/payment.ts` (Stripe)
- ✅ `server/services/slack-notification-service.ts`

---

## 4. CLIENT-SIDE MAYA INTEGRATION

### A. Maya Aesthetic System (Pure Client-Side)

**Location:** `client/src/features/maya/prompt/`

All **included in tsconfig** but not listed in deploy config (client-side only):

1. **`prompt-builder.ts`** - Main prompt orchestration
2. **`recipes/types.ts`** - Recipe type definitions
3. **`recipes/index.ts`** - 6 luxury aesthetic recipes
4. **`selectors/gender-style-selector.ts`** - Style selection logic
5. **`realizers/sentence-realizer.ts`** - Natural language processing
6. **`realizers/flux-realizer.ts`** - FLUX-specific prompts
7. **`utils/token-budget.ts`** - Token optimization

**Status:** ✅ Client-side only - no server migration needed

---

## 5. MIGRATION RECOMMENDATIONS

### ✅ Priority 1: Complete Core Maya Endpoints (DONE - Commit a2275316)

**Completed Actions:**

1. ✅ **SKIP** `/api/maya/get-video-prompt` - VEO not integrated yet
2. ✅ **CREATED** `server/api/maya/models.ts` - Simple static response
3. ✅ **CREATED** `server/api/maya/env-check.ts` - Environment validation
4. ✅ **UPDATED** vercel.json with new routes
5. ✅ **TESTED** TypeScript compilation - 0 errors

**Actual Time:** 15 minutes

---

### Priority 2: Clean Up Aliases & Duplicates (Today)

**Action:** Remove or redirect legacy endpoints:

1. **POST /api/maya-chat** → Redirect to `/api/maya/chat`
2. **POST /api/maya-generate** → Redirect to `/api/maya/generate`
3. **Remove** old Express router versions after testing

**Estimated Time:** 15 minutes

---

### Priority 3: Fix Maya Concept Cards Endpoint (High Priority)

**Issue:** `server/maya/concepts/index.ts` uses hardcoded `userId = 'demo-user'`

**Solution:** Add proper Stack Auth validation:
```typescript
// Replace placeholder auth
const user = await getUserFromRequest(req);
if (!user) return sendUnauthorized(res);
const userId = user.id; // Real Stack Auth user ID
```

**Estimated Time:** 20 minutes

---

### Priority 4: Analyze & Migrate Maya Sub-Modules (Phase 4)

**Modules to investigate:**
1. `server/maya/images/index.ts` - Image CRUD operations
2. `server/maya/models/index.ts` - Model management
3. `server/maya/profile/index.ts` - Profile operations
4. `server/maya/payments/index.ts` - Payment integration

**Action:** Read each file, identify endpoints, migrate to pure serverless pattern

**Estimated Time:** 2-3 hours (depends on complexity)

---

### Priority 5: Remove Express Router Entirely (Final Phase)

Once all endpoints migrated:

1. Delete `server/routes/modules/maya.ts`
2. Delete `server/routes/modules/auth.ts`
3. Delete `server/routes/modules/training.ts`
4. Remove Express adapter `server/_utils/express-to-vercel-adapter.ts`
5. Simplify `server/[...route].ts` to only handle gallery + admin
6. Update vercel.json to remove Express router references

**Estimated Time:** 1 hour + testing

---

## 6. NO MIGRATION NEEDED (Already Serverless-Ready)

### Pure Service Classes (No HTTP Handling)
- ✅ `server/services/maya-service.ts` - MayaService class
- ✅ `server/maya-chat-preview-service.ts` - MayaChatPreviewService
- ✅ `server/agents/personalities/maya-personality.ts` - Data structures
- ✅ `server/agents/personalities/personality-config.ts` - PersonalityManager
- ✅ All image storage, training, generation services

### Pure Utilities & Helpers
- ✅ `server/_utils/auth-helpers.ts` - JWT verification
- ✅ `server/_utils/request-helpers.ts` - Request parsing
- ✅ `server/_utils/response-helpers.ts` - Response formatting
- ✅ `server/maya-diagnostic.ts` - Internal tooling

### Client-Side Code
- ✅ All `client/src/features/maya/prompt/*` files
- ✅ Maya aesthetic recipes and style selectors

---

## 7. ARCHITECTURE VALIDATION

### Current Pure Serverless Pattern (Working)
```typescript
// server/api/maya/generate.ts
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { sendError, sendUnauthorized } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req);
  if (!user) return sendUnauthorized(res);
  
  const dbUser = await storage.getUserByStackAuthId(user.id);
  const { mayaService } = await import('../../services/maya-service.js');
  const result = await mayaService.generateImages(dbUser.id, { conceptCard });
  
  return res.status(200).json({ success: true, ...result });
}
```

### Service Layer Integration (No Changes Needed)
```typescript
// Services remain pure classes, called by endpoints
export class MayaService {
  constructor(db: IStorage) { ... }
  async generateImages(userId, request) { ... }
  async processMessage(stackAuthId, request) { ... }
}

// Usage in endpoints:
const { mayaService } = await import('../../services/maya-service.js');
```

---

## 8. TESTING CHECKLIST

### Endpoints to Test After Migration
- [ ] POST /api/maya/chat - Main conversation interface
- [ ] POST /api/maya/generate - Image generation
- [ ] POST /api/maya/heart-image - Save to gallery
- [ ] GET /api/maya-chats - List conversations
- [ ] GET /api/maya/chat-history - Get messages
- [ ] GET /api/maya/status - System status
- [ ] GET /api/maya/models - Available models (NEW)
- [ ] GET /api/maya/env-check - Environment validation (NEW)

### Service Integration Tests
- [ ] MayaService.processMessage() - Claude API calls
- [ ] MayaService.generateImages() - FLUX generation
- [ ] MayaChatPreviewService.heartImageToGallery() - Gallery saves
- [ ] PersonalityManager - Personality loading

### Database Operations
- [ ] Maya profile creation
- [ ] Conversation storage
- [ ] Message retrieval
- [ ] Concept card CRUD (after migration)

---

## 9. NEXT IMMEDIATE ACTIONS

### Today (30 minutes):
1. ✅ Create `server/api/maya/models.ts`
2. ✅ Create `server/api/maya/env-check.ts`
3. ✅ Add routes to vercel.json
4. ✅ Test TypeScript compilation
5. ✅ Commit and push

### Tomorrow (1 hour):
1. Analyze `server/maya/concepts/index.ts` in detail
2. Migrate to `server/api/maya/concepts.ts` with proper auth
3. Analyze `server/maya/images/`, `models/`, `profile/`, `payments/`
4. Create migration plan for each module

### End of Week (2 hours):
1. Complete all Maya sub-module migrations
2. Remove Express router completely
3. Clean up legacy code
4. Full end-to-end testing
5. Update documentation

---

## 10. RISK ASSESSMENT

### ✅ LOW RISK (Pure Service Classes)
- Maya service layer already serverless-compatible
- Personality system is pure data structures
- Supporting services have no HTTP dependencies

### ⚠️ MEDIUM RISK (Endpoint Migration)
- Maya sub-modules need proper Stack Auth
- Concept cards endpoint uses placeholder auth
- Need to test all database operations

### 🔴 HIGH RISK (Complete Express Removal)
- Gallery module (596 lines) not yet analyzed
- Admin routes not yet migrated
- Need comprehensive testing before removing Express

---

## CONCLUSION

**Maya's core intelligence and personality systems are already serverless-ready.** 

The main work remaining is:
1. **Endpoint migration** (3 utility endpoints + sub-modules)
2. **Authentication fixes** (concept cards + sub-modules)
3. **Express cleanup** (remove old router after testing)

**Estimated Total Time:** 4-6 hours spread over 2-3 days

**Current Status:** 18/21 functional Maya endpoints migrated (86% complete)

**Latest Commit:** a2275316 - Added models + env-check utility endpoints
