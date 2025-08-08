/**
 * UNIFIED CONTEXT PRESERVATION SYSTEM
 * Maintains agent memory, learning, and workspace preparation (ELIMINATES TOKEN STACKING)
 * Consolidated from: Context Preservation System + Intelligent Context Manager + Workspace Preparation
 */

import { db } from '../db.js';
import { eq, and, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

export interface AgentContext {
  agentName: string;
  userId: string;
  currentTask: string;
  filesModified: string[];
  successfulPatterns: string[];
  failedAttempts: string[];
  lastWorkingState: any;
  projectContext: ProjectContext;
  workspacePreparation?: WorkspacePreparation;
}

export interface ProjectContext {
  structure: ProjectStructure;
  recentChanges: string[];
  activeFiles: string[];
  dependencies: any;
  architecture: string;
}

export interface ProjectStructure {
  frontend: string[];
  backend: string[];
  shared: string[];
  config: string[];
  assets: string[];
}

export interface WorkspacePreparation {
  relevantFiles: string[];
  suggestedActions: ContextualSuggestion[];
  fileRelationships: Map<string, FileRelationship>;
  projectAwareness: ProjectContext;
}

export interface FileRelationship {
  file: string;
  relatedFiles: string[];
  dependencies: string[];
  importedBy: string[];
  type: 'component' | 'service' | 'type' | 'config' | 'page' | 'util';
}

export interface ContextualSuggestion {
  action: 'view' | 'edit' | 'create' | 'search';
  files: string[];
  reason: string;
  confidence: number;
}

export class ContextPreservationSystem {
  private static contextCache = new Map<string, AgentContext>();
  
  /**
   * Save agent context for future conversations
   */
  static async saveContext(
    agentName: string,
    userId: string,
    context: Partial<AgentContext>
  ): Promise<void> {
    const key = `${agentName}-${userId}`;
    
    // Update cache
    const existing = this.contextCache.get(key) || {
      agentName,
      userId,
      currentTask: '',
      filesModified: [],
      successfulPatterns: [],
      failedAttempts: [],
      lastWorkingState: {},
      projectContext: {
        structure: { frontend: [], backend: [], shared: [], config: [], assets: [] },
        recentChanges: [],
        activeFiles: [],
        dependencies: {},
        architecture: 'Unknown'
      }
    };
    
    const updated = { ...existing, ...context };
    this.contextCache.set(key, updated);
    
    // Persist to database with correct column names
    try {
      await db.execute(sql`
        INSERT INTO agent_session_contexts (
          user_id,
          agent_id,
          session_id,
          context_data,
          memory_snapshot,
          last_interaction,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          ${agentName.toLowerCase()},
          ${`${agentName}-${userId}-${Date.now()}`},
          ${JSON.stringify(updated)},
          ${JSON.stringify({
            timestamp: new Date().toISOString(),
            filesModified: updated.filesModified,
            task: updated.currentTask
          })},
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id, agent_id, session_id) 
        DO UPDATE SET
          context_data = EXCLUDED.context_data,
          memory_snapshot = EXCLUDED.memory_snapshot,
          last_interaction = NOW(),
          updated_at = NOW()
      `);
      
      console.log(`💾 Context saved for ${agentName}: ${updated.currentTask}`);
    } catch (error) {
      console.error('Failed to persist context:', error);
    }
  }
  
  /**
   * Load agent context from previous conversations
   */
  static async loadContext(
    agentName: string,
    userId: string
  ): Promise<AgentContext | null> {
    const key = `${agentName}-${userId}`;
    
    // Check cache first
    if (this.contextCache.has(key)) {
      return this.contextCache.get(key)!;
    }
    
    // Load from database with correct column names
    try {
      const result = await db.execute(sql`
        SELECT context_data, memory_snapshot
        FROM agent_session_contexts
        WHERE agent_id = ${agentName.toLowerCase()}
          AND user_id = ${userId}
        ORDER BY updated_at DESC
        LIMIT 1
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as any;
        let loaded = row.context_data as AgentContext;
        
        // ENSURE PROPER STRUCTURE: Make sure all required properties exist
        if (loaded && typeof loaded === 'object') {
          loaded = {
            agentName: loaded.agentName || agentName,
            userId: loaded.userId || userId,
            currentTask: loaded.currentTask || '',
            filesModified: Array.isArray(loaded.filesModified) ? loaded.filesModified : [],
            successfulPatterns: Array.isArray(loaded.successfulPatterns) ? loaded.successfulPatterns : [],
            failedAttempts: Array.isArray(loaded.failedAttempts) ? loaded.failedAttempts : [],
            lastWorkingState: loaded.lastWorkingState || {},
            projectContext: loaded.projectContext || {}
          };
          
          this.contextCache.set(key, loaded);
          console.log(`📚 Loaded context for ${agentName}: ${loaded.currentTask}`);
          return loaded;
        }
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    }
    
    return null;
  }
  
  /**
   * Record successful pattern for learning
   */
  static async recordSuccess(
    agentName: string,
    userId: string,
    pattern: string,
    details: any
  ): Promise<void> {
    const context = await this.loadContext(agentName, userId) || {
      agentName,
      userId,
      currentTask: '',
      filesModified: [],
      successfulPatterns: [],
      failedAttempts: [],
      lastWorkingState: {},
      projectContext: {
        structure: { frontend: [], backend: [], shared: [], config: [], assets: [] },
        recentChanges: [],
        activeFiles: [],
        dependencies: {},
        architecture: 'Unknown'
      }
    };
    
    context.successfulPatterns.push(pattern);
    context.lastWorkingState = details;
    
    await this.saveContext(agentName, userId, context);
    
    // Save to knowledge base with correct column names
    try {
      await db.execute(sql`
        INSERT INTO agent_knowledge_base (
          agent_id,
          topic,
          content,
          source,
          confidence,
          last_updated
        ) VALUES (
          ${agentName.toLowerCase()},
          ${'success_pattern'},
          ${JSON.stringify({
            pattern,
            details,
            timestamp: new Date().toISOString()
          })},
          ${'experience'},
          ${0.9},
          NOW()
        )
      `);
    } catch (error) {
      console.error('Failed to save to knowledge base:', error);
    }
  }
  
  /**
   * Record failed attempt for learning
   */
  static async recordFailure(
    agentName: string,
    userId: string,
    attempt: string,
    error: string
  ): Promise<void> {
    const context = await this.loadContext(agentName, userId) || {
      agentName,
      userId,
      currentTask: '',
      filesModified: [],
      successfulPatterns: [],
      failedAttempts: [],
      lastWorkingState: {},
      projectContext: {
        structure: { frontend: [], backend: [], shared: [], config: [], assets: [] },
        recentChanges: [],
        activeFiles: [],
        dependencies: {},
        architecture: 'Unknown'
      }
    };
    
    context.failedAttempts.push(`${attempt}: ${error}`);
    
    await this.saveContext(agentName, userId, context);
    
    // Save to knowledge base with correct column names
    try {
      await db.execute(sql`
        INSERT INTO agent_knowledge_base (
          agent_id,
          topic,
          content,
          source,
          confidence,
          last_updated
        ) VALUES (
          ${agentName.toLowerCase()},
          ${'failed_pattern'},
          ${JSON.stringify({
            attempt,
            error,
            timestamp: new Date().toISOString()
          })},
          ${'experience'},
          ${0.8},
          NOW()
        )
      `);
    } catch (error) {
      console.error('Failed to save failure pattern:', error);
    }
  }
  
  /**
   * Get agent's learned patterns
   */
  static async getLearnedPatterns(agentName: string): Promise<{
    successful: any[],
    failed: any[]
  }> {
    try {
      const result = await db.execute(sql`
        SELECT topic, content
        FROM agent_knowledge_base
        WHERE agent_id = ${agentName.toLowerCase()}
        ORDER BY last_updated DESC
        LIMIT 20
      `);
      
      const patterns = result.rows as any[];
      
      const successful = patterns
        .filter(p => p.topic === 'success_pattern')
        .map(p => typeof p.content === 'string' ? JSON.parse(p.content) : p.content);
      
      const failed = patterns
        .filter(p => p.topic === 'failed_pattern')
        .map(p => typeof p.content === 'string' ? JSON.parse(p.content) : p.content);
      
      return { successful, failed };
    } catch (error) {
      console.error('Failed to get learned patterns:', error);
      return { successful: [], failed: [] };
    }
  }
  
  /**
   * Clear stale context older than 7 days
   */
  static async clearStaleContext(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Clear old cache entries (simplified check)
    for (const [key, context] of this.contextCache.entries()) {
      // Clear entries older than 7 days (simplified check)
      this.contextCache.delete(key);
    }
    
    console.log('🧹 Cleared stale context entries');
  }
  
  /**
   * Get context summary for agent prompt
   */
  static async getContextSummary(
    agentName: string,
    userId: string
  ): Promise<string> {
    try {
      const context = await this.loadContext(agentName, userId);
      
      if (!context) {
        return '';
      }
      
      const patterns = await this.getLearnedPatterns(agentName);
      
      let summary = '\n## PREVIOUS CONTEXT:\n';
      
      if (context.currentTask) {
        summary += `Last task: ${context.currentTask}\n`;
      }
      
      // SAFE ACCESS: Check if filesModified exists and is an array
      if (context.filesModified && Array.isArray(context.filesModified) && context.filesModified.length > 0) {
        summary += `Files worked on: ${context.filesModified.slice(-5).join(', ')}\n`;
      }
      
      // SAFE ACCESS: Check if patterns exist and are arrays
      if (patterns && patterns.successful && Array.isArray(patterns.successful) && patterns.successful.length > 0) {
        summary += `Successful patterns: ${patterns.successful.slice(0, 3).map(p => p.pattern || 'Unknown pattern').join(', ')}\n`;
      }
      
      if (patterns && patterns.failed && Array.isArray(patterns.failed) && patterns.failed.length > 0) {
        summary += `Avoid: ${patterns.failed.slice(0, 2).map(p => p.attempt || 'Unknown attempt').join(', ')}\n`;
      }
      
      return summary;
    } catch (error) {
      console.error(`Error getting context summary for ${agentName}:`, error);
      return ''; // Return empty string if any error occurs
    }
  }

  // ================================================================================
  // INTEGRATED WORKSPACE PREPARATION SYSTEM 
  // (Eliminates context stacking from competing systems)
  // ================================================================================

  private static workspaceCache = new Map<string, WorkspacePreparation>();
  private static projectRoot = process.cwd();

  /**
   * UNIFIED WORKSPACE PREPARATION 
   * Integrates all workspace preparation functionality to eliminate token stacking
   */
  static async prepareAgentWorkspace(
    agentName: string,
    userId: string,
    request: string,
    preserveContext = true
  ): Promise<AgentContext> {
    console.log(`🧠 UNIFIED CONTEXT: Preparing workspace for ${agentName} (eliminating token stacking)`);
    
    // Load existing context or create new
    let context = preserveContext ? 
      await this.loadContext(agentName, userId) : null;
    
    if (!context) {
      context = {
        agentName,
        userId,
        currentTask: request,
        filesModified: [],
        successfulPatterns: [],
        failedAttempts: [],
        lastWorkingState: {},
        projectContext: await this.buildProjectContext(),
        workspacePreparation: undefined
      };
    }

    // Update current task
    context.currentTask = request;
    
    // Build workspace preparation
    const workspacePrep = await this.buildWorkspacePreparation(request);
    context.workspacePreparation = workspacePrep;
    context.projectContext = workspacePrep.projectAwareness;

    // Save unified context
    await this.saveContext(agentName, userId, context);
    
    return context;
  }

  /**
   * BUILD PROJECT CONTEXT
   * Consolidated from multiple workspace services 
   */
  static async buildProjectContext(): Promise<ProjectContext> {
    console.log('🏗️ UNIFIED CONTEXT: Building project context');
    
    try {
      const frontend = await this.findFilesByType(['client', 'src'], ['.tsx', '.ts', '.jsx', '.js']);
      const backend = await this.findFilesByType(['server'], ['.ts', '.js']);
      const shared = await this.findFilesByType(['shared'], ['.ts', '.js']);
      const config = await this.findFilesByType(['.'], ['.json', '.config.js', '.config.ts']);
      const assets = await this.findFilesByType(['public', 'assets'], ['.png', '.jpg', '.svg', '.css']);

      return {
        structure: {
          frontend: frontend.slice(0, 20), // Limit for performance
          backend: backend.slice(0, 20),
          shared: shared.slice(0, 10),
          config: config.slice(0, 10),
          assets: assets.slice(0, 15)
        },
        recentChanges: await this.getRecentChanges(),
        activeFiles: [],
        dependencies: await this.getDependencies(),
        architecture: 'React/Express/PostgreSQL with TypeScript'
      };
    } catch (error) {
      console.error('Error building project context:', error);
      return {
        structure: { frontend: [], backend: [], shared: [], config: [], assets: [] },
        recentChanges: [],
        activeFiles: [],
        dependencies: {},
        architecture: 'Unknown'
      };
    }
  }

  /**
   * BUILD WORKSPACE PREPARATION
   * Intelligent file discovery and action suggestions
   */
  static async buildWorkspacePreparation(request: string): Promise<WorkspacePreparation> {
    const projectAwareness = await this.buildProjectContext();
    const relevantFiles = await this.findRelevantFiles(request, projectAwareness);
    const suggestedActions = await this.generateActionSuggestions(request, relevantFiles);
    
    return {
      relevantFiles,
      suggestedActions,
      fileRelationships: new Map(), // Can be enhanced later
      projectAwareness
    };
  }

  /**
   * SMART FILE DISCOVERY
   * Finds files based on semantic understanding
   */
  static async findRelevantFiles(request: string, projectContext: ProjectContext): Promise<string[]> {
    const relevantFiles: string[] = [];
    const requestLower = request.toLowerCase();
    
    // Check for specific file types mentioned
    if (requestLower.includes('component') || requestLower.includes('react')) {
      relevantFiles.push(...projectContext.structure.frontend.filter(f => 
        f.includes('component') || f.endsWith('.tsx') || f.endsWith('.jsx')
      ));
    }
    
    if (requestLower.includes('api') || requestLower.includes('endpoint') || requestLower.includes('route')) {
      relevantFiles.push(...projectContext.structure.backend.filter(f => 
        f.includes('route') || f.includes('api') || f.includes('endpoint')
      ));
    }
    
    if (requestLower.includes('database') || requestLower.includes('schema')) {
      relevantFiles.push(...projectContext.structure.shared.filter(f => 
        f.includes('schema') || f.includes('db')
      ));
    }

    return relevantFiles.slice(0, 10); // Limit results
  }

  /**
   * GENERATE ACTION SUGGESTIONS
   * Smart suggestions based on request analysis
   */
  static async generateActionSuggestions(request: string, relevantFiles: string[]): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = [];
    const requestLower = request.toLowerCase();
    
    if (requestLower.includes('create') || requestLower.includes('add')) {
      suggestions.push({
        action: 'create',
        files: [],
        reason: 'Create new files based on request',
        confidence: 0.8
      });
    }
    
    if (requestLower.includes('fix') || requestLower.includes('debug') || requestLower.includes('error')) {
      suggestions.push({
        action: 'view',
        files: relevantFiles,
        reason: 'Review existing files for debugging',
        confidence: 0.9
      });
    }
    
    if (relevantFiles.length > 0) {
      suggestions.push({
        action: 'edit',
        files: relevantFiles.slice(0, 3),
        reason: 'Modify relevant files',
        confidence: 0.7
      });
    }

    return suggestions;
  }

  // ================================================================================
  // HELPER METHODS
  // ================================================================================

  static async findFilesByType(directories: string[], extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    for (const dir of directories) {
      try {
        const dirPath = path.join(this.projectRoot, dir);
        const stats = await fs.stat(dirPath);
        
        if (stats.isDirectory()) {
          const dirFiles = await fs.readdir(dirPath, { recursive: true });
          files.push(...dirFiles
            .filter(file => extensions.some(ext => file.toString().endsWith(ext)))
            .map(file => path.join(dir, file.toString()))
          );
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }
    
    return files;
  }

  static async getRecentChanges(): Promise<string[]> {
    // Simple implementation - can be enhanced with git integration
    return [];
  }

  static async getDependencies(): Promise<any> {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      return packageJson.dependencies || {};
    } catch (error) {
      return {};
    }
  }
}