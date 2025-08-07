# Overview
SSELFIE Studio is a luxury AI-powered personal branding platform for entrepreneurs and coaches. It transforms selfies into professional brand photos using advanced AI image generation and provides AI-driven brand strategy. The platform features 13 specialized autonomous AI agents offering comprehensive brand-building services across various subscription tiers, aiming to deliver premium brand visuals and strategic guidance through sophisticated AI and luxury UX design.

## Recent Changes (August 7, 2025)
**AUTHENTICATION SYSTEM FULLY RESTORED**: Successfully resolved authentication crisis that was preventing new users from training/generating images. System restored to July 31, 2025 working state when Sandra and Shannon completed model training. Fixed duplicate route conflicts, preserved admin agent functionality, and resolved OIDC consent page loading issues.

**DUPLICATE ACCOUNT RESOLUTION**: Identified and merged Shannon's two separate accounts (shannon@soulresets.com and Apple private relay email) to restore access to her completed trained model and 23 AI images.

**OIDC CONSENT FIX IMPLEMENTED**: Eliminated infinite loading at consent page by removing "login consent" prompt parameter from authentication flow.

**DATABASE ACCOUNT MERGER**: Successfully updated Shannon's Apple ID account (44991795) to inherit full-access plan, user data, and trained model access from original account (shannon-1753945376880).

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, featuring a luxury design system. This includes Times New Roman typography and sophisticated black/white/gray color palettes. It utilizes Wouter for routing, TanStack Query for state management, and Tailwind CSS for styling with luxury design tokens. Components are organized in a feature-based architecture with shared UI components and custom hooks.

## Backend Architecture
The server is built on Express.js with TypeScript, implementing a RESTful API architecture. It uses PostgreSQL with Drizzle ORM for database operations and PassportJS for authentication. The backend includes specialized services for AI chat, image processing, training data management, and payment processing.

## Agent System Architecture - COMPREHENSIVE UNRESTRICTED ACCESS (August 7, 2025)
**Status:** COMPLETE APPLICATION ACCESS IMPLEMENTED - No restrictions, full file system access
**Achievement:** Agent access expanded from just agent files to ALL application files
**Core Fix:** Comprehensive file access system for pre-login pages, client/src, API, components, servers, services
**Key Features:**
1. ✅ **Unrestricted Application Access**: ALL files accessible (client/src, server/, components/, pages/, API routes, services/)
2. ✅ **Application File Priority**: +50 priority boost for all .tsx/.ts files outside node_modules
3. ✅ **Complete File Mapping**: Comprehensive guide covering pre-login pages, member journey, admin, agent system
4. ✅ **Multi-Category Access**: Pre-login, client/src app, API routes, server & services, components, member journey
5. ✅ **Direct File Access**: Working bypass system for immediate file viewing and editing
6. ✅ **Enhanced Search Results**: All application files boosted in search results with [APP FILE] tags
**Implementation Details:**
- Expanded APPLICATION_FILES mapping with pre-login pages, client/src, API, server, services, components
- Updated search priority system to boost ALL application files, not just agent files
- Enhanced direct_file_access tool for complete project visibility
- Added getCompleteApplicationGuide() function with comprehensive file access guide
- Search system now detects and prioritizes client/src, /pages/, /components/, /api/, server/, /services/, /agents/
**Impact:** Admin agents now have unrestricted access to entire application codebase with prioritized results

## Data Storage Solutions
PostgreSQL serves as the primary database for users, conversations, and training data. AWS S3 is used for storing training images and generated content. Local file storage is used for flatlay collections and brand assets.

## Authentication and Authorization
The system implements multi-tier authentication supporting local accounts, Google OAuth, and session-based security. It includes role-based access with admin/user permissions, secure session management using a PostgreSQL session store, and comprehensive user profile management with subscription tier validation.

## Intelligent Search System - August 7, 2025 (FINAL COMPREHENSIVE FIX)
**Status:** COMPLETE PRIORITY SYSTEM IMPLEMENTED - Documentation properly deprioritized
**Achievement:** Application files prioritized, documentation files moved to bottom of results  
**Core Innovation:** Smart priority-based filtering ensuring agents see functional code first
**Architecture:** Comprehensive priority system with intelligent documentation filtering
**Key Features:**
1. ✅ **Member Journey Files (Priority 200)**: Direct filename matching for absolute highest priority
2. ✅ **Application Files (Priority 50-80)**: All pages, components, routes, services without restrictions  
3. ✅ **Documentation Deprioritization (Priority 5-10)**: Analysis docs, configs, assets at bottom
4. ✅ **Intelligent Filtering**: Auto-filter docs when 20+ app files found
5. ✅ **No Hardcoded Limitations**: Complete access to all functional application code
6. ✅ **Business-First Results**: Member experience files shown before administrative tools
**Performance Impact:** Agents see workspace.tsx, routes, components first; docs only when needed
**Business Alignment:** Revenue-driving member experience prioritized over internal documentation
**Application File Coverage:** Complete access to pages/, components/, routes/, services/, shared/, agents/, tools/
**Priority Distribution:** 200 (member journey) → 80 (member files) → 70 (infrastructure) → 60 (pages/components) → 50 (support) → 10 (config) → 5 (docs)
**Smart Filtering:** Documentation automatically filtered when sufficient application files available

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