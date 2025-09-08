# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is an AI personal branding platform that generates professional brand photos using AI, replacing traditional photoshoots. The core workflow is TRAIN → STYLE → GALLERY. It targets women entrepreneurs with a subscription model, aiming for significant recurring revenue. The long-term vision includes scaling the platform and potentially selling the underlying admin agent ecosystem to enterprises, with strategic plans for future market expansion while maintaining brand identity.

## User Preferences
Preferred communication style: Simple, everyday language.
UI Preferences: Keep technical controls hidden - users prefer Maya to handle technical details automatically rather than exposing preset/seed parameters.
PROJECT STATUS: LAUNCH READY - Simplified to core TRAIN → STYLE → GALLERY flow for immediate €47/month launch. Maya authentication cleaned for production - development access removed for professional launch experience.

## Training System Access
**CRITICAL**: Training system requires proper authentication
- Users must be logged in via `/api/login` to access training endpoints
- Paid plans required: 'pro', 'full-access', 'sselfie-studio' (studio plan recommended)
- Test user Erla (erlafgunnars@gmail.com) upgraded to studio plan with 500 monthly generations
- Authentication validates via session cookies and isAuthenticated middleware

## Subscription System Status (September 1, 2025)
**PHASE 1 COMPLETED**: Database standardization complete
- All users standardized to single 'sselfie-studio' plan (€47/month, 100 images)
- Admin accounts: 3 users with unlimited generations (-1)
- Regular users: 8 users with 100 monthly generations
- Schema updated to reflect new single-tier system
- Database schema comments cleaned up for clarity

**PHASE 2 COMPLETED**: Pricing configuration consistency achieved
- Simplified usage-service.ts to only 'sselfie-studio' (€47, 100 images) and admin plans
- Updated checkout.ts to default to 'sselfie-studio' plan only
- Verified simple-checkout.tsx shows consistent €47/month pricing
- Removed all conflicting legacy plans (basic, pro, studio-founding, etc.)
- Single pricing tier maintained across all systems

**PHASE 3 COMPLETED**: Training access alignment fixed
- Updated all 3 training access checks in routes.ts from ['pro', 'full-access', 'sselfie-studio'] to ['sselfie-studio']
- Training system now only requires 'sselfie-studio' plan for access
- All existing users with 'sselfie-studio' plan can access training

**PHASE 4 COMPLETED**: Checkout flow verification complete
- All checkout paths lead to 'sselfie-studio' plan
- Test payment redirects to '/payment-success?plan=sselfie-studio'
- New users automatically get 100 monthly generations
- Single consistent checkout experience

## Recent Critical Update (September 1, 2025)
**MAYA PURE INTELLIGENCE LIBERATION COMPLETE**: Successfully removed all hardcoded fashion and location prompts that were overriding Maya's full styling intelligence. Eliminated restrictive styling approaches and prompt guidance from all 19 categories in maya-personality.ts, allowing Maya to access her complete fashion expertise without limitations. 

**FLUX PARAMETERS CONSOLIDATION COMPLETE**: Removed hardcoded FLUX parameter detection logic in model-training-service.ts and consolidated to use Maya's personality as the single source of truth. Maya's fluxOptimization settings now control all image generation parameters (guidance_scale, num_inference_steps, lora_weight) ensuring consistent, intelligent optimization across all shot types.

**PROMPT DUPLICATION ELIMINATION COMPLETE**: Eliminated redundant createDetailedPromptFromConcept calls when Maya has already provided intelligent embedded prompts. System now uses single API call path for Maya-generated concept cards while only falling back to dual API calls when necessary, optimizing performance and preserving Maya's pure intelligence.

**HARDCODE ELIMINATION COMPLETE (September 8, 2025)**: Successfully removed ALL hardcoded styling overrides that were constraining Maya's natural intelligence:
- ✅ Removed hardcoded category detection (business/professional keyword forcing)
- ✅ Removed concept validation restrictions (styling keyword requirements) 
- ✅ Removed shot type overrides (forced framing decisions)
- ✅ Removed rigid emoji interpretation constraints
- ✅ Maya's personality-driven intelligence now flows freely without artificial constraints

