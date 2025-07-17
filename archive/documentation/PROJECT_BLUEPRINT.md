# SSELFIE AI PHOTOSHOOT - New Project Blueprint

## Project Goal
Launch minimal €97/month AI photoshoot service to generate immediate revenue from 120K followers, 5K Manychat, 2.5K email subscribers.

## User Journey Architecture

### Phase 1: Pre-Authentication (Public Marketing)
**No authentication required - accessible to all visitors**

1. **Landing Page** (`/`)
   - Hero fullbleed with SSELFIE branding
   - €97/month pricing clear and prominent
   - Visual-first design with minimal text
   - CTA: "Start Your Photoshoot" → Checkout

2. **About Page** (`/about`)
   - Sandra's story in warm, friendly language
   - Hero fullbleed with personal photos
   - Build trust and connection

3. **How It Works** (`/how-it-works`)
   - 3 simple steps with visuals:
     1. Upload selfies (15 min training)
     2. Chat with Sandra AI about vision
     3. Generate & download professional photos
   - Hero fullbleed design pattern

4. **Blog** (`/blog`)
   - Content for SEO and engagement
   - Personal branding tips
   - Customer success stories

5. **Login** (`/login`)
   - Simple form for existing customers
   - Access to Studio after authentication

### Phase 2: Purchase Flow (No Auth)
**Payment first, then account creation**

6. **Checkout** (`/checkout`)
   - Stripe integration for €97 payment
   - No account required to purchase
   - Clean, conversion-optimized design

7. **Thank You** (`/thank-you`)
   - Payment confirmation
   - "Begin Your Journey" button → Studio
   - Sets up authentication after purchase

### Phase 3: Authenticated Experience (Post-Purchase)

8. **Studio Dashboard** (`/studio`)
   - **PROTECTED ROUTE** - requires authentication
   - Clean overview showing:
     - Training status (15 minutes)
     - Generated images count
     - Quick access to all features

9. **Training Setup** (`/studio/training`)
   - Selfie upload guide (10+ photos)
   - Real-time training progress (15 min timer)
   - Tips for best results

10. **Sandra AI Chat** (`/studio/chat`)
    - Conversation about photoshoot vision
    - Generates perfect prompts using templates
    - Saves preferences to user profile

11. **Image Generation** (`/studio/generate`)
    - One-click generation using Sandra AI prompts
    - 4 professional images per session
    - Instant preview and selection

12. **Gallery** (`/studio/gallery`)
    - View all generated images
    - Click to save favorites
    - Download to device functionality

## Technical Architecture

### Authentication Flow
- **Public pages**: No auth checks, instant loading
- **Purchase**: Stripe checkout without account requirement
- **Post-purchase**: Creates account + session automatically
- **Studio access**: Protected routes with seamless login/logout

### Core Features
- **Individual AI Training**: 15-minute custom model per user
- **Sandra AI Agent**: Contextual chat for prompt generation
- **Template System**: Pre-built professional prompts
- **Usage Tracking**: Monitor generation limits
- **Gallery Management**: Save, organize, download images

### Design System
- **Full Styleguide**: Editorial luxury aesthetic
- **Typography**: Times New Roman headlines, system fonts
- **Colors**: Black (#0a0a0a), White (#ffffff), Editorial Gray (#f5f5f5)
- **Voice**: Simple everyday language, warm and friendly
- **Layout**: Hero fullbleed on every page, images first, minimal text

## Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + PostgreSQL
- **AI**: Replicate FLUX with individual user models
- **Payment**: Stripe integration
- **Authentication**: Session-based with secure cookies
- **Deployment**: Vercel + Neon Database

## Success Metrics
- **Revenue Target**: €97/month subscriptions
- **User Journey**: Purchase → Training → Generation → Download
- **Technical Goals**: 15-minute training, 4 images per generation
- **Business Goal**: Solve €50/day cost crisis with immediate revenue

## Development Phases
1. **Phase 1**: Core photoshoot functionality (landing, checkout, training, generation)
2. **Phase 2**: Enhanced Sandra AI chat and gallery features
3. **Phase 3**: Advanced templates and business expansion

This blueprint ensures zero conflicts, clean architecture, and immediate revenue generation capability.