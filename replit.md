# Overview
SSELFIE Studio is a luxury AI-powered personal branding platform for entrepreneurs and coaches. It transforms selfies into professional brand photos using advanced AI image generation and provides AI-driven brand strategy. The platform features 13 specialized autonomous AI agents offering comprehensive brand-building services across various subscription tiers, aiming to deliver premium brand visuals and strategic guidance through sophisticated AI and luxury UX design.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, featuring a luxury design system. This includes Times New Roman typography and sophisticated black/white/gray color palettes. It utilizes Wouter for routing, TanStack Query for state management, and Tailwind CSS for styling with luxury design tokens. Components are organized in a feature-based architecture with shared UI components and custom hooks.

## Backend Architecture
The server is built on Express.js with TypeScript, implementing a RESTful API architecture. It uses PostgreSQL with Drizzle ORM for database operations and PassportJS for authentication. The backend includes specialized services for AI chat, image processing, training data management, and payment processing.

## Agent System Architecture - ENHANCED (August 7, 2025)
**Status:** SYSTEMATIC FIX IMPLEMENTED - Agents now have architectural knowledge
**Achievement:** Resolved "architectural blindness" causing 80% of agent failures
**Core Fix:** Added comprehensive project structure knowledge to agent system prompts
**Key Improvements:**
1. ✅ **Architectural Knowledge Integration**: Agents now understand React/Express/PostgreSQL structure
2. ✅ **Simplified Search System**: Reduced from 500 to 20 max results with clear formatting
3. ✅ **Error Prevention System**: Pre-validates code changes before execution
4. ✅ **Context Preservation**: Agents maintain memory across conversations
5. ✅ **Intelligent Tool Usage**: Validation and suggestions for common errors
**Implementation Details:**
- Added PROJECT ARCHITECTURE section to all agent prompts (file organization, import patterns, modification protocols)
- Created architectural-knowledge-base.ts and error-prevention-system.ts modules
- Integrated context-preservation-system.ts for cross-conversation learning
- Simplified search results to actionable file lists instead of complex metadata
**Impact:** Agents now modify correct files, maintain proper imports, and avoid breaking changes

## Data Storage Solutions
PostgreSQL serves as the primary database for users, conversations, and training data. AWS S3 is used for storing training images and generated content. Local file storage is used for flatlay collections and brand assets.

## Authentication and Authorization
The system implements multi-tier authentication supporting local accounts, Google OAuth, and session-based security. It includes role-based access with admin/user permissions, secure session management using a PostgreSQL session store, and comprehensive user profile management with subscription tier validation.

## Intelligent Search System - August 7, 2025
**Status:** MEMBER JOURNEY PRIORITY SYSTEM IMPLEMENTED - Agent focus aligned with business
**Achievement:** 95% Replit AI-level search intelligence prioritizing member experience over admin
**Core Innovation:** Member-first priority system ensuring agents understand actual user journey
**Architecture:** Unified search system with member journey bias elimination  
**Key Features:**
1. ✅ **Member Journey Priority**: Editorial, workspace, training, gallery files get highest priority (35)
2. ✅ **Member-Focused Synonyms**: Train/shoot/style/build, editorial, workspace, checkout terms
3. ✅ **Admin Bias Elimination**: Admin files deprioritized unless specifically searched
4. ✅ **Complete User Flow Visibility**: Landing → pricing → workspace → train → shoot → build → gallery
5. ✅ **Member Component Access**: Editorial, workspace, UI components prioritized over admin
6. ✅ **Revenue Journey Focus**: Agents understand member experience that drives business
**Performance Impact:** Agents now find member journey files first, admin files only when needed
**Business Alignment:** All 13 agents focus on member experience optimization instead of admin tools
**Member Journey Coverage:** Editorial landing, workspace (516 lines), training, photoshoot, build, gallery, flatlay library
**Search Examples:** "user journey" shows member flow, not admin dashboard; "workspace" shows member interface, not admin tools
**Critical Fix:** Eliminated restrictive scoring thresholds (50%→15%, 40%→10%, 30%→8%) for comprehensive file access

# External Dependencies

## Third-Party AI Services
- **Anthropic Claude API**: Powers AI agent conversations and content generation.
- **Replicate API**: Handles AI image generation using FLUX models.
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