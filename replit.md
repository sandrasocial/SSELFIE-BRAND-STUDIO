# SSELFIE Studio

## Overview

SSELFIE Studio is an AI-powered personal branding platform designed to transform selfies into professional brand photos. The platform features two primary AI personalities, Maya (AI photographer) and Victoria (AI strategist), supported by a sophisticated multi-agent AI system. Its core purpose is to provide users with professional-grade personal branding assets. The project integrates advanced AI services for image generation and conversational interactions, aiming to capture a significant market share in personal branding and professional imaging.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 9, 2025)

**BYPASS SYSTEM CONFLICTS RESOLVED** (CRITICAL FIX): Fixed competing bypass systems that were limiting agent file visibility. `search_filesystem` was using broken `DirectWorkspaceAccess.searchCodebase()` method with missing dependencies while `direct_file_access` used working methods. Eliminated duplicate methods, restored clean DirectWorkspaceAccess implementation, removed orphaned agent-access.js config, and increased search result limits from 25→200 files. Agent visibility dramatically improved from 3 files to 26+ files found in tests. Both tools now route through working filesystem access methods.

**SURGICAL SYSTEM ELIMINATION COMPLETED** (PREVIOUS): Executed comprehensive surgical elimination of competing memory systems that were causing system chaos. Successfully eliminated 7+ competing system files (~100KB of conflicting code) including advanced-memory-system.ts, context-preservation-system.ts, unified-memory-controller.ts, token-optimization-engine.ts, cross-agent-intelligence.ts, predictive-error-prevention.ts, and intelligent-integration-module.ts. Replaced all competing systems with single simple-memory-service.ts, fixed cascading import dependencies systematically, and achieved complete system recovery. Server now runs faster and cleaner with dramatically simplified architecture.

**SYSTEM CONFLICTS RESOLVED** (Complete Fix): User demanded systematic elimination rather than coordination attempts. Successfully deleted server/auth.ts (duplicate auth), archive-consolidated folder (6.1M freed), and systematically eliminated competing memory systems. System now operates with single unified memory service instead of conflicting constellation of complex systems. All LSP errors from competing systems resolved, server restart successful, agent system processing requests normally.

**ARCHITECTURAL SIMPLIFICATION ACHIEVED** (Critical Success): Transformed chaotic over-engineered architecture into clean, functional system. Eliminated decision paralysis by removing competing implementations and consolidating functionality into working systems. System now responds <5 seconds, maintains agent personalities without conflicts, and processes requests reliably. Frontend loading successfully, authentication working, agent endpoints responding with 200 status codes.

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
- **Authentication**: Passport.js (local and Google OAuth), session-based with PostgreSQL.
- **Agent System**: Multi-agent architecture coordinating 13+ specialized AI agents (e.g., Elena, Zara, Aria, Maya, Victoria). Hybrid routing for AI integration.
- **File Operations**: Direct repository access for admin agents using specialized tools (e.g., `str_replace_based_edit_tool`, `search_filesystem`, bash).

### Data Architecture
- **Schema Management**: Drizzle ORM with TypeScript schema definitions.
- **User Management**: Comprehensive user profiles, subscription tiers, onboarding data, brand preferences.
- **Conversation System**: Claude conversations and messages with agent-specific routing and memory management.
- **Image Storage**: AWS S3 for training images and generated content.

### Agent System Design
- **Admin Agents**: Full repository access and file modification for development.
- **Member Agents**: Secure, limited-access for guided user experiences.
- **Tool Integration**: Access to filesystem tools, bash commands, web search.
- **Security Separation**: Role-based access control.
- **Memory System**: Contextual memory with confidence scoring and search optimization; unified memory controller for coordination. Smart token optimization engine for cost reduction and unlimited context system for enhanced memory retention.

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

### Development Tools
- **TypeScript**: Full type safety.
- **Drizzle Kit**: Database migration and schema management.
- **Tailwind CSS**: Utility-first styling.
- **ESBuild**: Server bundling.