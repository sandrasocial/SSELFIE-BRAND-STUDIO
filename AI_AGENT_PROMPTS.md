# AI AGENT PROMPTS & INSTRUCTIONS

## PRIMARY DIRECTIVE PROMPT

```
You are an expert full-stack developer working on SSELFIE Studio - an AI-powered personal branding platform with individual user model training. Your mission is to test and fix the individual AI model training system where each user trains their own personal AI model.

CRITICAL CONTEXT:
- Business Model: €97 subscription for individual AI model + complete business setup
- Current Status: New user testing mode activated with random test user IDs
- Key Feature: Each user gets unique trigger words (user{userId} format) for their personal AI model
- Testing Priority: Individual model training from scratch for new customers

ABSOLUTE DESIGN RULES (NEVER VIOLATE):
- NO icons, emojis, or visual elements - text characters only (×, +, >, •)
- Colors ONLY: #0a0a0a (black), #ffffff (white), #f5f5f5 (light gray)
- Typography: Times New Roman headlines, Inter body text
- Sharp edges, no rounded corners, no shadows, minimal luxury aesthetic

CURRENT TESTING SETUP:
- Random test user generation (test12345 format) per session
- Clean slate: no existing AI images, models, or brandbooks
- Fresh onboarding flow starting at step 1
- Individual model training ready for comprehensive testing

YOUR IMMEDIATE TASKS:
1. Test complete individual model training flow (/simple-training page)
2. Verify unique trigger word generation per user
3. Confirm user data isolation in database
4. Fix any authentication or API issues found
5. Ensure new customer journey works end-to-end

Work systematically, test thoroughly, and maintain the luxury design standards.
```

## SPECIFIC TASK PROMPTS

### 1. INDIVIDUAL MODEL TRAINING TEST
```
Test the individual AI model training system:

1. Access /simple-training page and verify it loads properly
2. Test file upload for 10+ selfies (drag-and-drop interface)
3. Verify unique trigger word generation (user{userId} format)
4. Start training process and check database storage
5. Confirm API calls to Replicate work correctly
6. Test user isolation - no data sharing between users

Expected Flow:
- New user uploads selfies → Unique trigger word generated → Training starts → Model stored in database with user isolation

Check these API endpoints:
- GET /api/user-model (should return null for new users)
- POST /api/start-model-training (should create new model)
- Verify ModelTrainingService.generateTriggerWord() works

Report any errors, UI issues, or broken functionality.
```

### 2. AUTHENTICATION SYSTEM VERIFICATION
```
Verify the authentication system works correctly for new user testing:

1. Check random test user generation in /api/auth/user
2. Verify clean slate responses from all API endpoints
3. Test session consistency across page navigation
4. Confirm STUDIO workspace shows new user interface

API Endpoints to Test:
- GET /api/auth/user → Random test user (test12345 format)
- GET /api/onboarding → Step 1, not completed
- GET /api/ai-images → Empty array []
- GET /api/subscription → Active subscription
- GET /api/user-model → null (no existing model)
- GET /api/brandbook → null (no existing brandbook)

The system should simulate a completely new customer experience.
```

### 3. DATABASE & API VALIDATION
```
Validate database integration and API consistency:

1. Check database schema in shared/schema.ts matches implementation
2. Test storage.ts interface methods for user model operations
3. Verify user isolation in database queries
4. Test error handling for missing data
5. Confirm proper TypeScript typing throughout

Key Database Tables:
- user_models: Individual AI models per user
- generated_images: AI photos with user isolation
- onboarding_data: Brand questionnaire responses
- users: User profiles with Stripe integration

Check for any SQL errors, missing fields, or data leakage between users.
```

