# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is Sandra's AI personal branding platform designed to simplify personal branding by generating unlimited professional brand photos using AI, replacing traditional photoshoots. It operates with a core TRAIN → STYLE → GALLERY workflow. The platform targets women entrepreneurs with a $47/month subscription, aiming for an initial launch MRR of $2,350 by leveraging an existing large follower base. The long-term vision includes scaling this success and potentially selling the underlying admin agent ecosystem to enterprises, with strategic plans for future market expansion while maintaining the core brand identity.

## User Preferences
Preferred communication style: Simple, everyday language.
UI Preferences: Keep technical controls hidden - users prefer Maya to handle technical details automatically rather than exposing preset/seed parameters.
PROJECT STATUS: LAUNCH READY - Simplified to core TRAIN → STYLE → GALLERY flow for immediate €47/month launch. Maya authentication cleaned for production - development access removed for professional launch experience.

## Recent Changes (August 29, 2025)
**Maya Intelligence System Optimization Complete:**
- **Phase 1**: Context preservation with originalContext field eliminates description-prompt inconsistencies
- **Phase 2**: Unified context system with AI-first categorization respects Maya's intelligent styling decisions  
- **Phase 3**: Performance optimization with lazy generation and memory caching reduces Claude API calls by ~50%
- **System Cleanup**: Legacy code removal and production optimization completed
- **Hardcode Elimination**: Complete audit identified and removed 25+ hardcoded fashion items (camel coat, blazer, silk camisole, cashmere, structured bag, etc.) that were overriding Maya's styling intelligence
- **Gallery Duplicate Fix**: Resolved critical issue where ALL generated images appeared in gallery instead of only user-hearted images. Fixed `/api/gallery-images` endpoint to filter for explicitly saved images only.
- **FLUX Prompt Quality Fix**: Fixed critical image quality issue caused by prompt contamination. Maya's conversational formatting (**, -, headers) was being sent to FLUX instead of clean technical prompts. Implemented intelligent prompt extraction that preserves Maya's complete styling expertise while ensuring FLUX receives clean descriptive text. NO hardcoding added - Maya's AI intelligence drives all styling decisions.
- **Maya Onboarding Simplification Phase 1**: Completed database schema simplification from 23+ complex fields to 7 core fields that actually matter. Safely migrated all existing data while preserving Maya's complete conversation intelligence (maya_chat_messages, maya_chats, maya_personal_memory tables remain 100% intact). Reduced user_personal_brand to essential fields: transformationStory, currentSituation, futureVision, businessGoals, businessType, stylePreferences, photoGoals.
- **Maya Onboarding Simplification Phase 2**: Removed legacy components and duplicate tables. Dropped onboarding_data and user_style_profile tables (data safely migrated in Phase 1). Deleted complex onboarding frontend components (onboarding.tsx, brand-onboarding.tsx). Cleaned up routing and server functions while preserving Maya's complete conversation intelligence. Architecture now simplified with single user_personal_brand table and direct workspace routing.
- **Maya Onboarding Simplification Phase 3**: Created beautiful profile questionnaire in Maya's voice and style. Replaced technical onboarding forms with 7 conversational questions that feel like coffee with your best friend. Interactive suggestion buttons make it easy for users to get started, with full customization options. Beautiful SSELFIE luxury aesthetic with editorial typography and responsive design. Users can now complete their profile through Maya's warm, encouraging conversation rather than intimidating forms.
- **Maya Name Field Enhancement**: Added personalization capability by including a name field as the first question in Maya's profile questionnaire. Maya can now address users personally by their preferred name throughout all conversations, making interactions feel warm, personal, and genuine. Seamlessly integrated with existing 8-question flow and Maya's conversation intelligence system.
- **Maya FLUX 1.1 Pro Optimization (August 29, 2025)**: Enhanced Maya's prompting system with research-backed improvements for optimal image generation:
  - **Phase 1**: Updated promptGuidance arrays with professional camera specifications (Canon EOS R5, Sony A7R V), enhanced quality tags including "visible skin pores", "subsurface scattering", "DSLR quality", and physical feature description templates
  - **Phase 2**: Optimized unified route with FLUX 1.1 Pro optimal prompt structure (50-150 words target), enhanced prompt cleaning to remove Maya self-references while preserving styling intelligence, and improved technical instructions with specific camera settings for different shot types  
  - **Phase 3**: Integrated comprehensive validation system with prompt length validation, trigger word consistency checks, and technical quality verification. Added generation-validator.ts with intelligent prompt cleaning and validation functions specifically tuned for Maya's conversation-to-technical conversion.
- **Result**: Perfect consistency between Maya's concept descriptions and generated prompts with blazing performance. Maya now exercises full creative authority with research-optimized FLUX prompting, and the correct user journey is restored: Maya chat stores ALL images permanently, SSELFIE gallery only shows user-hearted favorites. FLUX now receives clean technical prompts while preserving Maya's styling intelligence. Database is now simplified for clean 7-field profile questionnaire while maintaining Maya's complete conversational AI capabilities.

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