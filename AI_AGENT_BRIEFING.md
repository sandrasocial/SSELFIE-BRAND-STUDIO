# AI AGENT BRIEFING: SSELFIE Studio Development

## MISSION OVERVIEW
You are working on SSELFIE Studio - an AI-powered personal branding platform that transforms selfies into complete business launches. This is not a basic photo tool - it's the "Tesla of personal branding," enabling women to build their personal brand and launch their business in 20 minutes using only their phone.

## BUSINESS MODEL
- **Single Product**: €97 SSELFIE STUDIO subscription
- **Core Value**: Individual AI model training + complete business setup
- **Target Market**: Women entrepreneurs, coaches, service providers
- **Unique Selling Point**: Each user trains their own personal AI model with unique trigger words

## CURRENT PLATFORM STATUS

### ✅ COMPLETED FEATURES
1. **Complete Authentication System** - Replit Auth with temporary testing mode
2. **Individual User Model Training** - Each user gets unique trigger words (user{userId} format)
3. **STUDIO Workspace** - 5-tab interface with AI photoshoot, gallery, landing builder
4. **Sandra AI Designer** - Claude 4.0 powered conversation system
5. **Brandbook System** - 4 professional templates with live switching
6. **Usage Tracking** - Cost protection with 300 monthly generations limit
7. **Payment Integration** - Stripe checkout with €97 subscription
8. **Onboarding Flow** - 6-step comprehensive brand data collection

### 🚧 CURRENT TESTING MODE
- **New User Simulation**: Random test user IDs (test12345 format)
- **Clean Slate**: Empty AI images, fresh onboarding, no existing models
- **Purpose**: Test individual model training from customer perspective

## CRITICAL ARCHITECTURE PRINCIPLES

### Database Schema (PostgreSQL + Drizzle ORM)
```typescript
// Key tables in shared/schema.ts:
- users: User profiles with Stripe integration
- user_models: Individual AI model training per user
- generated_images: AI-generated photos with user isolation
- onboarding_data: Complete brand questionnaire responses
- brandbooks: Template-based brand design system
- subscriptions: Single €97 plan management
```

### Individual Model Training System
```typescript
// ModelTrainingService key points:
- Unique trigger words: user{userId} format
- 10+ selfie requirement for training
- 20-minute training process via Replicate API
- Complete user isolation - no data sharing
- Ready for new customer testing
```

### Authentication Architecture
```typescript
// Current setup for testing:
- Temporary auth bypass for new user simulation
- Random test user generation per session
- Clean API responses for fresh experience
- Ready for full Replit Auth integration
```

## DESIGN SYSTEM (CRITICAL - NEVER VIOLATE)

### Absolute Rules
- **NO ICONS OR EMOJIS EVER** - Use text characters only (×, +, >, <, •, ...)
- **Colors ONLY**: #0a0a0a (black), #ffffff (white), #f5f5f5 (light gray)
- **Typography**: Times New Roman for headlines, Inter for body text
- **NO rounded corners, NO shadows, NO blue links**
- **Sharp edges, minimal luxury aesthetic**

### Code Examples
```typescript
// WRONG:
<ChevronRight className="h-4 w-4" />
<Button className="bg-blue-500 rounded-lg">

// CORRECT:
<span>›</span>
<Button className="bg-black text-white">
```

## FILE STRUCTURE & KEY LOCATIONS

### Frontend (client/src/)
```
pages/
  - workspace.tsx (STUDIO interface)
  - onboarding.tsx (6-step flow)
  - simple-training.tsx (individual model training)
  - brandbook-designer.tsx (template system)

components/
  - navigation.tsx (auth-aware menu)
  - studio/ (workspace components)
  - onboarding/ (step components)
```

### Backend (server/)
```
routes.ts (main API endpoints)
model-training-service.ts (individual AI training)
ai-service.ts (FLUX image generation)
storage.ts (database operations)
replitAuth.ts (authentication system)
```

### Critical Files
```
shared/schema.ts (database schema)
replit.md (project documentation)
vercel.json (deployment config)
api/index.js (serverless functions)
```

## TESTING PRIORITIES

