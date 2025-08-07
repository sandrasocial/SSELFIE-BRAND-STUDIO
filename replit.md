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
**Status:** COMPREHENSIVE FIX IMPLEMENTED - Path confusion eliminated, full file access restored
**Achievement:** Resolved agent file access confusion with comprehensive guidance system
**Core Fix:** Implemented agent file path education system with intelligent error recovery
**Key Improvements:**
1. ✅ **File Path Guide System**: Complete member journey file mapping with exact paths
2. ✅ **Intelligent Error Messages**: Path suggestions and corrections for common mistakes
3. ✅ **Step-to-Path Translation**: Natural language ("train", "workspace") maps to actual files
4. ✅ **Enhanced Search Results**: Show explicit file paths in search results
5. ✅ **Path Validation System**: Real-time validation with helpful corrections
6. ✅ **Priority-Based File Access**: Critical member journey files clearly identified
**Implementation Details:**
- Created agent-file-path-guide.ts with comprehensive file reference system
- Enhanced direct_file_access tool with helpful error messages and path suggestions
- Updated search system to show explicit file paths (e.g., "client/src/pages/workspace.tsx")
- Added step-to-path translation for natural language file requests
- Implemented common mistake corrections (directories vs files confusion)
**Impact:** Agents now access member journey files confidently with clear path guidance

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