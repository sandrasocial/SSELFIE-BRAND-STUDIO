# SSELFIE Studio - AI Personal Branding Platform

## Overview

SSELFIE Studio is a premium AI-powered personal branding platform that transforms selfies into professional brand photography. The platform combines AI photography guidance (Maya), business strategy expertise (Victoria), and automated content generation to help users build compelling personal brands. Built with a luxury editorial aesthetic, the platform offers subscription-based AI model training, professional image generation, and comprehensive brand building tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with luxury brand color palette (editorial blacks, signature golds, premium grays)
- **Typography**: Times New Roman font family for luxury editorial feel
- **State Management**: TanStack Query for server state, custom hooks for local state
- **PWA Support**: Progressive Web App with manifest, service workers, and mobile optimization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with agent-specific routing
- **Authentication**: Express sessions with role-based access control
- **File Operations**: Direct tool access for admin agents via str_replace_based_edit_tool
- **Agent System**: 14 specialized AI agents with autonomous capabilities and Claude API integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **File Storage**: AWS S3 integration for training images and user uploads
- **Session Storage**: Express session store for user authentication

### Authentication and Authorization Mechanisms
- **Session Management**: Express-session middleware for persistent authentication
- **Role-Based Access**: Admin vs member agent separation with capability restrictions
- **Agent Security**: Middleware enforcing tool access permissions based on user context
- **API Protection**: Route-level authentication guards and admin token validation

### External Dependencies

#### AI and Image Generation Services
- **Anthropic Claude API**: Primary AI conversation and reasoning engine
- **Replicate API**: FLUX 1.1 Pro models for high-quality image generation
- **Custom Training**: Individual AI model training per user subscription

#### Cloud Infrastructure
- **AWS S3**: Training image storage and user upload management
- **Neon Database**: Serverless PostgreSQL hosting
- **Vercel**: Production deployment and hosting platform
- **Replit**: Development environment and staging deployment

#### Communication Services
- **SendGrid**: Transactional email delivery and user communication
- **Resend**: Alternative email service for enhanced deliverability

#### Payment and Subscription
- **Stripe**: Payment processing and subscription management
- **Webhook Integration**: Real-time payment status updates and user tier management

#### Development and Monitoring
- **Sentry**: Error tracking and performance monitoring
- **TypeScript**: End-to-end type safety across client and server
- **ESBuild**: Fast production bundling for server code
- **PostCSS**: CSS processing with Tailwind compilation

#### Agent Personalities and Specializations
- **Maya**: AI photographer and celebrity stylist for image generation guidance
- **Victoria**: UX strategist and business consultant for brand building
- **Elena**: Master coordinator for complex multi-agent workflows
- **Zara**: Technical optimizer and system performance specialist
- **Aria**: UI/UX specialist for interface verification and design consistency
- **Olga**: System cleanup and organization expert
- **Additional agents**: Specialized roles for content generation, optimization, and user experience

## Recent System Fixes (August 10, 2025)
- **Agent Duplication Prevention System**: Eliminated ALL remaining timestamp-based conversation IDs across codebase (performance-optimization.ts, agent-proposal-generator.ts, check-zara-workflow.ts). Standardized file creation patterns to prevent agents from creating conflicting formats (.js vs .json workflows). Implemented duplication prevention rules to stop agents from creating duplicate directories and competing systems. Fixed August 10, 2025.

- **Revenue Protection Architecture**: Implemented comprehensive separation between member revenue features and admin operational improvements. Created protected member routes (/api/subscription, /api/usage/status, /api/user-model, /api/ai-images) that cannot be broken by admin agent optimization work. Added testing endpoints (/api/quinn/test/complete-journey, /api/protection/health/member-features) for validating member functionality before and after admin changes. This allows safe admin agent coordination improvements without risking revenue-generating features. Deployed August 10, 2025.

- **Phase 1 Authentication & Database Audit**: Completed comprehensive audit of authentication system and database operations. All components verified as fully operational: Replit OAuth integration working, session persistence functional across all pages, protected routes properly secured, database operations stable for user management, subscription handling, AI model training data, and image generation history. Created system validation endpoints (/api/system/phase1-validation, /api/system/auth-test, /api/system/database-test) for ongoing monitoring. Authentication and database foundation confirmed ready for production launch. Completed August 10, 2025.

- **Phase 2 User Journey & Payment Optimization**: Successfully executed specialized agent coordination for complete Phase 2 optimization. Elena (Master Coordinator) orchestrated Zara (training system repair), Maya (generation optimization), and Quinn (payment validation). Critical fixes: Removed hardcoded Replicate destinations preventing new user training, optimized generation endpoints for proper JSON responses, validated Creator (€27) and Entrepreneur (€67) subscription tiers. Complete user journey Steps 1-4 (TRAIN → STYLE → SHOOT → BUILD) now fully operational. Platform ready for launch to 135K+ followers and 2500+ email subscribers. Completed August 10, 2025.

- **Phase 2 Training System Fix Implementation**: Completed the critical hardcoded destination fixes identified by Elena's coordination and Zara's technical analysis. Fixed all "sandrasocial/" hardcoded paths in 5 core training files (training-completion-monitor.ts, retrain-model.ts, model-validation-service.ts, model-training-service.ts, bulletproof-upload-service.ts). Implemented Zara's dynamic paths utility (server/utils/paths.ts) and added REPLICATE_USERNAME environment variable for flexible model destinations. New users can now successfully train AI models without "training destination does not exist" errors. Training system fully operational for production launch. Fixed August 10, 2025.