# SSELFIE Studio

## Overview
SSELFIE Studio is an AI-powered personal branding platform that transforms selfies into professional brand photos. It features two primary AI personalities, Maya (AI photographer) and Victoria (AI strategist), supported by a sophisticated multi-agent AI system. The platform aims to provide professional-grade personal branding assets, integrating advanced AI services for image generation and conversational interactions to capture a significant market share in personal branding and professional imaging. Its business model leverages 14 internal business agents (Sandra's team) to support the core member-facing agents (Maya and Victoria), offering a cost-effective alternative to traditional creative stacks.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query with custom hooks.
- **UI Components**: Radix UI primitives, shadcn/ui components, and Tailwind CSS.
- **Design System**: Luxury editorial theme, Times New Roman typography, sophisticated color palette.
- **Component Organization**: Feature-based structure with shared UI, layout, and page components.

### Backend Architecture
- **Runtime**: Node.js with Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Passport.js (local and Google OAuth), session-based with PostgreSQL. Admin agents connect to Sandra's real authenticated Replit OAuth session, ensuring context persistence.
- **Agent System**: Multi-agent architecture coordinating 13+ specialized AI agents. Hybrid routing for AI integration. Admin agents have direct repository access and file modification capabilities using native Node.js tools (`bash`, `str_replace_based_edit_tool`).
- **Memory & Context**: Enhanced context detection and memory retention with a unified simple-memory-service.ts system.
- **Workflow Execution**: Dynamic workflow creation with extended timeouts, `Promise.allSettled` for failure recovery, and sequential execution with error recovery.

### Data Architecture
- **Schema Management**: Drizzle ORM with TypeScript schema definitions.
- **User Management**: Comprehensive user profiles, subscription tiers, onboarding data, brand preferences.
- **Conversation System**: Claude conversations and messages with agent-specific routing and memory management.
- **Image Storage**: AWS S3 for training images and generated content.

### Agent System Design
- **Agent Types**: Admin Agents (full repository access for development) and Member Agents (secure, limited-access for user experiences).
- **Tool Integration**: Agents utilize native Replit tools, primarily `bash` and `str_replace_based_edit_tool`, for file system operations and code modification.
- **Security Separation**: Role-based access control; agents have unrestricted access to all environment secrets for maximum autonomy.
- **Verification-First Protocol**: All agents are trained with mandatory verification enforcement at the execution level. They must use tools to check actual files/systems and provide evidence before making any claims, ensuring zero fabrication and evidence-based responses. System prompts are enhanced with mandatory verification protocols requiring tool usage.

## External Dependencies

### AI Services
- **Anthropic Claude API**: Core agent personalities and conversational AI.
- **Replicate**: AI image generation (specifically FLUX models).
- **AWS S3**: Secure storage for training images and generated content.

### Authentication & Payments
- **Google OAuth**: Social authentication.
- **Stripe**: Payment processing for subscription tiers.
- **SendGrid**: Transactional email delivery.

### Infrastructure
- **PostgreSQL**: Primary database (Neon).
- **AWS IAM**: User and bucket access management.
- **Vercel/Replit**: Deployment platforms.

### Development Tools
- **TypeScript**: Full type safety.
- **Drizzle Kit**: Database migration and schema management.
- **Tailwind CSS**: Utility-first styling.
- **ESBuild**: Server bundling.