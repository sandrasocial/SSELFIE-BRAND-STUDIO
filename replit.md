# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is an AI personal brand photo platform designed to simplify the creation of professional-grade personal brand photos. Its core purpose is to provide AI-powered photos that help users stand out instantly. The platform offers a streamlined 3-step journey: TRAIN (AI model), STYLE (AI consultation), and GALLERY (unlimited photo generation). The primary business vision is to focus on a single, high-value offering (€47/month) targeting a large follower base, emphasizing revenue generation through professional AI photos before expanding features.

## User Preferences
Preferred communication style: Simple, everyday language like talking to your best friend over coffee. Warm, simple and understandable. No jargon, no corporate speak, no fancy language - just natural conversation like best friends would have.

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
- System validation endpoints for monitoring and feature integrity.
- Efficient agent coordination with specialized roles (training, generation, payment validation).
- Strict CSS editing guidelines for application stability.
- Real-time agent protocol validation to prevent duplicate work.
- Enhanced personality integration for agents, ensuring authentic voice patterns and specialization boundary enforcement.
- Database-connected memory for loading and persisting agent contexts and personality-driven interactions.
- Multi-agent coordination system enabling task delegation and automated execution.
- Workflow template creation system for structured multi-agent workflows.
- Local processing engine for token optimization, handling pattern extraction, agent learning, session context updates, tool result processing, error validation, and intent classification.
- Selective Claude API bypass system for token optimization on JSON tool calls while preserving full conversations.
- Simplified filesystem search tool for clear project navigation.
- Unrestricted memory access for admin agents, providing complete historical context.
- Hybrid memory system ensuring full conversation history from local processing with database fallback.
- Project protection rules implemented via AdminContextManager, safeguarding sensitive revenue systems and defining safe development zones.
- Enhanced Path Intelligence integrated for conflict prevention.
- Comprehensive Admin Agent Ecosystem Documentation with visual agent connections, tool access matrix, and communication protocols.
- Elena Delegation System expanded to track all agents with capacity limits, specializations, and efficiency ratings.
- Multi-agent workflow templates added for content creation, QA testing, and launch preparation with dependency management.
- Architecture Protection Plan implemented to safeguard the multi-agent system.
- Architecture Guardian system created for automated monitoring and protection of critical files and systems.
- Member Workspace Redesign Plan for a 4-step personal brand journey (Train-Style-Gallery-Build) powered by the admin agent ecosystem.
- Dual business model strategy: member subscriptions + agent ecosystem licensing for enterprise clients.
- Extraordinary Agent Handoff System enabling autonomous, agent-to-agent task completion notifications and self-executing workflows.
- Root directory optimization to maintain a professional project structure.
- Resolved critical agent infrastructure issues for specialized execution rather than coordination chaos.
- Comprehensive ecosystem analysis and protection for the 15-agent system.
- Admin agent tool system fixed for autonomous operations including file system access and API calls.
- Universal authentication system implemented for all admin tools, providing authenticated user context.
- Intelligent task delegation system fixed, connecting the coordinate_agent tool to ElenaDelegationSystem for optimal agent selection based on specialties, workload, and efficiency.

## External Dependencies

### AI and Image Generation Services
- **Anthropic Claude API**: AI conversation and reasoning engine.
- **Replicate API**: FLUX 1.1 Pro models for high-quality image generation.

### Cloud Infrastructure
- **AWS S3**: Training image storage and user upload management.
- **Neon Database**: Serverless PostgreSQL hosting.
- **Vercel**: Production deployment and hosting.

### Communication Services
- **SendGrid**: Transactional email delivery.
- **Resend**: Alternative email service.

### Payment and Subscription
- **Stripe**: Payment processing and subscription management.

### Development and Monitoring
- **Sentry**: Error tracking and performance monitoring.