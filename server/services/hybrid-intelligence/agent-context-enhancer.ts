/**
 * AGENT CONTEXT ENHANCER
 * Injects complete project awareness into every agent request
 * Makes agents understand the codebase like Replit AI agents
 */

import { IntelligentContextManager } from '../intelligent-context-manager';
import { UnifiedWorkspaceService } from '../unified-workspace-service';
import { AutonomousNavigationSystem } from '../autonomous-navigation-system';
import fs from 'fs/promises';
import path from 'path';

export interface EnhancedAgentContext {
  projectStructure: {
    frontend: string[];
    backend: string[];
    database: string[];
    config: string[];
  };
  existingComponents: Map<string, ComponentInfo>;
  liveAppRoutes: string[];
  userJourneyPaths: string[];
  recentChanges: string[];
  criticalFiles: string[];
  currentErrors: any[];
}

interface ComponentInfo {
  path: string;
  type: 'page' | 'component' | 'service' | 'hook' | 'util';
  imports: string[];
  exports: string[];
  usedIn: string[];
}

export class AgentContextEnhancer {
  private static instance: AgentContextEnhancer;
  private contextManager = IntelligentContextManager.getInstance();
  private workspaceService = UnifiedWorkspaceService.getInstance();
  private navigationSystem = AutonomousNavigationSystem.getInstance();
  private projectCache: EnhancedAgentContext | null = null;
  private lastCacheUpdate = 0;
  private cacheTimeout = 60000; // 1 minute cache

  private constructor() {}

  public static getInstance(): AgentContextEnhancer {
    if (!AgentContextEnhancer.instance) {
      AgentContextEnhancer.instance = new AgentContextEnhancer();
    }
    return AgentContextEnhancer.instance;
  }

  /**
   * ENHANCE AGENT REQUEST WITH FULL PROJECT AWARENESS
   * This is what makes agents understand the codebase
   */
  async enhanceAgentRequest(
    message: string, 
    agentId: string, 
    conversationId: string
  ): Promise<{
    enhancedMessage: string;
    relevantContext: string;
    suggestedFiles: string[];
    existingRelatedCode: string[];
  }> {
    console.log(`🧠 CONTEXT ENHANCER: Injecting project awareness for ${agentId}`);

    // Get or refresh project context
    const context = await this.getProjectContext();
    
    // Analyze the message intent
    const intent = this.analyzeMessageIntent(message);
    
    // Find relevant existing code
    const relevantFiles = await this.findRelevantExistingCode(message, intent, context);
    
    // Check for current errors that might be related
    const relatedErrors = await this.checkRelatedErrors(relevantFiles);
    
    // Build enhanced context for the agent
    const enhancedContext = this.buildEnhancedContext(
      message,
      intent,
      context,
      relevantFiles,
      relatedErrors
    );

    return {
      enhancedMessage: this.enhanceMessage(message, enhancedContext),
      relevantContext: enhancedContext,
      suggestedFiles: relevantFiles.slice(0, 5),
      existingRelatedCode: await this.getCodeSnippets(relevantFiles.slice(0, 3))
    };
  }

  /**
   * GET PROJECT CONTEXT WITH CACHING
   */
  private async getProjectContext(): Promise<EnhancedAgentContext> {
    const now = Date.now();
    if (this.projectCache && (now - this.lastCacheUpdate) < this.cacheTimeout) {
      return this.projectCache;
    }

    console.log('📊 Building comprehensive project context...');
    
    // Build project structure awareness
    const projectStructure = await this.buildProjectStructure();
    
    // Map existing components
    const existingComponents = await this.mapExistingComponents();
    
    // Identify live app routes
    const liveAppRoutes = await this.identifyLiveAppRoutes();
    
    // Map user journey paths
    const userJourneyPaths = await this.mapUserJourneyPaths();
    
    // Get recent changes
    const recentChanges = await this.getRecentChanges();
    
    // Identify critical files
    const criticalFiles = await this.identifyCriticalFiles();
    
    // Check current errors
    const currentErrors = await this.getCurrentErrors();

    this.projectCache = {
      projectStructure,
      existingComponents,
      liveAppRoutes,
      userJourneyPaths,
      recentChanges,
      criticalFiles,
      currentErrors
    };
    
    this.lastCacheUpdate = now;
    return this.projectCache;
  }

