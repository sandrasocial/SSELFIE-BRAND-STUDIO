# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is a premium AI-powered personal branding platform that transforms selfies into professional brand photography. Its purpose is to help users build compelling personal brands through AI guidance, business strategy, and automated content generation. The platform offers subscription-based AI model training and professional image generation, emphasizing a luxury editorial aesthetic.

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

## Recent System Updates (August 13, 2025)
- **Phase 5 Mass Cleanup Completed:** Successfully removed 70+ competing agent infrastructure files while preserving protected consulting agents system integrity
- **Database Schema Unified:** Resolved critical conflicts between agentConversations and claudeConversations tables, implementing single conversation management system  
- **Authentication Consolidated:** Eliminated duplicate authentication systems, unified admin auth approach
- **Memory System Conflicts Eliminated:** Removed competing conversation managers and memory systems, maintaining single coherent system
- **System Audit Complete:** Final verification confirms protected consulting agents fully operational with all personality integrations intact

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