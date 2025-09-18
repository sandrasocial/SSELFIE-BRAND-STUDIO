# SSELFIE Studio - Core Protection Rules

## 🚨 PROTECTED AREAS - NEVER MODIFY

### Critical Infrastructure
- `/server/auth/**` - Authentication logic
- `/server/stack-auth.ts` - Stack Auth integration
- `/server/db/**` - Existing database schema files
- `/client/src/lib/stack/**` - Stack Auth client integration

### Business-Critical Files
- `/client/src/pages/business-landing.tsx` - Entry point for new users
- `/client/src/pages/simple-checkout.tsx` - Payment processing
- `/client/src/pages/payment-success.tsx` - Post-payment redirect
- `/client/src/pages/simple-training.tsx` - AI model training flow
- `/client/src/components/AppLayout.tsx` - Main app structure
- `/client/src/components/MobileTabLayout.tsx` - Mobile navigation
- `/client/src/pages/BrandStudioPage.tsx` - Core creative workspace
- `/client/src/pages/sselfie-gallery.tsx` - User photo gallery
- `/client/src/components/Auth.tsx` - Authentication components
- `/client/src/components/MemberNavigation.tsx` - Top navigation
- `/client/src/components/GlobalFooter.tsx` - Footer component

## ✅ APPROVED DEVELOPMENT AREAS

### New Services
- Only create new services under: `/server/services/**`
- Follow existing patterns and naming conventions
- Include proper TypeScript types and error handling

### New UI Features
- Only create new feature code under: `/client/src/features/**`
- Use existing component patterns and design system
- Maintain mobile-first responsive design

## 🔄 WORKFLOW REQUIREMENTS

### Branch Management
- Always create a new branch: `feat/{short-task}-{YYYYMMDD}`
- Example: `feat/maya-chat-improvements-20250118`

### Pre-PR Checks (MANDATORY)
Always run before creating PR:
```bash
pnpm i && pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

### Environment Variables
- All env reads must go through `/server/config/env.ts`
- Update `.env.example` with any new variables
- Never commit actual secrets or API keys

### Code Reuse
- Search for existing utilities with `rg` before adding new ones
- Example: `rg "function.*validate" --type ts`
- Reuse existing patterns and components

### Feature Development
- New features must be behind feature flags
- All routes must be properly guarded with authentication
- Test on mobile devices (primary user base)

## 🛡️ GUARDRAILS

### Before Any Changes
1. Understand the user journey stage
2. Check if changes affect authentication/training/payments
3. Ensure critical path remains intact
4. Preserve Sandra's authentic brand voice

### Authentication Flow Protection
- Stack Auth integration must remain intact
- Protected routes (`/api/*`) must stay protected  
- User session management cannot be modified
- Login/logout functionality must work

### Payment System Protection
- Stripe integration cannot be modified
- Webhook handling must remain functional
- Plan validation (`sselfie-studio` only) must work
- Customer portal access must be maintained

### Training System Protection
- File upload validation (min 10 selfies) must work
- Progress polling during training must function
- Replicate model integration cannot be broken
- Database model storage must remain intact
- Redirect to `/app` after completion must work

---

**VIOLATION POLICY**: Any changes to protected areas require explicit approval through PR review. Agents should STOP and ask for approval rather than proceeding.