### 1. Individual Model Training (HIGHEST PRIORITY)
**Current Issue**: Need to test complete new customer journey
```bash
# Test Flow:
1. Visit /workspace (should show clean STUDIO)
2. Navigate to /simple-training
3. Upload 10+ selfies
4. Verify unique trigger word generation
5. Start training process
6. Check 20-minute completion
```

**Expected Behavior**:
- New user gets test{randomId} user ID
- No existing model found (returns null)
- Unique trigger word: user{userId}
- Training starts with Replicate API
- Database stores model with user isolation

### 2. API Endpoint Validation
**Check These Endpoints**:
```bash
GET /api/auth/user → Should return test user
GET /api/user-model → Should return null for new users
GET /api/onboarding → Should return step 1, not completed
GET /api/ai-images → Should return empty array []
POST /api/start-model-training → Should create new model
```

### 3. Authentication Flow
**Current Setup**: Temporary testing mode
```typescript
// In server/routes.ts line 44-57:
// Returns random test user instead of real auth
// Need to verify this works consistently
```

### 4. Database Integration
**Storage Interface**: server/storage.ts
```typescript
// Key methods to verify:
- getUserModelByUserId(userId)
- startModelTraining(userId, selfieImages)
- createOnboardingData(data)
- getUserAiImages(userId)
```

## COMMON ISSUES & SOLUTIONS

### 1. Authentication Errors
```bash
# Symptoms: 401 Unauthorized, auth/user fails
# Solution: Check temporary auth bypass in routes.ts
# Verify random test user generation works
```

### 2. Database Connection Issues
```bash
# Symptoms: Storage errors, PostgreSQL connection fails
# Solution: Check DATABASE_URL environment variable
# Verify Neon database connection
```

### 3. Model Training Failures
```bash
# Symptoms: Training doesn't start, no model created
# Solution: Check REPLICATE_API_TOKEN
# Verify unique trigger word generation
# Check user isolation in database
```

### 4. Design Violations
```bash
# Symptoms: Icons appear, wrong colors used
# Solution: Search for Lucide imports
# Replace with text characters
# Check color values match design system
```

## DEVELOPMENT COMMANDS

### Local Development
```bash
npm run dev          # Start development server
npm run db:push      # Push schema changes
npm run db:studio    # View database
```

### Testing Commands
```bash
# Test individual model training:
curl -X GET http://localhost:5000/api/user-model
curl -X GET http://localhost:5000/api/auth/user

# Test new user simulation:
curl -X GET http://localhost:5000/api/onboarding
curl -X GET http://localhost:5000/api/ai-images
```

### Environment Variables Required
```bash
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## DEPLOYMENT STATUS
- **Local**: http://localhost:5000 (development)
- **Live**: https://www.sselfie.ai (production)
- **Both environments**: Configured for new user testing
- **Vercel**: Serverless functions in api/index.js

## ACTION ITEMS FOR AI AGENT

### Immediate Tasks
1. **Verify Individual Model Training**: Test complete flow from selfie upload to model creation
2. **Fix Any Authentication Issues**: Ensure test user generation works consistently
3. **Database Validation**: Confirm user isolation and unique trigger words
4. **API Endpoint Testing**: Verify all endpoints return correct data for new users

### Secondary Tasks
1. **Performance Optimization**: Check API response times
2. **Error Handling**: Improve user feedback for failures
3. **UI/UX Polish**: Fix any design violations
4. **Documentation**: Update any missing technical details

### Code Quality Standards
- **TypeScript**: Strict mode, proper typing
- **Database**: Drizzle ORM with proper schemas
- **API**: RESTful endpoints with error handling
- **Frontend**: React with TanStack Query
- **Styling**: Tailwind CSS with design system compliance

## SUCCESS METRICS
1. **New user can complete full onboarding** ✓
2. **Individual model training works end-to-end** (TESTING NEEDED)
3. **Unique trigger words generated per user** ✓
4. **User data completely isolated** ✓
5. **€97 subscription flow operational** ✓

## REPOSITORY INFORMATION
- **GitHub**: https://github.com/sandrasocial/SSELFIE
- **Main Branch**: All changes go to main
- **Recent Commits**: New user testing mode activated
- **Last Update**: Individual model training system ready for testing

This briefing provides everything needed to continue development and testing of the individual user model training system. Focus on testing the complete new customer journey and fixing any issues found.