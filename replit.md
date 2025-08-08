# SSELFIE Studio

## Recent Changes (August 8, 2025)

**ROOT DIRECTORY MAJOR CLEANUP COMPLETED** (Organization Breakthrough): Systematically cleaned up chaotic file structure, reducing root clutter from 184 files down to 53 organized files. Moved 210+ documentation files into structured docs/ directories (agent-reports/, admin-reports/, system-reports/), consolidated archive folders, and created professional project organization without breaking any functionality.

**SYSTEMATIC PRIORITY VERIFICATION COMPLETED** (Final Confirmation): Performed comprehensive double-check of all 5 critical system fixes - all verified working correctly with search system fully restored, authentication consolidated, backup files cleaned, routes unified, and memory system operational.

## Overview

SSELFIE Studio is a comprehensive AI-powered personal branding platform that transforms selfies into professional brand photos. The platform features two AI personalities - Maya (AI photographer) and Victoria (AI strategist) - along with a sophisticated admin agent system. Built with React/TypeScript frontend and Express/PostgreSQL backend, it integrates multiple AI services including Claude API for agent personalities, Replicate for AI image generation, and AWS S3 for asset storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state with custom hooks for reusable logic
- **UI Components**: Radix UI primitives with shadcn/ui components and Tailwind CSS
- **Design System**: Luxury editorial theme with Times New Roman typography and sophisticated color palette
- **Component Organization**: Feature-based structure with shared UI components, layout components, and page-level components

### Backend Architecture
- **Runtime**: Node.js with Express server framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local and Google OAuth strategies, session-based auth with PostgreSQL session store
- **Agent System**: Multi-agent architecture with unified agent system coordinating 13+ specialized AI agents including Elena (coordinator), Zara (technical), Aria (design), Maya (styling), Victoria (strategy), and others
- **AI Integration**: Claude API for agent personalities and conversations, hybrid routing between Claude API and autonomous agent execution
- **File Operations**: Direct repository access for admin agents using str_replace_based_edit_tool, search_filesystem, and bash tools

### Data Architecture
- **Schema Management**: Drizzle ORM with TypeScript schema definitions for type safety
- **User Management**: Comprehensive user profiles with subscription tiers, onboarding data, and brand preferences
- **Conversation System**: Claude conversations and messages with agent-specific routing and memory management
- **Image Storage**: AWS S3 integration for training images and generated content with proper IAM policies

### Agent System Design
- **Admin Agents**: Full repository access with file modification capabilities for Sandra's development work
- **Member Agents**: Secure, limited-access versions for guided user experiences without file modification
- **Tool Integration**: Direct access to filesystem tools, bash commands, and web search capabilities
- **Security Separation**: Role-based access control separating admin functionality from member experience
- **Memory System**: Contextual memory with confidence scoring and search optimization to prevent repetitive operations

## External Dependencies

### AI Services
- **Anthropic Claude API**: Core agent personality system and conversation management
- **Replicate**: AI image generation with FLUX models and custom training capabilities
- **AWS S3**: Secure storage for training images and generated content with bucket policies for public/private access

### Authentication & Payments
- **Google OAuth**: Social authentication integration
- **Stripe**: Payment processing for subscription tiers (Free €0, Basic €22, Full Access €67)
- **SendGrid**: Transactional email delivery for user communications

### Infrastructure
- **PostgreSQL**: Primary database hosted on Neon for scalability
- **AWS IAM**: User and bucket access management with specific policies for sselfie-s3-user
- **Vercel/Replit**: Deployment platforms with proper build configuration and environment variables

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **ESBuild**: Server bundling with proper external dependency handling