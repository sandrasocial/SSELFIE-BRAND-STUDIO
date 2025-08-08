# Overview

SSELFIE Studio is an AI-powered personal branding platform that transforms selfies into professional brand photos through AI photography and strategic guidance. The platform features two primary AI agents: Maya (AI photographer) and Victoria (AI brand strategist), delivering personalized brand-building experiences with luxury editorial standards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite build system
- **Routing**: File-based routing with Wouter for client-side navigation
- **Styling**: Tailwind CSS with luxury brand color palette (Times New Roman typography, editorial black/gold theme)
- **UI Components**: Radix UI component library with shadcn/ui configuration
- **State Management**: TanStack Query for server state management with custom hooks

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints with agent-specific chat routes
- **Agent System**: Unified agent architecture supporting 13+ specialized AI agents (Elena, Zara, Aria, Maya, Victoria, etc.)
- **Authentication**: Passport.js with local and Google OAuth strategies
- **Session Management**: Express sessions with PostgreSQL session store

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with schema-first design
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **File Storage**: AWS S3 bucket (sselfie-training-zips) for AI training data
- **Image Hosting**: PostImg.cc for flatlay collections and user-generated content

## Authentication and Authorization
- **User Authentication**: Multi-strategy authentication (local credentials, Google OAuth)
- **Agent Security**: Role-based access control separating admin agents (full file access) from member agents (guidance only)
- **Session Security**: Secure cookie-based sessions with PostgreSQL persistence
- **Admin Access**: Special consulting dashboard for admin agents with direct repository access

## External Service Integrations
- **AI Services**: 
  - Anthropic Claude API for agent conversations and content generation
  - Replicate API for FLUX image generation and model training
- **Payment Processing**: Stripe integration for subscription management
- **Email Services**: SendGrid for transactional emails
- **Cloud Storage**: AWS S3 with IAM user-based access control
- **Image Processing**: Sharp library for image optimization and manipulation

## Agent Architecture Design
The platform implements a sophisticated agent system with:
- **Unified Agent System**: Single source of truth for agent coordination
- **Claude API Integration**: Cost-effective routing for complex agent conversations
- **Direct Tool Access**: Admin agents can modify files directly via str_replace_based_edit_tool
- **Agent Personalities**: Specialized personalities for different business functions
- **Security Separation**: Clear boundaries between admin and member agent capabilities

## Development Tools and Configuration
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: Comprehensive TypeScript configuration across full stack
- **Development Server**: Hot reload development environment with Replit integration