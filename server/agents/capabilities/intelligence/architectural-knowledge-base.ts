/**
 * CONSOLIDATED ARCHITECTURAL INTELLIGENCE SYSTEM
 * Combines all intelligence capabilities: knowledge base, tool usage, codebase analysis, and predictions
 * Provides agents with comprehensive understanding of SSELFIE Studio structure and intelligent behaviors
 * Consolidated from: agent-tool-usage-intelligence, codebase-understanding-intelligence, predictive-intelligence-system
 */

// =============================================================================
// TOOL USAGE INTELLIGENCE (from agent-tool-usage-intelligence.ts)
// =============================================================================

export interface ToolUsagePattern {
  trigger: string[];
  tool: string;
  example: string;
  reasoning: string;
}

export const AGENT_TOOL_INTELLIGENCE = {
  IMMEDIATE_ACTION_PATTERNS: [
    {
      trigger: ['create', 'build', 'make', 'generate', 'add'],
      tool: 'str_replace_based_edit_tool',
      example: 'Create a new landing page',
      reasoning: 'User wants something built - use tools immediately like Replit AI'
    },
    {
      trigger: ['modify', 'update', 'change', 'fix', 'edit', 'improve'],
      tool: 'str_replace_based_edit_tool', 
      example: 'Fix the admin dashboard',
      reasoning: 'User wants changes made - make them directly like Replit AI'
    },
    {
      trigger: ['show me', 'let me see', 'view the', 'display'],
      tool: 'str_replace_based_edit_tool',
      example: 'Show me the navigation code',
      reasoning: 'User wants to see code - view files immediately'
    },
    {
      trigger: ['find', 'locate', 'where is', 'search for'],
      tool: 'search_filesystem',
      example: 'Find all navigation components',
      reasoning: 'User needs location info - search immediately'
    },
    {
      trigger: ['test', 'run', 'check', 'verify', 'build'],
      tool: 'bash',
      example: 'Test the application',
      reasoning: 'User wants functionality tested - run commands'
    }
  ]
};

// =============================================================================
// CODEBASE ANALYSIS INTELLIGENCE (from codebase-understanding-intelligence.ts)
// =============================================================================

export interface FileAnalysis {
  path: string;
  type: 'component' | 'page' | 'api' | 'utility' | 'config' | 'data' | 'test' | 'other';
  size: number;
  language: string;
  dependencies: string[];
  exports: string[];
  imports: string[];
  functions: string[];
  classes: string[];
  interfaces: string[];
  lastModified: Date;
  complexity: 'low' | 'medium' | 'high';
  businessCritical: boolean;
}

// =============================================================================
// PREDICTIVE INTELLIGENCE (from predictive-intelligence-system.ts)
// =============================================================================

export interface PredictiveInsight {
  type: 'NEXT_TASK' | 'WORKFLOW_SUGGESTION' | 'AGENT_RECOMMENDATION' | 'PROACTIVE_ACTION';
  confidence: number;
  suggestion: string;
  reasoning: string;
  agentId?: string;
  estimatedTime?: string;
  requiredTools?: string[];
}

// =============================================================================
// PROJECT ARCHITECTURE KNOWLEDGE
// =============================================================================

