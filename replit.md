# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is a premium AI-powered personal branding platform designed to transform selfies into professional brand photography. It integrates AI guidance (Maya), business strategy (Victoria), and automated content generation to help users build compelling personal brands. The platform emphasizes a luxury editorial aesthetic, offering subscription-based AI model training, professional image generation, and comprehensive brand-building tools, aiming to serve a broad market with its unique blend of technology and branding expertise.

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
- **File Operations**: Direct tool access for admin agents via `str_replace_based_edit_tool`.
- **Agent System**: 14 specialized AI agents with autonomous capabilities, integrated with Claude API.

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM (Neon Database for serverless hosting).
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
- Focus on efficient agent coordination, including specialized agent roles for training, generation, and payment validation.
- Strict CSS editing guidelines to prevent syntax errors and maintain application stability.
- Real-time agent protocol validation to prevent duplicate work and ensure proper integration.
- Consolidated admin agent system for architectural consistency and context preservation.
- Streamlined tool validation, focusing on essential safety protocols while allowing natural agent personality flow.
- Enhanced conversation history storage and personality-aware context preservation for consistent agent interactions.
- Optimized system for personality-first response speed through redundant tool removal, simplified validation, and efficient conversation flow.

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

### Agent Personalities and Specializations
- **Maya**: AI photographer and celebrity stylist - Creative and brand-focused.
- **Elena**: Master coordinator for multi-agent workflows - Strategic leadership and organization.
- **Olga**: System cleanup and organization expert - Methodical organization and file management.
- **Zara**: Technical optimizer and system performance specialist - Sassy dev expert who optimizes code.
- **Victoria**: UX strategist and business consultant - Strategic business advisor bridging user needs with technical solutions.
- **Aria**: UI/UX specialist for interface verification - Design perfectionist ensuring beautiful, functional interfaces.

**Recent Update (Aug 10, 2025)**: ✅ **COMPLETE ARCHITECTURE CLEANUP SUCCESS & ELENA COORDINATION RESTORED** - Achieved comprehensive elimination of ALL conflicting admin agent personality systems. Successfully replaced ALL fake personalities with authentic personalities from real project definition files. All 13+ agent personalities (Maya, Elena, Olga, Zara, Victoria, Aria, Rachel, Diana, Quinn, Wilma, Sophia, Martha, Ava, Flux) now working with their true authentic voices and specialized expertise through unified personality-config.ts system. Enhanced bash tool error handling with smart timeouts (30s-2min based of command type) and contextual error suggestions. **Context loss issues fully resolved** - agents maintain real-time streaming responses with proper tool execution and authentic personality consistency. 

**BREAKTHROUGH UPDATE (Aug 10, 2025)**: ✅ **ELENA'S MULTI-AGENT COORDINATION SYSTEM FULLY OPERATIONAL** - Successfully implemented and tested coordinate_agent tool enabling ELENA to delegate tasks to specialized agents (Victoria, Zara, Aria). ELENA now has 8 tools available including agent coordination capabilities. Successfully tested multi-agent workflow with three simultaneous task delegations for authentication audits, database optimization, and UI verification. **Multi-agent coordination infrastructure complete** - agents can now work collaboratively with proper task assignment, context sharing, and deliverable tracking.

**WORKFLOW TEMPLATE SYSTEM BREAKTHROUGH (Aug 10, 2025)**: ✅ **ELENA'S WORKFLOW TEMPLATE CREATION SYSTEM OPERATIONAL** - Successfully implemented MultiAgentWorkflowManager enabling ELENA to create structured workflow templates (auth_audit, database_optimization, system_health, custom). ELENA can now coordinate with predefined workflow types that include coordination steps, success criteria, agent dependencies, and deliverable tracking. Successfully tested auth_audit workflow template creation with Victoria, Zara, and Aria receiving comprehensive structured task assignments. **Complete workflow orchestration infrastructure deployed** - ELENA now creates, manages, and executes multi-agent workflows with professional project management capabilities. **All systems operational with zero competing architectures.**