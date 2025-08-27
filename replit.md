# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is Sandra's AI personal branding platform, simplifying personal branding with a TRAIN → STYLE → GALLERY flow. It aims to replace expensive photoshoots by generating unlimited professional brand photos using AI. The platform targets women entrepreneurs with a single $47/month subscription, leveraging Sandra's 135K+ follower base for an initial launch goal of $2,350 MRR. Long-term, the vision is to scale this success to sell the underlying admin agent ecosystem to enterprises. A strategic plan is in place for potential future gender expansion (e.g., "MASCULINE STUDIO") while preserving the core "women-only" brand strength.

## User Preferences
Preferred communication style: Simple, everyday language.
PROJECT STATUS: LAUNCH READY - Simplified to core TRAIN → STYLE → GALLERY flow for immediate €47/month launch. SHOOT page removed (Maya handles everything), BUILD feature moved to future €67/month tier. 30-day launch plan targeting 50 users = €2,350 MRR.

## Recent Analysis & Documentation
**Maya System Complete Restoration (January 27, 2025)**:
- Phase 1: Maya's intelligent generation system fully restored (85% → 100% operational)
- Phase 2: Frontend-backend integration connected with 3-second polling system
- Phase 3: Complete system validation with all endpoints operational
- Phase 4: Gallery integration completed - users can save Maya's generated images
- Complete TRAIN → STYLE → GALLERY flow with Maya's personality-driven AI generation
- Production-ready system with comprehensive error handling and user experience optimization

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter.
- **UI Framework**: Radix UI components with shadcn/ui design system.
- **Styling**: Tailwind CSS, luxury brand color palette (editorial blacks, signature golds, premium grays), Times New Roman typography.
- **State Management**: TanStack Query for server state, custom hooks for local state.
- **PWA Support**: Progressive Web App features for mobile optimization.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints with agent-specific routing.
- **Authentication**: Express sessions with role-based access control.
- **File Operations**: Direct tool access for admin agents.
- **Agent System**: Specialized AI agents with autonomous capabilities. A unified endpoint system (`/api/maya/*`) replaces fragmented routes, ensuring consistent Maya personality across all interactions via a `PersonalityManager`.

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM.
- **Schema Management**: Drizzle Kit for migrations.
- **File Storage**: AWS S3 for training images and user uploads.
- **Session Storage**: Express session store for user authentication.

### Authentication and Authorization Mechanisms
- **Session Management**: Express-session middleware.
- **Role-Based Access**: Admin vs. member agent separation with capability restrictions.
- **Agent Security**: Middleware enforcing tool access permissions.
- **API Protection**: Route-level authentication guards and admin token validation.

### System Design Choices
- Comprehensive separation between member revenue features and admin operational improvements.
- AI agents leverage complete personalities from `server/agents/personalities/`, including Elena (Strategic Best Friend & Execution Leader) and Zara (Technical Architect & UI/UX Expert), integrated with database-connected memory for context persistence.
- Multi-agent coordination system with task delegation, automated execution, and workflow templates.
- Local processing engine for token optimization, handling pattern extraction, agent learning, session context updates, tool result processing, error validation, and intent classification.
- Selective Claude API bypass for token optimization on JSON tool calls while preserving full conversations.
- Project protection rules via `AdminContextManager` safeguard sensitive revenue systems and define safe development zones.
- Enhanced Path Intelligence prevents conflicts.
- An "Extraordinary Agent Handoff System" enables autonomous agent-to-agent task completion.
- A "Comprehensive Ecosystem Analysis & Protection" framework documents the multi-agent system's architecture, capabilities, and protection rules.
- The Maya system provides a 6-step discovery flow (Welcome → Current Situation → Future Vision → Business Context → Style Discovery → Photo Goals) and seamlessly transitions to personality-driven chat and image generation. Intelligent Quick Actions generate contextual suggestions, replacing generic templated buttons. A Welcome page offers "CUSTOMIZE" (guided onboarding) or "QUICK START" (immediate photo generation) options.

## External Dependencies

### AI and Image Generation Services
- **Anthropic Claude API**: AI conversation and reasoning engine.
- **Replicate API**: FLUX 1.1 Pro models for high-quality image generation.
- **Custom Training**: Individual AI model training per user subscription.

### Cloud Infrastructure
- **AWS S3**: Training image storage and user upload management.
- **Neon Database**: Serverless PostgreSQL hosting.
- **Vercel**: Production deployment and hosting.
- **Replit**: Development environment and staging deployment.

### Communication Services
- **SendGrid**: Transactional email delivery.
- **Resend**: Alternative email service.

### Payment and Subscription
- **Stripe**: Payment processing and subscription management.
- **Webhook Integration**: Real-time payment status updates.

### Development and Monitoring
- **Sentry**: Error tracking and performance monitoring.
- **TypeScript**: End-to-end type safety.
- **ESBuild**: Fast production bundling.
- **PostCSS**: CSS processing.