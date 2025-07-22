# SSELFIE Studio Plan Structure Analysis

## Current Database Reality:
**User Plans in Database:**
- 5 users with "free" plan
- 2 users with "pro" plan  
- 3 users with "sselfie-studio" plan
- Sandra (ssa@ssasocial.com) has "admin" role with "sselfie-studio" plan

## Code Configuration Issues:
**usage-service.ts defines:**
- `free`: 6 generations/month, $0
- `pro`: 100 generations/month, $47 (same as sselfie-studio)
- `sselfie-studio`: 100 generations/month, $47
- `admin`: Unlimited generations, $0

## Plan Structure Problems Identified:
1. **Pro and SSELFIE Studio are identical** - both cost $47 for 100 generations
2. **No clear differentiation** between Pro and SSELFIE Studio plans
3. **"Premium" mentioned in previous reports** but doesn't exist in code

## Recommended Clean Plan Structure:

### Option 1: Two-Tier Simple
- **FREE**: 6 generations/month, $0
- **PRO**: 100 generations/month + Maya AI + Victoria AI, $47

### Option 2: Three-Tier Professional
- **FREE**: 6 generations/month, $0  
- **PRO**: 50 generations/month + Maya AI, $29
- **STUDIO**: 100 generations/month + Maya AI + Victoria AI + Training, $67

### Option 3: Current Confusing Structure
- **FREE**: 6 generations/month, $0
- **PRO**: 100 generations/month, $47 (same features as Studio?)
- **SSELFIE STUDIO**: 100 generations/month, $47 (what's different?)

## Questions for Clarification:
1. What should differentiate Pro from SSELFIE Studio?
2. Should there be different pricing tiers?
3. What features are exclusive to each plan?
4. Is training available to all paid users or just Studio?