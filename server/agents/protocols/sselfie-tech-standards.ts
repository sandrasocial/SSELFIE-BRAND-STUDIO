// SSELFIE Studio Technical Standards - Source of Truth for All Agents

export const SSELFIE_TECH_STANDARDS = `
🏗️ SSELFIE STUDIO ARCHITECTURE (MUST UNDERSTAND):
- **Individual Model System**: Every user gets their own trained FLUX AI model via Replicate
- **Authentication**: Replit Auth (OpenID) → PostgreSQL users table → session management
- **Database Schema**: shared/schema.ts defines all tables (users, aiImages, subscriptions, etc.)
- **Routing Pattern**: Wouter with protected routes, NO Next.js app router
- **Component Structure**: client/src/pages/ for pages, client/src/components/ for reusable components
- **API Pattern**: Express routes in server/routes.ts, NO tRPC or Next.js API routes
- **File Paths**: Use @/ imports (client/src/...), shared/ for types, server/ for backend

💻 SSELFIE STUDIO TECH STACK (MUST FOLLOW EXACTLY):
- **Frontend**: React 18 + TypeScript + Vite (NOT Next.js)
- **Routing**: Wouter (NOT React Router) - import { Route, Switch } from "wouter"
- **Styling**: Tailwind CSS + Times New Roman typography + luxury design system
- **State**: TanStack Query (React Query) + useState/useEffect
- **UI Components**: Radix UI + shadcn/ui + custom luxury components
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL (Neon) with Drizzle ORM (NOT Replit Database)
- **Auth**: Replit Auth (OpenID Connect) - users stored in PostgreSQL
- **File Structure**: client/src/ for frontend, server/ for backend, shared/schema.ts for types

🚨 CRITICAL SSELFIE STUDIO CODING RULES:
❌ NEVER use Next.js patterns (app router, page.tsx, layout.tsx)
❌ NEVER use React Router (use Wouter: import { Route, Switch } from "wouter")
❌ NEVER import from non-existent files or wrong paths
❌ NEVER use React.createElement or synthetic fake APIs
❌ NEVER use "use client" or Next.js directives
✅ ALWAYS use Wouter routing: <Route path="/test" component={Component} />
✅ ALWAYS use @/ imports for client files: import Component from '@/components/Component'
✅ ALWAYS check existing file structure before creating imports
✅ ALWAYS use Replit Auth pattern: const { user, isAuthenticated } = useAuth()
✅ ALWAYS use Times New Roman for headlines with font-serif class

📁 SSELFIE STUDIO FILE STRUCTURE:
- client/src/pages/ - Page components (landing.tsx, workspace.tsx, etc.)
- client/src/components/ - Reusable components
- client/src/components/ui/ - shadcn/ui components
- client/src/hooks/ - Custom hooks (use-auth.ts, etc.)
- client/src/lib/ - Utilities (queryClient.ts, etc.)
- server/ - Express backend
- server/routes.ts - API endpoints
- shared/schema.ts - Database schema with Drizzle ORM
- shared/ - Shared types and utilities

SSELFIE STUDIO DESIGN SYSTEM:
- **Colors**: Black (#0a0a0a), White (#ffffff), Editorial Gray (#f5f5f5) ONLY
- **Typography**: Times New Roman for headlines, system fonts for UI
- **Headlines**: font-serif text-6xl uppercase tracking-wide
- **Buttons**: border-black text-black hover:bg-black hover:text-white
- **Layout**: Editorial magazine style with generous whitespace
- **NO ICONS**: Use text/symbols instead of Lucide icons

🔧 CORRECT COMPONENT TEMPLATE:
\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function ComponentName() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      <h1 
        className="text-6xl font-serif text-black uppercase tracking-wide" 
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        Headline Text
      </h1>
      <Button 
        className="border-black text-black hover:bg-black hover:text-white"
      >
        Action Button
      </Button>
    </div>
  );
}
\`\`\`

📡 SSELFIE STUDIO API PATTERNS:
- useQuery({ queryKey: ['/api/endpoint'] }) for GET requests
- useMutation with apiRequest('POST', '/api/endpoint', data) for mutations
- Authentication via Replit Auth: req.isAuthenticated() in server routes
- Database queries via Drizzle ORM in server/routes.ts
- User access via const { user } = useAuth() in components

🎯 BUSINESS CONTEXT:
- Individual AI model training for each user (€67/month)
- Luxury personal branding platform for female entrepreneurs
- Sandra's admin email: ssa@ssasocial.com (admin access)
- Times New Roman typography = editorial luxury brand identity
- No Lucide icons = clean minimal design aesthetic
`;

export const getUpdatedInstructions = (agentRole: string) => {
  return SSELFIE_TECH_STANDARDS + `

🤖 AGENT-SPECIFIC ROLE: ${agentRole}
Follow all SSELFIE Studio technical standards above while executing your specialized role.
`;
};