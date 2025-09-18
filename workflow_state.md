# SSELFIE Studio - Workflow State

## Current Development Phase
**PHASE: 1**

## Quality Gate Checklist
**CHECKS:**
- [ ] Branch created with proper naming convention (`feat/{short-task}-{YYYYMMDD}`)
- [ ] New code placed under approved directories only
- [ ] `pnpm typecheck` passes (no TypeScript errors)
- [ ] `pnpm lint` passes (no linting errors)
- [ ] `pnpm test` passes (all tests green)
- [ ] `pnpm build` succeeds (no build errors)
- [ ] PR opened with clear summary and test plan

## Recovery Procedures
**RECOVERY:**
- **If quality checks fail** → Run one autofix cycle; if still failing, open PR with error logs for review
- **If touching protected files** → STOP immediately and ask for explicit approval in PR comments
- **If breaking critical user journey** → Revert changes and reassess approach

## Development Guidelines

### Approved Development Areas
- `/server/services/**` - New backend services only
- `/client/src/features/**` - New frontend features only
- Documentation and test files anywhere

### Protected Areas (NO MODIFICATIONS)
- `/server/auth/**`
- `/server/stack-auth.ts` 
- `/server/db/**` (existing schema)
- `/client/src/lib/stack/**`
- All business-critical user journey files

### Environment Management
- All env variables must go through `/server/config/env.ts`
- Update `.env.example` with any new variables
- Never commit secrets or actual API keys

### Feature Development Rules
- New features behind feature flags
- All routes properly authenticated and guarded
- Mobile-first development (primary user base)
- Maintain Sandra's authentic brand voice

---

**Last Updated**: 2025-01-18  
**Next Review**: When phase changes or critical issues arise