**PREVIOUS UPDATE (August 31, 2025)**: Maya's prompt generation system upgraded with comprehensive FLUX optimization knowledge including natural language examples, anti-pattern guidance, and shot-specific technical intelligence.

**ENHANCED FEATURES**:
- Natural language prompt examples for close-up, half-body, and full scene shots
- Anti-pattern guidance to avoid common FLUX mistakes (tag soup, negative prompts, generic terms)
- Success patterns emphasizing natural flow, positive phrasing, specific camera specs
- Shot type intelligence automatically selecting optimal camera settings based on styling approach
- Category-aware shot type hints for business, lifestyle, travel, and Instagram concepts

**BREAKTHROUGH SOLUTION**: Rather than building complex parsing systems that strip Maya's intelligence, we trained Maya to naturally format her responses in a way the system can use. Maya now generates 3-5 concept card variations with embedded FLUX prompts while retaining 100% of her styling intelligence. This eliminates the concept parsing interference while maintaining full functionality.

**CRITICAL PIPELINE CLEANUP (August 31, 2025)**: Resolved hardcoded conflicts in Maya's detection system that were overriding her styling intelligence. Fixed duplicate FLUX examples in personality config and eliminated 85mm/portrait detection conflicts that incorrectly categorized half-body shots as close-ups. Maya's Pure Intelligence now flows seamlessly from concept creation through technical execution without hardcoded interference.

**GENERIC FUNCTION STRIPPING ELIMINATION (August 31, 2025)**: Identified and fixed all generic functions that were stripping Maya's prompting intelligence. Fixed formatPrompt, processMayaResponse, and trigger word handling functions to preserve Maya's complete styling expertise while maintaining technical functionality. Maya's embedded FLUX prompts now flow intact from conversation to generation while preserving complete styling intelligence in chat responses.

## System Architecture

### Maya AI Core System
- **Maya Intelligence**: Consolidated personality system with FLUX optimization mastery in `server/agents/personalities/personality-config.ts`
- **Single API Call Architecture**: Unified concept generation and FLUX-optimized prompt creation via `/api/maya/*` endpoints
- **Pure Intelligence Preservation**: Maya's styling expertise drives all technical decisions without generic system overrides
- **Shot Type Intelligence**: Automatic detection and optimization for close-up portraits (4:5), half-body shots (3:4), and full scenes (3:2)
- **Context Memory**: Complete conversation and styling preference preservation across sessions

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter.
- **UI Framework**: Radix UI components with shadcn/ui design system.
- **Styling**: Tailwind CSS, luxury brand color palette (editorial blacks, signature golds, premium grays), Times New Roman typography.
- **State Management**: TanStack Query for server state, custom hooks for local state.
- **Maya Integration**: Specialized hooks (`useMayaGeneration.ts`) for concept card management and generation pipeline.
- **PWA Support**: Progressive Web App features for mobile optimization.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints with agent-specific routing, unified `/api/maya/*` endpoint for consistent Maya personality via `PersonalityManager`.
- **Maya Pipeline**: Complete image generation system with FLUX optimization in `server/model-training-service.ts`
- **Authentication**: Express sessions with role-based access control.
- **File Operations**: Direct tool access for admin agents.
- **Agent System**: Specialized AI agents (Elena, Zara) with autonomous capabilities and database-connected memory for context persistence.

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
- Conversational elements from Maya's responses are systematically removed from image generation prompts to prevent contamination and ensure clean, focused inputs for AI models.
- The system ensures consistency between Maya's original styling context and generated images, preserving creative vision.
- Improvements to gallery saving and historical concept card display ensure proper functionality and user experience.
- Editorial style audit and upgrades enhance the Maya page's UI/UX, aligning it with brand guidelines.
- Maya's styling intelligence is directly connected to image generation through a pipeline optimization, using 19 categories and 5 styling approaches each, ensuring unique and professional outputs.
- A multi-layered prompt flow cleanup eliminates formatting interruptions and ensures natural, flowing FLUX prompts.
- FLUX parameters are optimized for close-up portrait realism while maintaining quality for half-body and full scenery shots, with updated guidance scales and steps.

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