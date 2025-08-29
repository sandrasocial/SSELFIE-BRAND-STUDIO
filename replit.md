# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is Sandra's AI personal branding platform designed to simplify personal branding by generating unlimited professional brand photos using AI, replacing traditional photoshoots. It operates with a core TRAIN → STYLE → GALLERY workflow. The platform targets women entrepreneurs with a $47/month subscription, aiming for an initial launch MRR of $2,350 by leveraging an existing large follower base. The long-term vision includes scaling this success and potentially selling the underlying admin agent ecosystem to enterprises, with strategic plans for future market expansion while maintaining the core brand identity.

## User Preferences
Preferred communication style: Simple, everyday language.
UI Preferences: Keep technical controls hidden - users prefer Maya to handle technical details automatically rather than exposing preset/seed parameters.
PROJECT STATUS: LAUNCH READY - Simplified to core TRAIN → STYLE → GALLERY flow for immediate €47/month launch. Maya authentication cleaned for production - development access removed for professional launch experience.

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
- **API Design**: RESTful endpoints with agent-specific routing, unified `/api/maya/*` endpoint for consistent Maya personality via `PersonalityManager`.
- **Authentication**: Express sessions with role-based access control.
- **File Operations**: Direct tool access for admin agents.
- **Agent System**: Specialized AI agents with autonomous capabilities, including Elena (Strategic Best Friend) and Zara (Technical Architect), integrated with database-connected memory for context persistence.

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
- Multi-agent coordination system with task delegation, automated execution, and workflow templates.
- Local processing engine for token optimization, handling pattern extraction, session context updates, and intent classification.
- Selective Claude API bypass for token optimization on JSON tool calls while preserving full conversations.
- Project protection rules via `AdminContextManager` safeguard sensitive revenue systems and define safe development zones.
- Enhanced Path Intelligence prevents conflicts.
- An "Extraordinary Agent Handoff System" enables autonomous agent-to-agent task completion.
- A "Comprehensive Ecosystem Analysis & Protection" framework documents the multi-agent system's architecture, capabilities, and protection rules.
- The Maya system provides a 6-step discovery flow (Welcome → Current Situation → Future Vision → Business Context → Style Discovery → Photo Goals) and seamlessly transitions to personality-driven chat and image generation. Intelligent Quick Actions generate contextual suggestions, replacing generic templated buttons. A Welcome page offers "CUSTOMIZE" (guided onboarding) or "QUICK START" (immediate photo generation) options.
- Category-aware styling system ensures Maya's AI adapts presets based on detected categories from user requests (e.g., Business, Lifestyle, Travel).
- **Creative Freedom Liberation (August 29, 2025)**: Identified and removed the critical hardcoded "REQUIRED STRUCTURE" template in createDetailedPromptFromConcept function that was forcing Maya into rigid formatting patterns and overriding her AI creativity. Replaced constraining numbered structure (1. STYLING INTELLIGENCE, 2. POSE & EXPRESSION, etc.) with natural creative freedom instructions that let Maya express her full personality and expertise without rigid templates. This allows Maya to generate unique, unexpected styling combinations instead of repetitive, boring outfits.
- **Anatomy Intelligence Liberation (August 29, 2025)**: Removed forceful anatomy keyword injection that was contaminating Maya's creative prompts. Replaced rigid "perfect hands, well-defined fingers" requirements with natural pose guidance, allowing Maya's styling intelligence to choose appropriate gestures and positioning organically within her creative vision. This prevents anatomy keywords from overwhelming styling descriptions and allows Maya to generate complete fashion concepts instead of hand-focused images.
- **Conversational Contamination Fix (August 29, 2025)**: Fixed critical issue where Maya's conversational responses ("Oh honey, I'm getting MAJOR elevated energy...") were being included in Replicate prompts, contaminating image generation. Completely redesigned cleanMayaPrompt function to use minimal cleaning that preserves Maya's complete creative styling content while removing only obvious conversation markers. Eliminated aggressive prompt stripping that was removing Maya's creative fashion descriptions. This ensures Maya's styling intelligence flows through to image generation while removing chat formatting.
- **Portrait Hardcoding Liberation (August 29, 2025)**: Identified and removed the critical hardcoded portrait restrictions that were forcing Maya to only generate close-up portraits. Completely rewrote the shot type detection logic to prioritize full-body and dynamic shots over static portraits. Updated Maya's creative instructions to explicitly grant her freedom to choose between full-body, half-body, and close-up shots based on the concept. Enhanced prompt extraction patterns to recognize environmental, pose, and lifestyle terminology. Changed the default shot type from "halfBodyShot" to "fullScenery" to encourage dynamic, interesting compositions. Maya now has complete creative freedom to generate the shot type that best serves each concept.

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