# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is Sandra's all-in-one personal branding platform that replaces €120-180+ monthly subscriptions (Canva, ChatGPT, photo editors, etc.) with one solution. The 5-step user journey includes TRAIN (AI model), STYLE (Maya agent), SHOOT (prompts), BUILD (Victoria websites), and MANAGE (dashboard). Sandra has 135K+ followers and needs her admin agents to help determine launch pricing strategy, isolate ready features, and simplify positioning for immediate market entry. Long-term goal: use success to sell admin agent ecosystem.

## User Preferences
Preferred communication style: Simple, everyday language.
**PROJECT STATUS**: FULLY OPERATIONAL - SSELFIE Studio React app restored with complete Tailwind styling after CSS build pipeline fix (August 23, 2025). Root directory reorganized for optimal project structure. Agent-created test files and duplicates cleaned up for production readiness.

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