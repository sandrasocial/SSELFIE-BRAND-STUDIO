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
- **RESOLVED (Aug 10, 2025):** Fixed critical Claude API streaming failures caused by Anthropic SDK v0.37.0 bug by implementing non-streaming bypass with simulated streaming responses. All agents now respond with real-time streaming preserved.

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
- **Maya**: AI photographer and celebrity stylist.
- **Victoria**: UX strategist and business consultant.
- **Elena**: Master coordinator for multi-agent workflows.
- **Zara**: Technical optimizer and system performance specialist.
- **Aria**: UI/UX specialist for interface verification.
- **Olga**: System cleanup and organization expert.
- **Additional agents**: Specialized roles for content generation, optimization, and user experience.