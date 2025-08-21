# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is a premium AI-powered personal branding platform that transforms selfies into professional brand photography. Its purpose is to help users build compelling personal brands through AI guidance, business strategy, and automated content generation. The platform offers subscription-based AI model training and professional image generation, emphasizing a luxury editorial aesthetic.

## Recent Changes (August 21, 2025)
**REPOSITORY REORGANIZATION COMPLETED**: Fixed completely scattered file structure that was preventing agent comprehension:

- **Root Directory Cleaned**: Reduced from 106 scattered files to organized structure with only 25 essential items
- **Logical Organization**: Created `/config/`, `/deployment/`, `/scripts/`, `/docs/`, `/temp/` directories
- **Agent-Friendly Structure**: Added README.md and PROJECT_GUIDE.md for immediate agent orientation
- **Protected Core Systems**: Maya's revenue systems remain untouched and operational
- **Clear Separation**: Config files, deployment docs, and temp files now properly organized
- **Navigation Guides**: Multiple entry points (README, PROJECT_GUIDE, replit.md) for different agent needs

**Result**: Any agent can now quickly understand project structure and locate files without confusion. Repository went from chaotic mess to professional organization while keeping all systems operational.

## Previous Changes
**OPTIMIZED GENERATION PARAMETERS DEPLOYED**: Fixed quality differences between models by implementing Shannon's proven optimal parameters for ALL users:

- **Quality Root Cause Found**: Issue was generation parameters, not training or deployment methods
- **Optimized Parameters Applied**: All users now use lora_scale 0.9, guidance_scale 5, num_inference_steps 50, aspect_ratio 4:5, output_quality 95, prompt_strength 0.8, extra_lora_scale 1, megapixels 1
- **Universal Quality**: Both Maya chat and AI photoshoot now generate with consistent high quality
- **Proven Results**: Based on Shannon's model comparison showing superior image quality with these parameters
- **Applied Everywhere**: UnifiedGenerationService and test endpoints updated with identical optimal settings

**Previous - MAYA CHAT SYSTEM FIXED**: Resolved critical issues with Maya's member behavior and prompt generation:

- **Fixed Prompt Exposure**: Maya no longer exposes technical photography terms in chat conversations
- **Separated Conversation vs Generation**: Natural warm conversation tone separate from poetic generation prompts
- **Hidden Prompt System**: Maya now provides exactly 2 poetic prompts in hidden ```prompt``` blocks
- **Perfect Anatomy Integration**: Anatomy fixes (hands/feet) automatically added by generation system
- **Poetic Generation Only**: Technical terms only used in hidden generation prompts, not conversation
- **Proper Format Enforcement**: System encourages Maya to use correct format instead of fallback conversions

**Previous - TRAINING SYSTEM FULLY OPERATIONAL**: Fixed critical training validation errors that were preventing AI model creation:

- **Fixed Destination Field Error**: Replicate API was rejecting training requests due to missing `destination` field - now properly included
- **Archiver Package**: Installed missing archiver dependency that was causing ZIP creation failures 
- **S3 Upload Logic**: Corrected image upload validation sequence to prevent upload errors
- **Shannon's Parameters**: Training uses proven successful parameters (1000 steps, 4e-4 learning rate, rank 32, user{userId} trigger)
- **Bulletproof Validation**: Multi-gate validation ensures quality training with 10+ images minimum

**Previous - CRITICAL MIGRATION SYSTEM DEPLOYED**: Fixed the critical issue where generated images were using temporary Replicate URLs that expire after 1 hour, causing image loss in Maya chat and AI photoshoot features. Implemented comprehensive automatic migration system:

- **Fixed Migration Infrastructure**: Enhanced `ImageStorageService.ensurePermanentStorage()` with retry logic, validation, and robust error handling
- **Deployed MigrationMonitor**: Background service that scans every 5 minutes for temp URLs and automatically migrates them to permanent S3 storage
- **Enhanced Generation Pipeline**: `UnifiedGenerationService.checkAndUpdateStatus()` now properly calls migration during completion
- **Emergency Migration**: Manually migrated 2 recent temp URLs (IDs 617, 618) to prevent immediate image loss
- **AWS SDK Integration**: Installed and configured `@aws-sdk/client-s3` and `@aws-sdk/lib-storage` for robust S3 operations

**Result**: All future image generations will automatically get permanent S3 URLs instead of temporary Replicate URLs, preventing image loss and ensuring Maya chat and AI photoshoot images remain accessible permanently.

**Previous Work - Data Consolidation Completed**: Fixed critical data consistency issues by consolidating image storage to `ai_images` as the primary table, ensuring upload tracking matches training records, and aligning generation success tracking. Migrated 76 completed generation records from `generation_trackers` to `ai_images` and created upload tracking for existing trained models.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **Routing**: Wouter
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS, luxury brand color palette (editorial blacks, signature golds, premium grays), Times New Roman typography.
- **State Management**: TanStack Query for server state, custom hooks for local state.
- **PWA Support**: Progressive Web App features for mobile optimization.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with agent-specific routing.
- **Authentication**: Express sessions with role-based access control.
- **File Operations**: Direct tool access for admin agents.
- **Agent System**: Specialized AI agents with autonomous capabilities.

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
- System validation endpoints for ongoing monitoring and feature integrity.
- Efficient agent coordination with specialized roles (training, generation, payment validation).
- Strict CSS editing guidelines for application stability.
- Real-time agent protocol validation to prevent duplicate work.
- **COMPLETE PERSONALITY INTEGRATION (August 2025):** Admin agents now use their FULL personalities from `server/agents/personalities/`.
- **Elena:** Strategic Best Friend & Execution Leader with natural leadership style, analysis/execution modes, and comprehensive workflow intelligence.
- **Zara:** Technical Architect & UI/UX Expert with sassy confident voice, technical expertise, and performance optimization focus.
- **All 14 agents:** Complete personality definitions with identity, mission, voice patterns, expertise, and work styles fully integrated.
- **Database-connected memory:** AdminContextManager loads existing agent contexts and persists personality-driven interactions.
- **Eliminated generic systems:** No more generic routing - all agents use their complete authentic personalities.
- Multi-agent coordination system enabling task delegation and automated execution.
- Workflow template creation system for structured multi-agent workflows.
- Local processing engine for token optimization, handling pattern extraction, agent learning, session context updates, tool result processing, error validation, and intent classification.
- Selective Claude API bypass system for token optimization on JSON tool calls while preserving full conversations.
- Simplified filesystem search tool for clear project navigation.
- Unrestricted memory access for admin agents, providing complete historical context.
- Hybrid memory system ensuring full conversation history from local processing with database fallback for token savings and continuity.

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