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