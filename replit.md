# SSELFIE Studio

## Overview

SSELFIE Studio is an AI-powered personal branding platform designed to transform selfies into complete business launches, targeting female entrepreneurs. It aims to be the "Tesla of personal branding" by enabling users to build their brand and launch a business in 20 minutes using only their phone. The platform integrates custom AI image generation, luxury editorial design, automated business setup, and proven templates to offer a comprehensive "business-in-a-box" solution. The project's ambition is to reach 1 million followers by 2026, building upon its current success of 1000+ users and €15,132 revenue, maintaining an 87% profit margin.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend:**
- **Framework:** React 18 with TypeScript (strict mode).
- **Bundler:** Vite.
- **Styling:** Tailwind CSS with a custom luxury design system (black #0a0a0a, white #ffffff, editorial gray #f5f5f5, Times New Roman for headlines, system fonts for UI).
- **State Management:** TanStack Query (React Query).
- **Routing:** Wouter.
- **UI Components:** Radix UI primitives and custom shadcn/ui components.
- **Design:** Editorial magazine-style with generous whitespace, iconic hero images, image+text overlay cards, full bleed image breaks, and portfolio-style components.

**Backend:**
- **Runtime:** Node.js with Express.js.
- **Language:** TypeScript with ES modules.
- **Database:** PostgreSQL via Drizzle ORM (Neon serverless PostgreSQL).
- **Authentication:** Replit Auth with OpenID Connect, Google OAuth Integration, secure session management.
- **Admin System:** Automatic admin privileges for `ssa@ssasocial.com` with unlimited usage.

**Core Features:**
- **AI Image Generation:** FLUX-trained custom model for editorial selfie transformation, optimized for facial accuracy and natural expressions.
- **Studio Builder:** One-click business setup with luxury templates.
- **BUILD Feature (Victoria):** Complete website generation system with WebsiteWizard form, onboarding data persistence, and AI-powered website creation. Fixed Aug 1, 2025: Resolved critical schema mapping issue where form data wasn't being saved to database - now properly maps WebsiteWizard fields to `onboarding_data` table structure.
- **Workspace Interface:** Dashboard for managing AI images, templates, and business setup.
- **Pricing System:** €67/month SSELFIE STUDIO subscription, including individual AI model training and a 100 monthly generation limit. A previous two-tier system (€29 Basic, €67 Full Access) was evaluated and consolidated to a single €67/month offering.
- **Authentication & User Management:** Secure session handling, automatic user profile creation from Google data, and admin-only access for `ssa@ssasocial.com`.
- **User Journey:** Streamlined flow from landing page, authentication, onboarding (selfie upload, preferences), AI processing, business setup, to launch.
- **Data Architecture:** Structured data for users, projects, AI images, templates, subscriptions, and comprehensive onboarding data persistence.
- **Agent Autonomy:** All 13 admin agents have direct file modification access (`str_replace_based_edit_tool`, `search_filesystem`, `bash`, `web_search`) and direct repository access, operating with zero Claude API costs for file operations. **FULLY OPERATIONAL** as of Aug 1, 2025: Autonomous Agent Architecture provides Replit AI-like workspace capabilities with zero API costs confirmed by ZARA testing. **LEGACY CLEANUP COMPLETED Aug 1, 2025:** OLGA systematically eliminated 17+ conflicting legacy systems including 686-line broken auto-file-writer, duplicate executors, and competing intelligence systems, achieving Swiss-watch precision autonomous operations. **CRITICAL BLOCKING RESOLVED Aug 1, 2025:** Eliminated all competing agent systems from archive/, fixed coordination blocking in autonomous-agent-integration.ts, and verified ALL agents (Aria, Maya, Victoria, Elena, Zara, Olga) can execute file operations successfully with zero conflicts.
- **Unified Agent Architecture:** A central orchestrator (`/api/autonomous-orchestrator/deploy-all-agents`) manages multi-agent workflows, enabling task assignment, real-time monitoring, and cross-agent learning.
- **Agent Communication:** Agents communicate with authentic personalities, leveraging an advanced memory system with cross-agent learning, contextual intelligence, and adaptive optimization for persistent context across conversations and sessions.
- **File Integration Protocol:** A mandatory 5-step checklist ensures all agent-created files are properly integrated into the application's routing and navigation.
- **Design System Protection:** Safeguards prevent agents from modifying core design files (e.g., `tailwind.config.ts`, `App.tsx`, `index.css`) without explicit instruction.
- **Continuous Working Patterns:** Agents are designed to work continuously until tasks are completed, providing real-time progress updates.
- **Error Prevention:** Comprehensive error detection and auto-correction capabilities are integrated into file operations.
- **Advanced Memory Intelligence:** **NEW Aug 1, 2025:** Implemented 5 critical memory enhancements including adaptive memory consolidation, cross-agent knowledge sharing, intelligent memory pruning, context-aware memory retrieval, and real-time learning optimization enabling collective intelligence across all agents.
- **Cross-Agent Collaboration:** **NEW Aug 1, 2025:** Agents can now share knowledge, collaborate on complex tasks, and learn from each other's patterns through the Cross-Agent Intelligence system, creating a network effect for improved problem-solving capabilities.
- **Multi-Agent Enhancement Project:** **100% COMPLETE Aug 1, 2025:** 6-agent collaboration successfully implemented all system improvements: Victoria (integration flows ✅), Aria (luxury UX/UI ✅), Maya (technical optimization ✅), Zara (backend architecture ✅), Elena (coordination ✅), Olga (organization ✅). Successfully delivered: Service Integration Templates, API Orchestration Layer, Checkpoint Automation, Enhanced Progress Visualization Dashboard, Task Dependency Mapping, Web Search Optimization, Service Setup Wizards, and comprehensive backend services architecture. **PROJECT STATUS: COMPLETE WITH ZERO CONFLICTS**
- **Unified Generation Service:** A single service handles all image generation, standardizing parameters for consistent quality and eliminating conflicts.
- **Maya Generation Intelligence:** Universal prompt structure with trigger word positioning, anatomy fixes (guidance_scale: 5.0, steps: 50), and intelligent conversation-to-prompt conversion system.
- **AI Photoshoot Enhancement:** Maya's expert prompt generation for collections with latest 2025 trends, luxury editorial sophistication, and anatomical accuracy.

**Deployment:**
- **Environment:** Built specifically for Replit infrastructure, not Vercel.
- **Development:** Vite dev server with Express backend, Neon PostgreSQL, Replit Auth.
- **Production:** Vite build for frontend, esbuild for backend, centralized asset management.

## External Dependencies

- **Database:** Neon Database (PostgreSQL)
- **Authentication:** Replit Auth
- **Payments:** Stripe
- **AI Image Generation:** FLUX AI (custom-trained model)
- **Development Tools:** Vite, Drizzle Kit, TypeScript, Tailwind CSS
- **UI Libraries:** Radix UI, Lucide React, TanStack Query, React Hook Form
- **Automation/Integration:** Make.com, Flodesk, Instagram/Meta API, ManyChat
- **AI Model:** Anthropic Claude 4.0 Sonnet (used by agents)
- **Email Service:** Resend API