export const SSELFIE_ARCHITECTURE = {
  // PROJECT STRUCTURE
  structure: {
    frontend: {
      location: 'client/',
      framework: 'React 18 with TypeScript',
      routing: 'Wouter',
      state: 'TanStack Query v5',
      styling: 'Tailwind CSS with luxury design tokens',
      pages: [
        'landing.tsx - Public landing page',
        'home.tsx - Authenticated home',
        'admin-dashboard.tsx - Admin control panel',
        'admin-consulting-agents.tsx - Agent management',
        'selfie-studio.tsx - AI photo generation',
        'training.tsx - Model training interface'
      ],
      keyComponents: [
        'AgentInterface.tsx - Main agent chat UI',
        'NavigationMenu.tsx - App navigation',
        'StripeCheckout.tsx - Payment processing',
        'ImageGallery.tsx - Photo display'
      ]
    },
    
    backend: {
      location: 'server/',
      framework: 'Express.js with TypeScript',
      database: 'PostgreSQL with Drizzle ORM',
      auth: 'Passport.js with Replit OAuth',
      keyFiles: [
        'routes.ts - Main route registration',
        'consulting-agents-routes.ts - Agent endpoints',
        'claude-api-service-simple.ts - Claude integration',
        'agent-personalities-consulting.ts - Agent configs'
      ],
      apiPattern: '/api/* endpoints'
    },
    
    shared: {
      location: 'shared/',
      purpose: 'Shared types and database schemas',
      mainFile: 'schema.ts - Drizzle ORM models',
      tables: [
        'users - User accounts',
        'claudeConversations - Agent conversations',
        'claudeMessages - Chat messages',
        'trainings - AI model training',
        'generations - Image generations'
      ]
    }
  },
  
  // IMPORT CONVENTIONS
  imports: {
    fromClient: {
      components: "import { Component } from '@/components/Component'",
      hooks: "import { useHook } from '@/hooks/useHook'",
      pages: "import { Page } from '@/pages/Page'"
    },
    fromServer: {
      services: "import { service } from '../services/service.js'",
      db: "import { db } from '../db.js'",
      note: "ALWAYS use .js extension in server imports"
    },
    fromShared: {
      schema: "import { table, type Type } from '@shared/schema'"
    }
  },
  
  // FILE MODIFICATION RULES
  modificationRules: {
    critical: [
      'ALWAYS modify existing files when asked',
      'NEVER create duplicate "redesigned" versions',
      'Search for existing components first',
      'Maintain import consistency',
      'Preserve existing functionality'
    ],
    
    workflow: [
      '1. Search for the requested file',
      '2. View current implementation',
      '3. Make targeted modifications',
      '4. Verify imports and exports',
      '5. Check for breaking changes'
    ]
  },
  
  // COMMON PATTERNS
  patterns: {
    apiEndpoint: {
      location: 'server/routes/',
      pattern: 'router.post("/api/endpoint", async (req, res) => { ... })'
    },
    
    reactComponent: {
      location: 'client/src/components/',
      pattern: 'export function ComponentName() { return <div>...</div> }'
    },
    
    dbQuery: {
      example: 'await db.select().from(table).where(eq(table.field, value))'
    },
    
    authentication: {
      check: 'isAuthenticated middleware',
      user: 'req.user.claims.sub'
    }
  },
  
  // DESIGN SYSTEM
  design: {
    colors: {
      primary: '#0a0a0a (luxury black)',
      secondary: '#fefefe (pure white)',
      accent: '#f5f5f5 (editorial gray)'
    },
    typography: {
      headlines: 'Times New Roman',
      body: 'System fonts (-apple-system, BlinkMacSystemFont)'
    },
    rules: [
      'No rounded corners (border-radius: 0)',
      'Generous whitespace',
      'Magazine-quality layouts',
      'Minimalist approach'
    ]
  }
};

/**
 * Get architectural context for agents
 */
export function getArchitecturalContext(): string {
  return `
SSELFIE STUDIO ARCHITECTURE:
- Frontend: React + TypeScript in client/ folder
- Backend: Express + TypeScript in server/ folder  
- Database: PostgreSQL with Drizzle ORM
- Shared: Types and schemas in shared/schema.ts
- Imports: Use @/ aliases in client, .js extensions in server
- CRITICAL: Modify existing files, don't create duplicates
`;
}

/**
 * Validate file placement
 */
export function validateFilePlacement(filePath: string, fileType: string): boolean {
  const rules = {
    component: filePath.includes('client/src/components/'),
    page: filePath.includes('client/src/pages/'),
    api: filePath.includes('server/routes/'),
    service: filePath.includes('server/services/'),
    schema: filePath.includes('shared/')
  };
  
  return rules[fileType as keyof typeof rules] || false;
}

/**
 * Get import pattern for file location
 */
export function getImportPattern(fromPath: string, toPath: string): string {
  if (fromPath.includes('client/') && toPath.includes('client/src/components/')) {
    return `import { Component } from '@/components/ComponentName'`;
  }
  if (fromPath.includes('server/') && toPath.includes('server/')) {
    return `import { module } from '../path/to/module.js' // Note: .js extension required`;
  }
  if (toPath.includes('shared/')) {
    return `import { type } from '@shared/schema'`;
  }
  return 'Standard relative import';
}