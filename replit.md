# SSELFIE Studio

## Overview
SSELFIE Studio is an AI-powered personal branding platform designed to transform selfies into professional brand photos. It features two primary AI personalities, Maya (AI photographer) and Victoria (AI strategist), supported by a sophisticated multi-agent AI system. The platform aims to provide users with professional-grade personal branding assets by integrating advanced AI services for image generation and conversational interactions, targeting the personal branding and professional imaging market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query.
- **UI Components**: Radix UI primitives, shadcn/ui components, Tailwind CSS.
- **Design System**: Luxury editorial theme, Times New Roman typography, sophisticated color palette.
- **Component Organization**: Feature-based structure.

### Backend Architecture
- **Runtime**: Node.js with Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Passport.js (local and Google OAuth), session-based.
- **Agent System**: Multi-agent architecture coordinating 13+ specialized AI agents. Hybrid routing for AI integration.
- **File Operations**: Direct repository access for admin agents using specialized tools (`str_replace_based_edit_tool`, `bash`).

### Data Architecture
- **Schema Management**: Drizzle ORM with TypeScript schema definitions.
- **User Management**: Comprehensive user profiles, subscription tiers, onboarding data, brand preferences.
- **Conversation System**: Claude conversations and messages with agent-specific routing and memory management.
- **Image Storage**: AWS S3 for training images and generated content.

### Agent System Design
- **Admin Agents**: Full repository access and file modification.
- **Member Agents**: Secure, limited-access for guided user experiences.
- **Tool Integration**: Access to filesystem tools, bash commands, web search.
- **Security Separation**: Role-based access control.
- **Memory System**: Consolidated single memory service (simple-memory-service.ts) with 12-hour cache duration, database persistence, and reformed verification system. Eliminates memory conflicts that previously made admin agents unusable. Implemented August 9, 2025 via Olga's consolidation plan.
- **Verification-First Training**: All agents are trained to verify information using tools before making claims, ensuring evidence-based responses and actions.
- **Elena Workflow Execution Fix**: Added execution protocols alongside analysis capabilities. Elena now has three distinct modes: Analysis Protocol (audits/analysis), Execution Protocol (build/implement requests), and Coordination Protocol (multi-agent workflows). Resolves issue where Elena defaulted to analysis instead of executing workflows. Fixed August 10, 2025.
- **Elena Agent System Understanding Fix**: Clarified separation between Member Agents (Maya/Victoria - limited capabilities for user experience) vs Admin Agents (14 consulting agents with full capabilities for business management). Prevents Elena from confusing or attempting to modify protected member agent personalities. Fixed August 10, 2025.

## External Dependencies

### AI Services
- **Anthropic Claude API**: Core agent personalities and conversational AI.
- **Replicate**: AI image generation (FLUX models).
- **AWS S3**: Secure storage for images.

### Authentication & Payments
- **Google OAuth**: Social authentication.
- **Stripe**: Payment processing for subscription tiers.
- **SendGrid**: Transactional email delivery.

### Infrastructure
- **PostgreSQL**: Primary database (Neon).
- **AWS IAM**: User and bucket access management.
- **Vercel/Replit**: Deployment platforms.