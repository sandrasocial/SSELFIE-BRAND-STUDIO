# GitHub Codespace Setup Instructions

## Quick Start for AI Agent

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server will run on port 5000
# Access at: http://localhost:5000
```

### 2. Environment Variables Required
Create `.env` file with:
```bash
DATABASE_URL=postgresql://[connection_string]
ANTHROPIC_API_KEY=sk-[key]
REPLICATE_API_TOKEN=r8_[token]
STRIPE_SECRET_KEY=sk_test_[key]
VITE_STRIPE_PUBLIC_KEY=pk_test_[key]
STRIPE_WEBHOOK_SECRET=whsec_[secret]
RESEND_API_KEY=re_[key]
```

### 3. Database Setup
```bash
# Push schema to database
npm run db:push

# View database (optional)
npm run db:studio
```

### 4. Key Testing URLs
```bash
# Main workspace (new user testing)
http://localhost:5000/workspace

# Individual model training page
http://localhost:5000/simple-training

# Onboarding flow
http://localhost:5000/onboarding

# Admin tools
http://localhost:5000/admin
```

### 5. Critical API Endpoints to Test
```bash
# Authentication
GET /api/auth/user

# User model status
GET /api/user-model

# Onboarding data
GET /api/onboarding

# AI images
GET /api/ai-images

# Start model training
POST /api/start-model-training
```

### 6. Database Commands
```bash
# Connect to database
npm run db:studio

# Reset migrations (if needed)
rm -rf drizzle/

# Push new schema
npm run db:push
```

### 7. File Structure Priority
```
Essential Files to Understand:
├── shared/schema.ts (database schema)
├── server/routes.ts (main API)
├── server/model-training-service.ts (AI training)
├── client/src/pages/simple-training.tsx (test page)
├── client/src/pages/workspace.tsx (main interface)
└── replit.md (project documentation)
```

### 8. Testing Commands
```bash
# Test API endpoints
curl http://localhost:5000/api/auth/user
curl http://localhost:5000/api/user-model
curl http://localhost:5000/api/onboarding

# Check server logs
tail -f logs/server.log

# Test individual model training
# Visit: http://localhost:5000/simple-training
```

### 9. Common Issues & Solutions

**Port Conflicts:**
```bash
# Kill existing processes
pkill -f "node.*5000"
npm run dev
```

**Database Connection:**
```bash
# Check connection
npm run db:studio
# Should open database interface
```

**Missing Dependencies:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 10. Development Workflow
```bash
# 1. Make changes to code
# 2. Server auto-restarts (watch mode)
# 3. Test in browser
# 4. Check console logs for errors
# 5. Commit changes when working
```

## Project Context for AI Agent

### Current Mission
Test and fix the **individual user model training system** where each customer trains their own personal AI model with unique trigger words.

### Key Components to Focus On
1. **ModelTrainingService** - Handles AI model creation
2. **Authentication System** - Random test user generation
3. **Database Storage** - User isolation and model storage
4. **API Endpoints** - Clean slate responses for new users
5. **UI Components** - Design system compliance

### Testing Priority
1. Individual model training flow (/simple-training)
2. User data isolation
3. Unique trigger word generation
4. API consistency
5. Design system compliance

The system is currently in "new user testing mode" with random test user IDs and clean slate data to simulate fresh customer experience.