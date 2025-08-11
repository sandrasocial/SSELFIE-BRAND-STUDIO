# Safe Admin Deployment Protocol

## BEFORE Making Any Admin Agent Changes

### Step 1: Validate Member Features
```bash
# Check that all member revenue features are healthy
curl -H "Authorization: Bearer sandra-admin-2025" \
  http://localhost:5000/api/protection/validate/pre-admin-changes

# Expected result: All tests should show "pass"
```

### Step 2: Test Complete User Journey  
```bash
# Run Quinn's comprehensive journey test
curl -H "Authorization: Bearer sandra-admin-2025" \
  http://localhost:5000/api/quinn/test/complete-journey

# Expected result: overallStatus should be "PASS"
```

## DURING Admin Changes

### Safe Zones (Modify freely):
- `/api/admin/*` - All admin endpoints
- `/api/consulting-agents/*` - Agent communication  
- `/api/claude/*` - Agent messaging
- `/admin-*` pages - Admin dashboards
- Any agent coordination files in `/server/agents/`

### FORBIDDEN Zones (NEVER modify):
- `/api/subscription` 
- `/api/usage/status`
- `/api/user-model` 
- `/api/ai-images`
- `/api/auth/user`
- Maya page functionality
- Workspace core features
- Checkout/payment flow

## AFTER Admin Changes

### Step 3: Immediate Regression Test
```bash
# Re-test member journey
curl -H "Authorization: Bearer sandra-admin-2025" \
  http://localhost:5000/api/quinn/test/complete-journey

# If ANY test fails: IMMEDIATELY rollback admin changes
```

### Step 4: Health Monitor
```bash
# Check member feature health
curl http://localhost:5000/api/protection/health/member-features

# Should show all features as "operational"
```

## EMERGENCY ROLLBACK PROTOCOL

If member features break after admin changes:

1. **NEVER rollback member APIs** - these generate revenue
2. **Rollback ONLY admin routes and agent files**  
3. **Test member journey again to confirm recovery**
4. **Debug admin issues separately**

## DEPLOYMENT PRIORITY ORDER

1. **FIRST**: Deploy member revenue features (Maya, workspace, checkout)
2. **SECOND**: Deploy admin operational improvements
3. **NEVER**: Risk member features for admin convenience

This ensures your 135K+ followers can always access working features while you optimize operations behind the scenes.