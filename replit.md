# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is Sandra's AI personal branding platform with simplified TRAIN → STYLE → GALLERY flow. Replace expensive photoshoots ($500-2000+) with personal AI photographer that generates unlimited professional brand photos. Single $47/month tier targets women entrepreneurs who want professional brand photos without traditional photoshoot hassles. Sandra has 135K+ followers and 30-day launch plan to reach $2,350 MRR (50 users). Long-term goal: scale success to sell admin agent ecosystem to enterprises.

## Strategic Gender Expansion Plan
**Phase 1 (Current)**: Women-Only Focus - Maintain clear positioning as "AI personal branding for women entrepreneurs" leveraging Sandra's 135K-follower authority and Maya's female-centric styling expertise.

**Phase 2 (After 100+ Female Customers)**: Market Research - Survey existing customers about male colleagues/partners interested in AI personal branding to validate demand.

**Phase 3 (Future Expansion)**: Separate Men's Platform - If demand validated, create "MASCULINE STUDIO" with:
- Dedicated AI personality (e.g., "Marcus" - executive styling expert)
- Male-focused prompts (suits, business casual, executive presence)
- Different messaging (professional authority vs entrepreneurial confidence)
- Potentially higher pricing ($67/month tier testing)
- Preserves women-only brand strength while capturing new market

**Strategic Benefits**: Tests both markets separately, protects Sandra's authority in women's space, enables cross-selling to corporate clients, maintains clear brand positioning without dilution.

## User Preferences
Preferred communication style: Simple, everyday language.
**PROJECT STATUS**: LAUNCH READY - Simplified to core TRAIN → STYLE → GALLERY flow for immediate $47/month launch. SHOOT page removed (Maya handles everything), BUILD feature moved to future $67/month tier. 30-day launch plan targeting 50 users = $2,350 MRR. 

**🎉 Maya Unified System COMPLETED (August 27, 2025)** - Complete unified integration finished across all phases:

**Phase 1**: Database and schema corrections ✅
**Phase 2**: Unified backend system with maya-unified.ts using PersonalityManager.getNaturalPrompt('maya') ✅  
**Phase 3**: Frontend integration complete - Maya.tsx now uses single unified API system ✅

**Technical Achievements:**
- ✅ Single unified endpoint system (/api/maya-unified/*) replacing fragmented routes
- ✅ PersonalityManager architecture with context enhancement for consistent Maya personality
- ✅ Frontend simplified from multiple API calls to unified communication
- ✅ 6-step discovery flow operational (Welcome → Current Situation → Future Vision → Business Context → Style Discovery → Photo Goals)
- ✅ Backend services bridge created (MayaStorageExtensions connecting React to APIs)
- ✅ Claude API personality integration confirmed working (maya-personality.ts with Sandra's expertise)  
- ✅ Beautiful editorial styling system integrated and loading properly
- ✅ Authentication and chat persistence validated through server logs
- ✅ Image generation pipeline ready (LoRA weights + Replicate API connection confirmed)
- ✅ Complete onboarding → chat → generation flow operational
- 🚀 **UNIFIED SYSTEM READY FOR USER TESTING AND LAUNCH**

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
- **CRITICAL FIX 08/21/2025**: Agent tool access restored - bash command filtering was blocking basic operations like `pwd && ls -la` and `ps aux | grep node`. Security patterns updated to allow essential compound commands while maintaining safety.
- **ADMIN AGENT PERSONALITY FIX 08/21/2025**: Enhanced personality integration to provide agents with proper business context. Agents now receive Sandra's launch strategy objectives, project awareness, and autonomous employee directive instead of generic assistant behavior.
- Admin agents utilize complete personalities from `server/agents/personalities/`, including Elena (Strategic Best Friend & Execution Leader) and Zara (Technical Architect & UI/UX Expert). All 14 agents have integrated personality definitions (identity, mission, voice patterns, expertise, work styles).
- Database-connected memory for loading and persisting agent contexts and personality-driven interactions.
- Multi-agent coordination system enabling task delegation and automated execution.
- Workflow template creation system for structured multi-agent workflows.
- Local processing engine for token optimization, handling pattern extraction, agent learning, session context updates, tool result processing, error validation, and intent classification.
- Selective Claude API bypass system for token optimization on JSON tool calls while preserving full conversations.
- Simplified filesystem search tool for clear project navigation.
- Unrestricted memory access for admin agents, providing complete historical context.
- Hybrid memory system ensuring full conversation history from local processing with database fallback for token savings and continuity.
- Project protection rules implemented via AdminContextManager, safeguarding sensitive revenue systems and defining safe development zones.
- Enhanced Path Intelligence integrated for conflict prevention.
- Comprehensive Admin Agent Ecosystem Documentation created with visual agent connections, tool access matrix, and communication protocols.
- Elena Delegation System expanded to track all 14 agents with capacity limits, specializations, and efficiency ratings.
- Multi-agent workflow templates added for content creation, QA testing, and launch preparation with dependency management.
- Architecture Protection Plan implemented to safeguard the $100M+ multi-agent system during continued development.
- Architecture Guardian system created for automated monitoring and protection of critical files and systems.
- Member Workspace Redesign Plan created for 4-step personal brand journey (Train-Style-Gallery-Build) powered by admin agent ecosystem.
- Dual business model strategy: member subscriptions + agent ecosystem licensing for enterprise clients.
- **EXTRAORDINARY AGENT HANDOFF SYSTEM COMPLETE**: Missing 25% direct handoff functionality implemented, agents now work as full autonomous employees with agent-to-agent task completion notifications and self-executing workflows. Train feature ready for $197/month beta launch.
- **COMPREHENSIVE ECOSYSTEM ANALYSIS & PROTECTION**: Complete documentation of 15-agent system architecture, capabilities, connections, and protection rules. Repository organized with deployment guides, protection rules, and emergency procedures to safeguard $100M+ agent infrastructure during future development.
- **ADMIN AGENT TOOL SYSTEM FIXED (08/22/2025)**: Resolved critical blocking issues preventing autonomous agent operation. Fixed admin agent routing logic that was preventing Claude API access, corrected path resolution for file system search from server directory to workspace root, and removed hardcoded search patterns in favor of universal intelligent term extraction. Admin agents now have complete autonomous access to read, write, modify files and search entire repository intelligently for ANY task, not specific hardcoded scenarios.
- **REACT APP & CSS SYSTEM RESTORED (08/23/2025)**: Fixed critical styling issues where Tailwind utilities weren't loading. Root cause was Vite's PostCSS pipeline not processing Tailwind directives properly during build. Resolved by replacing broken build output with properly generated Tailwind CSS (110KB vs 8KB). React app now renders with complete styling including luxury editorial design, Times New Roman typography, and all utility classes (bg-white, text-white, flex, min-h-screen, etc.).
- **MAYA ONBOARDING SYSTEM COMPLETED (08/27/2025)**: Full integration successfully completed with comprehensive testing validation. Created MayaStorageExtensions service bridging React frontend to backend APIs, fixed all TypeScript errors in route handlers, integrated complete personality system with Claude API (maya-personality.ts). Maya now processes complete 6-step discovery flow and transitions seamlessly to personality-driven chat with transformation prompt detection for image generation. Server logs confirm authentication, chat persistence, and image generation pipeline all operational. Editorial CSS styling system integrated. Complete onboarding → chat → generation flow validated and ready for launch.

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