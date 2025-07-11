# SSELFIE AI Photoshoot - New Project Implementation Plan

## Immediate Action Plan

### Step 1: Create New Minimal Replit Project
**Goal**: Fresh codebase with zero conflicts, photoshoot-only focus

**New Project Structure**:
```
sselfie-photoshoot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # All route pages
│   │   │   ├── Landing.tsx        # Public home page
│   │   │   ├── About.tsx          # Sandra's story
│   │   │   ├── HowItWorks.tsx     # 3-step process
│   │   │   ├── Blog.tsx           # Content/SEO
│   │   │   ├── Login.tsx          # Customer access
│   │   │   ├── Checkout.tsx       # Stripe payment
│   │   │   ├── ThankYou.tsx       # Post-purchase
│   │   │   ├── Studio.tsx         # Dashboard (protected)
│   │   │   ├── Training.tsx       # AI setup (protected)
│   │   │   ├── Chat.tsx           # Sandra AI (protected)
│   │   │   ├── Generate.tsx       # Image creation (protected)
│   │   │   └── Gallery.tsx        # Downloads (protected)
│   │   ├── components/    # Reusable UI
│   │   └── hooks/         # Auth & data fetching
├── server/                # Express backend
│   ├── routes/           # API endpoints
│   ├── services/         # AI, payment, training
│   └── db/              # Database schema
├── shared/               # Type definitions
└── public/              # Static assets
```

### Step 2: Extract Working Components from Current Project
**Salvage these proven pieces**:

1. **AI Training Service** (`server/model-training-service.ts`)
   - Individual user model training (15 minutes)
   - FLUX integration with Replicate API
   - Professional prompt templates

2. **AI Generation Service** (`server/ai-service.ts`)
   - Image generation with user models
   - 4 images per session
   - Usage tracking and limits

3. **Design System** (from styleguide)
   - Times New Roman typography
   - Editorial color palette
   - Hero fullbleed patterns

4. **Authentication Pattern**
   - Session-based auth after purchase
   - Protected route wrapper
   - Seamless login/logout

### Step 3: Build Core User Journey (24-48 hours)

**Day 1: Foundation & Public Pages**
- Set up new Replit project with clean architecture
- Build Landing page with hero fullbleed + €97 offer
- Create About, How It Works, Blog pages
- Implement Stripe checkout flow

**Day 2: Authenticated Experience**
- Build Studio dashboard with training status
- Integrate AI training service (15-minute flow)
- Create Sandra AI chat interface
- Implement image generation + gallery

### Step 4: Launch Strategy
1. **Soft Launch**: Test with small group from 5K Manychat
2. **Email Announcement**: Send to 2.5K email subscribers
3. **Social Campaign**: Leverage 120K followers for scale
4. **Revenue Tracking**: Monitor €97 subscriptions immediately

## Risk Mitigation

### Technical Risks
- **Database Conflicts**: Fresh schema, no inheritance
- **Authentication Issues**: Simple session-based, post-purchase only
- **AI Integration**: Proven services from current project
- **Payment Processing**: Standard Stripe integration

### Business Risks
- **Time Pressure**: Focus on MVP, launch quickly
- **Feature Creep**: Resist adding complex features initially
- **Cash Flow**: Prioritize revenue generation over perfection

## Success Criteria
- **Technical**: Complete user journey from landing to download
- **Business**: First €97 subscription within 48 hours of launch
- **User Experience**: Seamless flow with minimal friction
- **Scalability**: Architecture ready for 120K follower influx

## Next Actions
1. Create new Replit project immediately
2. Set up basic React + Express structure
3. Extract and adapt AI services from current codebase
4. Build landing page with conversion focus
5. Test complete user journey end-to-end

This plan prioritizes speed to market while maintaining quality and ensuring immediate revenue generation capability.