  /**
   * ANALYZE MESSAGE INTENT
   */
  private analyzeMessageIntent(message: string): {
    action: 'create' | 'modify' | 'fix' | 'analyze' | 'implement';
    target: string;
    location?: string;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Detect action
    let action: 'create' | 'modify' | 'fix' | 'analyze' | 'implement' = 'analyze';
    if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('build')) {
      action = 'create';
    } else if (lowerMessage.includes('fix') || lowerMessage.includes('debug') || lowerMessage.includes('error')) {
      action = 'fix';
    } else if (lowerMessage.includes('modify') || lowerMessage.includes('update') || lowerMessage.includes('change')) {
      action = 'modify';
    } else if (lowerMessage.includes('implement') || lowerMessage.includes('integrate')) {
      action = 'implement';
    }
    
    // Extract target (what they want to work on)
    const targetMatch = message.match(/(?:create|add|fix|modify|update|build|implement)\s+(?:a\s+)?(\w+(?:\s+\w+)?)/i);
    const target = targetMatch ? targetMatch[1] : 'component';
    
    // Extract location if specified
    const locationMatch = message.match(/(?:in|at|to|inside|within)\s+([\/\w-]+)/i);
    const location = locationMatch ? locationMatch[1] : undefined;
    
    return { action, target, location };
  }

  /**
   * FIND RELEVANT EXISTING CODE
   */
  private async findRelevantExistingCode(
    message: string,
    intent: any,
    context: EnhancedAgentContext
  ): Promise<string[]> {
    const relevantFiles: Set<string> = new Set();
    
    // If location specified, check if it exists
    if (intent.location) {
      const possiblePaths = [
        intent.location,
        `client/src/${intent.location}`,
        `server/${intent.location}`,
        `admin/${intent.location}`
      ];
      
      for (const path of possiblePaths) {
        try {
          const stats = await fs.stat(path);
          if (stats.isDirectory()) {
            const files = await fs.readdir(path);
            files.forEach(f => relevantFiles.add(`${path}/${f}`));
          } else {
            relevantFiles.add(path);
          }
        } catch (e) {
          // Path doesn't exist, continue
        }
      }
    }
    
    // Find components by type
    if (intent.target.includes('button') || intent.target.includes('component')) {
      context.existingComponents.forEach((info, path) => {
        if (info.type === 'component' && path.toLowerCase().includes(intent.target.toLowerCase())) {
          relevantFiles.add(path);
        }
      });
    }
    
    // Find pages if working on pages
    if (intent.target.includes('page') || intent.location?.includes('pages')) {
      context.existingComponents.forEach((info, path) => {
        if (info.type === 'page') {
          relevantFiles.add(path);
        }
      });
    }
    
    // Add critical files if fixing errors
    if (intent.action === 'fix') {
      context.criticalFiles.forEach(f => relevantFiles.add(f));
    }
    
    return Array.from(relevantFiles);
  }

  /**
   * BUILD PROJECT STRUCTURE
   */
  private async buildProjectStructure(): Promise<any> {
    return {
      frontend: [
        'client/src/App.tsx',
        'client/src/pages/',
        'client/src/components/',
        'client/src/hooks/',
        'client/src/lib/'
      ],
      backend: [
        'server/index.ts',
        'server/routes/',
        'server/services/',
        'server/db.ts'
      ],
      database: [
        'shared/schema.ts',
        'drizzle.config.ts'
      ],
      config: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts'
      ]
    };
  }

  /**
   * MAP EXISTING COMPONENTS
   */
  private async mapExistingComponents(): Promise<Map<string, ComponentInfo>> {
    const components = new Map<string, ComponentInfo>();
    
    // Map known components
    const componentPaths = [
      { path: 'client/src/App.tsx', type: 'component' as const },
      { path: 'client/src/pages/Landing.tsx', type: 'page' as const },
      { path: 'client/src/pages/Home.tsx', type: 'page' as const },
      { path: 'admin/consulting-agents/index.tsx', type: 'page' as const },
      { path: 'admin/consulting-agents/test-button.tsx', type: 'component' as const }
    ];
    
    for (const { path, type } of componentPaths) {
      try {
        await fs.stat(path);
        components.set(path, {
          path,
          type,
          imports: [],
          exports: [],
          usedIn: []
        });
      } catch (e) {
        // File doesn't exist
      }
    }
    
    return components;
  }

  /**
   * IDENTIFY LIVE APP ROUTES
   */
  private async identifyLiveAppRoutes(): Promise<string[]> {
    return [
      '/',
      '/home',
      '/admin/consulting-agents',
      '/api/admin/agents/consulting-chat',
      '/api/auth/user'
    ];
  }

  /**
   * MAP USER JOURNEY PATHS
   */
  private async mapUserJourneyPaths(): Promise<string[]> {
    return [
      'Landing → Login → Home',
      'Admin → Consulting Agents → Chat',
      'User → Profile → Settings'
    ];
  }

  /**
   * GET RECENT CHANGES
   */
  private async getRecentChanges(): Promise<string[]> {
    // In a real implementation, this would check git or file modification times
    return [
      'server/services/replit-tools-direct.ts - Fixed path normalization',
      'admin/consulting-agents/test-button.tsx - Created test component'
    ];
  }

  /**
   * IDENTIFY CRITICAL FILES
   */
  private async identifyCriticalFiles(): Promise<string[]> {
    return [
      'client/src/App.tsx',
      'server/index.ts',
      'server/routes/consulting-agents-routes.ts',
      'shared/schema.ts'
    ];
  }

  /**
   * GET CURRENT ERRORS
   */
  private async getCurrentErrors(): Promise<any[]> {
    // Check for TypeScript errors
    try {
      const { replitTools } = await import('../replit-tools-direct');
      const diagnostics = await replitTools.getLatestLspDiagnostics({});
      return diagnostics.hasErrors ? [diagnostics.diagnostics] : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * CHECK RELATED ERRORS
   */
  private async checkRelatedErrors(files: string[]): Promise<any[]> {
    const errors = [];
    for (const file of files.slice(0, 3)) {
      try {
        const { replitTools } = await import('../replit-tools-direct');
        const diagnostics = await replitTools.getLatestLspDiagnostics({ file_path: file });
        if (diagnostics.hasErrors) {
          errors.push({ file, errors: diagnostics.diagnostics });
        }
      } catch (e) {
        // Continue
      }
    }
    return errors;
  }

  /**
   * GET CODE SNIPPETS
   */
  private async getCodeSnippets(files: string[]): Promise<string[]> {
    const snippets = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n').slice(0, 50);
        snippets.push(`// ${file}\n${lines.join('\n')}`);
      } catch (e) {
        // Continue
      }
    }
    return snippets;
  }

  /**
   * BUILD ENHANCED CONTEXT
   */
  private buildEnhancedContext(
    message: string,
    intent: any,
    context: EnhancedAgentContext,
    relevantFiles: string[],
    relatedErrors: any[]
  ): string {
    let enhancedContext = `
**PROJECT AWARENESS:**
- Working on: SSELFIE Studio (React/TypeScript/Node.js/PostgreSQL)
- Action requested: ${intent.action} ${intent.target}${intent.location ? ` in ${intent.location}` : ''}

**EXISTING CODE AWARENESS:**`;

    if (relevantFiles.length > 0) {
      enhancedContext += `
Found ${relevantFiles.length} relevant existing files:
${relevantFiles.slice(0, 5).map(f => `- ${f}`).join('\n')}`;
    } else if (intent.location) {
      enhancedContext += `
⚠️ Location "${intent.location}" does not exist yet. You may need to create it.`;
    }

    if (context.existingComponents.size > 0 && intent.target.includes('component')) {
      enhancedContext += `

**EXISTING COMPONENTS:**
${Array.from(context.existingComponents.entries())
  .filter(([_, info]) => info.type === 'component')
  .slice(0, 5)
  .map(([path]) => `- ${path}`)
  .join('\n')}`;
    }

    if (relatedErrors.length > 0) {
      enhancedContext += `

**⚠️ CURRENT ERRORS TO FIX:**
${relatedErrors.map(e => `- ${e.file}: ${e.errors}`).join('\n')}`;
    }

    enhancedContext += `

**IMPORTANT CONTEXT:**
- Use str_replace_based_edit_tool with "view" to check existing files first
- Use str_replace_based_edit_tool with "str_replace" to modify existing code
- Use str_replace_based_edit_tool with "create" only for new files
- Always verify no errors with get_latest_lsp_diagnostics after changes
- Check integration between frontend and backend components`;

    return enhancedContext;
  }

  /**
   * ENHANCE MESSAGE WITH CONTEXT
   */
  private enhanceMessage(originalMessage: string, context: string): string {
    return `${originalMessage}

${context}`;
  }
}