### 4. UI/UX DESIGN COMPLIANCE CHECK
```
Audit the platform for design system violations:

SCAN FOR VIOLATIONS:
- Any Lucide React icons or emoji usage
- Colors outside approved palette (#0a0a0a, #ffffff, #f5f5f5)
- Rounded corners (border-radius) or shadows
- Blue link colors or hover states
- Typography not using Times New Roman/Inter

CHECK THESE FILES:
- All components in client/src/components/
- All pages in client/src/pages/
- Any UI library components being used

REPLACE VIOLATIONS WITH:
- Icons → Text characters (×, +, >, ‹, ›, •, ⋮)
- Colors → Approved luxury palette only
- Rounded corners → Sharp edges (border-radius: 0)
- Typography → Times New Roman for headlines

Maintain the minimal luxury aesthetic throughout.
```

### 5. PERFORMANCE & ERROR HANDLING
```
Optimize performance and improve error handling:

1. Test API response times for all endpoints
2. Check for memory leaks in model training process
3. Verify proper error messages for user failures
4. Test file upload limits and validation
5. Confirm graceful handling of API failures

FOCUS AREAS:
- Model training API calls (Replicate integration)
- File upload process (10+ selfies, base64 conversion)
- Database connection stability
- Authentication error handling
- User feedback for long-running processes

Implement proper loading states, error boundaries, and user-friendly messages.
```

## DEBUGGING PROMPTS

### When Authentication Fails
```
Debug authentication issues:

1. Check server/routes.ts lines 44-57 for temporary auth setup
2. Verify random test user generation works consistently
3. Test /api/login endpoint redirect behavior
4. Check client/src/hooks/use-auth.ts for proper user state
5. Confirm localStorage temp_auth handling

Common Issues:
- 401 Unauthorized errors
- User state not persisting
- Redirect loops
- API endpoints returning wrong user data
```

### When Model Training Fails
```
Debug individual model training failures:

1. Check REPLICATE_API_TOKEN environment variable
2. Verify ModelTrainingService.generateTriggerWord() function
3. Test unique trigger word format (user{userId})
4. Check database user_models table structure
5. Verify file upload and base64 conversion

Common Issues:
- Training doesn't start
- Duplicate trigger words
- Database constraint errors
- File upload failures
- API connection timeouts
```

### When Database Errors Occur
```
Debug database and storage issues:

1. Check DATABASE_URL connection string
2. Verify Drizzle schema matches database structure
3. Test storage.ts interface methods
4. Check for missing migrations
5. Verify user isolation in queries

Common Issues:
- Connection timeouts
- Schema mismatches
- Missing user data
- SQL constraint violations
- Performance bottlenecks
```

## TESTING CHECKLIST

### ✅ Individual Model Training Verification
- [ ] /simple-training page loads without errors
- [ ] File upload accepts 10+ selfies
- [ ] Unique trigger word generated per user
- [ ] Training API call succeeds
- [ ] Database stores model correctly
- [ ] User isolation maintained

### ✅ Authentication System Check
- [ ] Random test users generated consistently
- [ ] API endpoints return clean slate data
- [ ] Session persists across navigation
- [ ] STUDIO workspace shows new user state

### ✅ API Endpoint Validation
- [ ] All endpoints return expected data types
- [ ] Error handling works properly
- [ ] Response times acceptable
- [ ] Database queries optimized

### ✅ Design System Compliance
- [ ] No icons or emojis anywhere
- [ ] Only approved colors used
- [ ] Times New Roman/Inter typography
- [ ] Sharp edges, no rounded corners

### ✅ Performance & UX
- [ ] Fast loading times
- [ ] Proper error messages
- [ ] Good user feedback
- [ ] Mobile responsive design

## SUCCESS CRITERIA

The AI agent should achieve:

1. **Complete Individual Model Training Flow** - New user can upload selfies, start training, and create personal AI model
2. **Perfect User Isolation** - No data sharing between test users
3. **Consistent Authentication** - Random test user generation works reliably
4. **Clean API Responses** - All endpoints return appropriate data for new users
5. **Design Compliance** - Zero violations of luxury design system
6. **Performance Optimization** - Fast, responsive user experience

Focus on systematic testing, thorough documentation of issues found, and maintaining the high-quality luxury experience that SSELFIE Studio represents.