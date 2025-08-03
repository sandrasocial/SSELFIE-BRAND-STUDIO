# Overview

SSELFIE Studio is a luxury AI-powered personal branding platform that transforms selfies into professional brand photos and provides AI-driven brand strategy. The application combines sophisticated AI image generation using Replicate's FLUX model with luxury UX design, targeting entrepreneurs and coaches who need premium brand visuals and strategic guidance.

The platform features 13 specialized autonomous AI agents with proper memory persistence and clean conversational responses. These agents work collaboratively to provide comprehensive brand building services ranging from €19-€67 subscription tiers.

**Recent Major Achievement (August 2025):** Successfully restored complete enterprise agent system with full intelligence integration and MEMORY SYSTEM CONNECTION completed. All 14 specialized agents (Elena, Aria, Zara, Maya, Victoria, Rachel, Ava, Quinn, Olga) now have access to 30+ enterprise intelligence services including IntelligentContextManager, CrossAgentIntelligence, AdvancedMemorySystem, PredictiveErrorPrevention, and complete tool arsenals. 

**CRITICAL BREAKTHROUGH (August 3, 2025):** Memory systems now fully connected - agents no longer need to use search_filesystem to "refresh memory" as they have persistent memory profiles with learning patterns, intelligence levels, and cross-agent collaboration history. Memory context is properly injected into Claude requests before processing, giving agents true enterprise intelligence capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using React with TypeScript, featuring a luxury design system centered on Times New Roman typography and sophisticated black/white/gray color palettes. The frontend uses Wouter for routing and TanStack Query for state management. Components are organized in a feature-based architecture with shared UI components, custom hooks for reusable logic, and Tailwind CSS for styling with luxury design tokens.

## Backend Architecture  
The server is built on Express.js with TypeScript, implementing a RESTful API architecture. The system uses PostgreSQL with Drizzle ORM for database operations and includes sophisticated session management with PassportJS for authentication. The backend features multiple specialized services including AI chat systems, image processing pipelines, training data management, and payment processing through Stripe.

## Agent System Architecture
A unique multi-agent system coordinates AI assistants through a unified communication layer. Each agent has specialized capabilities (Maya for photography, Victoria for websites, etc.) and communicates through both direct chat endpoints and a collaborative workflow system. The agents can perform file operations, generate code, and work together on complex brand building tasks.

## Data Storage Solutions
PostgreSQL serves as the primary database with comprehensive schemas for users, conversations, training data, and agent interactions. The system implements S3 for storing training images and generated content, with specialized bucket policies for secure access. Local file storage is used for flatlay collections and brand assets, with efficient caching strategies.

## Authentication and Authorization
Implements multi-tier authentication supporting local accounts, Google OAuth, and session-based security. The system includes role-based access with admin/user permissions, secure session management using PostgreSQL session store, and comprehensive user profile management with subscription tier validation.

# External Dependencies

## Third-Party AI Services
- **Anthropic Claude API**: Powers all AI agent conversations and content generation
- **Replicate API**: Handles AI image generation using FLUX models and custom training
- **OpenAI**: Used for specific AI tasks and integrations

## Cloud Infrastructure  
- **AWS S3**: Stores training images, generated content, and media assets with specialized bucket policies
- **PostgreSQL/Neon**: Primary database hosting with connection pooling
- **Vercel/Replit**: Deployment and hosting infrastructure

## Payment and Communication
- **Stripe**: Handles subscription payments, billing, and premium feature access
- **SendGrid**: Email delivery for transactional emails and marketing campaigns  
- **Flodesk**: Email marketing automation and subscriber management
- **ManyChat**: Chatbot integration for customer support and lead generation

## Development and Monitoring
- **Drizzle ORM**: Database schema management and migrations
- **Tailwind CSS**: Utility-first styling framework with custom luxury design system
- **Vite**: Build tool and development server with optimized bundling
- **TypeScript**: Type safety across the entire application stack