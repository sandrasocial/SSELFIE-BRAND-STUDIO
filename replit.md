# SSELFIE Studio - AI Personal Branding Platform

## Overview
SSELFIE Studio is an AI personal branding platform that generates professional brand photos using AI, replacing traditional photoshoots. The core workflow is TRAIN → STYLE → GALLERY. It targets women entrepreneurs with a subscription model, aiming for significant recurring revenue. The long-term vision includes scaling the platform and potentially selling the underlying admin agent ecosystem to enterprises, with strategic plans for future market expansion while maintaining brand identity.

## User Preferences
Preferred communication style: Simple, everyday language.
UI Preferences: Keep technical controls hidden - users prefer Maya to handle technical details automatically rather than exposing preset/seed parameters.
PROJECT STATUS: LAUNCH READY - Simplified to core TRAIN → STYLE → GALLERY flow for immediate €47/month launch. Maya authentication cleaned for production - development access removed for professional launch experience.

## Recent Critical Update (August 31, 2025)
**MAYA PURE INTELLIGENCE ACHIEVED**: Complete elimination of all 8 interference levels that were constraining Maya's creative control. Maya now has complete authority over all image generation parameters, shot types, quality settings, and artistic decisions without any generic system overrides or validation constraints.

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