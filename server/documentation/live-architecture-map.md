# SSELFIE Studio Live Architecture Map

## CRITICAL FOR ALL AGENTS: COMPLETE LIVE APPLICATION SCOPE

### 🎯 LIVE APPLICATION (SEARCH ALL THESE)
```
client/                                   ✅ CLIENT-SIDE APPLICATION
├── src/                                 ✅ React Frontend Source
│   ├── pages/
│   │   ├── admin-consulting-agents.tsx   ✅ Sandra's Admin Console  
│   │   ├── workspace.tsx                 ✅ User Workspace
│   │   ├── landing.tsx                   ✅ Marketing Landing
│   │   └── editorial-landing.tsx         ✅ Main "/" Route
│   ├── components/
│   │   ├── admin/                        ✅ Admin Components
│   │   ├── ui/                          ✅ Shadcn Components
│   │   └── workspace/                   ✅ User Interface
│   └── hooks/                           ✅ React Hooks

server/                                   ✅ BACKEND APPLICATION
├── routes.ts                            ✅ Main API Routes
├── services/                            ✅ Business Logic  
├── tools/                               ✅ Agent Tool System
└── agent-personalities-consulting.ts    ✅ Agent Configurations

src/                                     ✅ SOURCE FILES (LIVE)
└── [various source files]               ✅ Part of Live Application

api/                                     ✅ API ROUTES
└── [API endpoints]                      ✅ Live API Routes

shared/                                   ✅ SHARED SCHEMAS
└── schema.ts                            ✅ Database Models
```

### 🚫 LEGACY/ARCHIVE (AVOID ONLY THESE)
```
archive/                                 ❌ OLD VERSIONS, CONFLICTS, TESTS
attached_assets/                         ❌ USER UPLOADS, NOT CODE
```

## AGENT SEARCH PROTOCOL

### ✅ CORRECT: Priority Search Order
1. `client/src/pages/` - Live pages
2. `client/src/components/` - Live components  
3. `server/` - Live backend
4. `shared/` - Shared schemas

### ❌ INCORRECT: Legacy Search (Causes Confusion)
1. `src/` - Old development files
2. `components/` - Scattered/orphaned files
3. `archive/` - Old versions and conflicts

## COMMON AGENT MISTAKES TO AVOID

### Finding Wrong Files
❌ "Found admin-consulting-agents.tsx in archive/"
✅ "Found admin-consulting-agents.tsx in client/src/pages/"

### Modifying Legacy Code
❌ Editing files in `src/` or `components/` (root level)
✅ Editing files in `client/src/` subdirectories

### Analyzing Outdated Architecture
❌ Looking at archived components for understanding current system
✅ Analyzing live components in `client/src/` for current implementation

## VERIFICATION CHECKLIST

Before making any changes, agents should verify:
- [ ] File path starts with `client/src/` for frontend
- [ ] File path starts with `server/` for backend  
- [ ] File path starts with `shared/` for schemas
- [ ] File is NOT in `archive/`, `src/`, or root `components/`
- [ ] File appears in actual application routing (App.tsx)

## SANDRA'S LIVE APPLICATION STRUCTURE

```
SSELFIE Studio Production App
├── Frontend: client/src/ (React + TypeScript)
├── Backend: server/ (Express + TypeScript)  
├── Database: Neon PostgreSQL (via shared/schema.ts)
├── Auth: Replit OIDC
├── Payments: Stripe
└── AI: FLUX + Claude APIs
```

This is Sandra's €67/month AI personal branding platform with 1000+ users generating editorial selfies.