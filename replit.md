# Overview
SSELFIE Studio is a luxury AI-powered personal branding platform designed for entrepreneurs and coaches. It transforms selfies into professional brand photos using advanced AI image generation (Replicate's FLUX model) and provides AI-driven brand strategy. The platform features 13 specialized autonomous AI agents that offer comprehensive brand-building services across various subscription tiers. The project aims to provide premium brand visuals and strategic guidance through sophisticated AI and luxury UX design.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using React with TypeScript, featuring a luxury design system centered on Times New Roman typography and sophisticated black/white/gray color palettes. It uses Wouter for routing, TanStack Query for state management, and Tailwind CSS for styling with luxury design tokens. Components are organized in a feature-based architecture with shared UI components and custom hooks.

## Backend Architecture
The server is built on Express.js with TypeScript, implementing a RESTful API architecture. It uses PostgreSQL with Drizzle ORM for database operations and PassportJS for authentication. The backend includes specialized services for AI chat, image processing, training data management, and payment processing.

## Agent System Architecture
A unique multi-agent system coordinates AI assistants through a unified communication layer. Each agent has specialized capabilities (e.g., Maya for photography, Victoria for websites) and communicates via consolidated endpoints at `/api/consulting-agents/`. The system uses singleton Claude service instances for performance and maintains consistent data storage in `claudeConversations`/`claudeMessages` tables. Agents have full enterprise tool access, including file operations and code generation.

**AGENT PERSONALITY CONTEXT RESTORATION (August 6, 2025):** Fixed critical context loss causing generic agent responses. Integrated AdvancedMemorySystem and IntelligentContextManager into Claude API service to restore agent personalities, specialized voices, and learning continuity while maintaining function calling capabilities.

**AGENT PERSONALITY CORRUPTION FIX (August 6, 2025):** Discovered agent personalities had been completely rewritten with generic corporate language, losing authentic voices. Current personalities in agent-personalities-consulting.ts were corrupted with excessive tool documentation and repetitive formatting. Restored clean personalities from archive/consolidated-agent-personalities-2025/agent-personalities-clean-archived.ts to recover original specialized voices and conversation styles.

## Data Storage Solutions
PostgreSQL serves as the primary database with schemas for users, conversations, training data, and agent interactions. AWS S3 is used for storing training images and generated content. Local file storage is used for flatlay collections and brand assets, with efficient caching.

## Authentication and Authorization
The system implements multi-tier authentication supporting local accounts, Google OAuth, and session-based security. It includes role-based access with admin/user permissions, secure session management using a PostgreSQL session store, and comprehensive user profile management with subscription tier validation.

# External Dependencies

## Third-Party AI Services
- **Anthropic Claude API**: Powers all AI agent conversations and content generation.
- **Replicate API**: Handles AI image generation using FLUX models and custom training.
- **OpenAI**: Used for specific AI tasks and integrations.

## Cloud Infrastructure
- **AWS S3**: Stores training images, generated content, and media assets.
- **PostgreSQL/Neon**: Primary database hosting.
- **Vercel/Replit**: Deployment and hosting infrastructure.

## Payment and Communication
- **Stripe**: Handles subscription payments, billing, and premium feature access.
- **SendGrid**: Email delivery for transactional and marketing campaigns.
- **Flodesk**: Email marketing automation.
- **ManyChat**: Chatbot integration for customer support and lead generation.

## Development and Monitoring
- **Drizzle ORM**: Database schema management.
- **Tailwind CSS**: Utility-first styling framework.
- **Vite**: Build tool and development server.
- **TypeScript**: Type safety across the application stack.