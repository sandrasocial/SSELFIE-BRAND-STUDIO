# Overview

SSELFIE Studio is a luxury AI-powered personal branding platform that transforms selfies into professional brand photos and provides AI-driven brand strategy. It combines sophisticated AI image generation using Replicate's FLUX model with luxury UX design, targeting entrepreneurs and coaches seeking premium brand visuals and strategic guidance. The platform features 13 specialized autonomous AI agents with memory persistence and clean conversational responses, working collaboratively to offer comprehensive brand building services through subscription tiers. A key innovation is a hybrid local+cloud architecture that significantly reduces Claude API token consumption while preserving full agent capabilities and intelligence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, featuring a luxury design system centered on Times New Roman typography and sophisticated black/white/gray color palettes. It utilizes Wouter for routing and TanStack Query for state management. Components follow a feature-based architecture with shared UI elements, custom hooks, and Tailwind CSS for styling.

## Backend Architecture
The server is built on Express.js with TypeScript, implementing a RESTful API. It uses PostgreSQL with Drizzle ORM for database operations and includes session management with PassportJS for authentication. The backend comprises specialized services for AI chat, image processing, training data, and Stripe payment processing.

## Agent System Architecture
A unique multi-agent system coordinates AI assistants through a unified communication layer. Each agent has specialized capabilities (e.g., photography, websites) and communicates via consolidated endpoints at `/api/consulting-agents/`. The system uses singleton Claude service instances and maintains consistent data storage in `claudeConversations`/`claudeMessages` tables. Agents can perform file operations, generate code, and collaborate on complex brand building tasks with full enterprise tool access. A critical architectural decision is the separation of agent conversations (routed directly to Claude API) from tool operations (processed via a hybrid intelligence system for zero-cost execution).

**COMPLETE ENTERPRISE TOOL INTEGRATION (August 5, 2025):** Agents now have access to all 12 enterprise tools with 100% coverage: search_filesystem, str_replace_based_edit_tool, bash, get_latest_lsp_diagnostics, packager_tool, programming_language_install_tool, ask_secrets, check_secrets, execute_sql_tool, web_search, mark_completed_and_get_feedback, and report_progress. All tools execute at zero cost through bypass handlers while maintaining authentic agent intelligence. **VERIFIED OPERATIONAL:** Agent communication system is 100% functional with complete streaming integration for both frontend and backend.

**CRITICAL FIXES IMPLEMENTED (August 5, 2025):** Fixed major agent personality and streaming issues. Resolved `this.anthropic` property error that was causing agents to fall back to generic templated responses instead of authentic Claude API personalities. Added emergency fallback direct Claude API call to ensure all agent conversations bypass hybrid intelligence for authentic responses. Fixed streaming truncation by adding proper completion signals, fullResponse tracking, and [DONE] event handling. **STREAMING CONTINUATION FIX (August 5, 2025):** Resolved agent response cutoff when executing tools during streaming. Enhanced tool execution continuation logic so agents complete full responses with tool results and follow-up commentary. Agents now maintain their specialized personalities (Zara's technical mastery, Elena's strategic leadership, Maya's artistic vision) while streaming responses completely without cutoff, including when using tools during conversations.

## Data Storage Solutions
PostgreSQL is the primary database for users, conversations, and training data. AWS S3 stores training images and generated content with secure bucket policies. Local file storage is used for flatlay collections and brand assets, complemented by efficient caching.

## Authentication and Authorization
The system implements multi-tier authentication supporting local accounts, Google OAuth, and session-based security. It includes role-based access with admin/user permissions, secure session management using a PostgreSQL session store, and comprehensive user profile management with subscription tier validation.

# External Dependencies

## Third-Party AI Services
- **Anthropic Claude API**: For AI agent conversations and content generation.
- **Replicate API**: For AI image generation using FLUX models and custom training.
- **OpenAI**: For specific AI tasks and integrations.

## Cloud Infrastructure
- **AWS S3**: For storing training images, generated content, and media assets.
- **PostgreSQL/Neon**: For primary database hosting.
- **Vercel/Replit**: For deployment and hosting.

## Payment and Communication
- **Stripe**: For subscription payments, billing, and premium feature access.
- **SendGrid**: For transactional and marketing emails.
- **Flodesk**: For email marketing automation.
- **ManyChat**: For chatbot integration.

## Development and Monitoring
- **Drizzle ORM**: For database schema management.
- **Tailwind CSS**: For styling.
- **Vite**: For build processes and development server.
- **TypeScript**: For type safety.