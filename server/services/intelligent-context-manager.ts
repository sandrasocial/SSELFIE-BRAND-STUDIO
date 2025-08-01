import { unifiedWorkspace, ProjectContext, IntentBasedQuery } from './unified-workspace-service';
import fs from 'fs/promises';
import path from 'path';

/**
 * INTELLIGENT CONTEXT MANAGER
 * Provides project structure awareness and intelligent file relationships
 * Eliminates the need for agents to specify exact file paths
 */

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

export interface AgentWorkContext {
  currentTask: string;
  relevantFiles: string[];
  suggestedActions: ContextualSuggestion[];
  projectAwareness: ProjectContext;
}

export class IntelligentContextManager {
  private static instance: IntelligentContextManager;
  private fileRelationships = new Map<string, FileRelationship>();
  private contextCache = new Map<string, any>();
  private projectRoot: string;

  private constructor() {
    this.projectRoot = process.cwd();
  }

  public static getInstance(): IntelligentContextManager {
    if (!IntelligentContextManager.instance) {
      IntelligentContextManager.instance = new IntelligentContextManager();
    }
    return IntelligentContextManager.instance;
  }

  /**
   * INTELLIGENT TASK ANALYSIS
   * Understands what files an agent needs based on their request
   */
  async analyzeAgentRequest(request: string, agentType?: string): Promise<AgentWorkContext> {
    console.log(`🧠 CONTEXT MANAGER: Analyzing request for ${agentType || 'agent'}`);

    const projectContext = await unifiedWorkspace.buildProjectContext();
    const relevantFiles = await this.findRelevantFiles(request);
    const suggestedActions = await this.generateActionSuggestions(request, relevantFiles);

    return {
      currentTask: request,
      relevantFiles,
      suggestedActions,
      projectAwareness: projectContext
    };
  }

  /**
   * SMART FILE DISCOVERY
   * Finds files based on semantic understanding of the request
   */
  async findRelevantFiles(request: string): Promise<string[]> {
    console.log('🔍 CONTEXT MANAGER: Finding relevant files');

    const keywords = this.extractKeywords(request);
    const intentQueries = this.generateIntentQueries(keywords, request);
    
    const allRelevantFiles: string[] = [];

    for (const query of intentQueries) {
      const result = await unifiedWorkspace.discoverFilesByIntent(query);
      if (result.success && Array.isArray(result.result)) {
        allRelevantFiles.push(...result.result.map(f => 
          typeof f === 'string' ? f : f.path || f.file || ''
        ).filter(Boolean));
      }
    }

    // Remove duplicates and rank by relevance
    const uniqueFiles = [...new Set(allRelevantFiles)];
    return this.rankFilesByRequestRelevance(uniqueFiles, request).slice(0, 10);
  }

  /**
   * PROJECT RELATIONSHIP ANALYSIS
   * Builds understanding of how files relate to each other
   */
  async buildFileRelationships(): Promise<void> {
    console.log('🔗 CONTEXT MANAGER: Building file relationships');

    const projectContext = await unifiedWorkspace.buildProjectContext();
    const allFiles = [
      ...projectContext.structure.frontend,
      ...projectContext.structure.backend,
      ...projectContext.structure.shared
    ];

    for (const file of allFiles) {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const relationship = await this.analyzeFileRelationships(file);
        if (relationship) {
          this.fileRelationships.set(file, relationship);
        }
      }
    }
  }

  /**
   * CONTEXTUAL ACTION SUGGESTIONS
   * Suggests what actions an agent should take based on their request
   */
  async generateActionSuggestions(request: string, relevantFiles: string[]): Promise<ContextualSuggestion[]> {
    console.log('💡 CONTEXT MANAGER: Generating action suggestions');

    const suggestions: ContextualSuggestion[] = [];
    const requestLower = request.toLowerCase();

    // Implementation requests
    if (this.isImplementationRequest(requestLower)) {
      suggestions.push({
        action: 'view',
        files: relevantFiles.filter(f => this.isMainImplementationFile(f)),
        reason: 'Review existing implementation before making changes',
        confidence: 0.9
      });

      if (requestLower.includes('create') || requestLower.includes('new')) {
        suggestions.push({
          action: 'create',
          files: this.suggestNewFileNames(request, relevantFiles),
          reason: 'Create new files based on request',
          confidence: 0.8
        });
      } else {
        suggestions.push({
          action: 'edit',
          files: relevantFiles.slice(0, 3),
          reason: 'Modify existing files to implement changes',
          confidence: 0.85
        });
      }
    }

    // Analysis requests
    if (this.isAnalysisRequest(requestLower)) {
      suggestions.push({
        action: 'search',
        files: [],
        reason: 'Search codebase to understand current implementation',
        confidence: 0.9
      });
      
      suggestions.push({
        action: 'view',
        files: relevantFiles,
        reason: 'Examine relevant files for analysis',
        confidence: 0.8
      });
    }

    // Debug requests
    if (this.isDebugRequest(requestLower)) {
      suggestions.push({
        action: 'view',
        files: this.findErrorProneFiles(relevantFiles),
        reason: 'Check files likely to contain the issue',
        confidence: 0.85
      });
    }

    return suggestions.filter(s => s.files.length > 0);
  }

  /**
   * ADAPTIVE LEARNING
   * Learns from agent behavior to improve suggestions
   */
  async learnFromAgentAction(agentType: string, request: string, actionTaken: string, success: boolean): Promise<void> {
    console.log(`📚 CONTEXT MANAGER: Learning from ${agentType} action`);

    const learningKey = `${agentType}_${this.hashString(request)}`;
    const currentLearning = this.contextCache.get(learningKey) || { successCount: 0, failCount: 0, patterns: [] };

    if (success) {
      currentLearning.successCount++;
      currentLearning.patterns.push(actionTaken);
    } else {
      currentLearning.failCount++;
    }

    this.contextCache.set(learningKey, currentLearning);
  }

  // PRIVATE HELPER METHODS

  private extractKeywords(request: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return request
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10);
  }

  private generateIntentQueries(keywords: string[], request: string): IntentBasedQuery[] {
    const queries: IntentBasedQuery[] = [];

    // Technical intent queries
    if (keywords.some(k => ['auth', 'login', 'session', 'user'].includes(k))) {
      queries.push({
        intent: 'authentication system',
        context: 'user authentication and session management',
        expectedResults: ['auth files', 'login components', 'session handlers']
      });
    }

    if (keywords.some(k => ['api', 'route', 'endpoint', 'server'].includes(k))) {
      queries.push({
        intent: 'api routes and server endpoints',
        context: 'backend API implementation',
        expectedResults: ['route files', 'API handlers', 'server configuration']
      });
    }

    if (keywords.some(k => ['component', 'ui', 'interface', 'page'].includes(k))) {
      queries.push({
        intent: 'UI components and pages',
        context: 'frontend user interface',
        expectedResults: ['React components', 'page files', 'UI elements']
      });
    }

    if (keywords.some(k => ['database', 'schema', 'model', 'data'].includes(k))) {
      queries.push({
        intent: 'database schema and data models',
        context: 'data layer and database operations',
        expectedResults: ['schema files', 'database models', 'data utilities']
      });
    }

    // Fallback: general query
    if (queries.length === 0) {
      queries.push({
        intent: keywords.join(' '),
        context: request,
        expectedResults: ['relevant files']
      });
    }

    return queries;
  }

  private async analyzeFileRelationships(filePath: string): Promise<FileRelationship | null> {
    try {
      const content = await fs.readFile(path.resolve(this.projectRoot, filePath), 'utf-8');
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);
      const type = this.determineFileType(filePath, content);

      return {
        file: filePath,
        relatedFiles: imports,
        dependencies: imports.filter(imp => !imp.startsWith('.')),
        importedBy: [], // Will be populated in a second pass
        type
      };
    } catch {
      return null;
    }
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  private determineFileType(filePath: string, content: string): FileRelationship['type'] {
    if (filePath.includes('/pages/') || filePath.includes('/routes/')) return 'page';
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/services/') || filePath.includes('/api/')) return 'service';
    if (filePath.includes('/types/') || content.includes('interface ') || content.includes('type ')) return 'type';
    if (filePath.includes('config') || filePath.endsWith('.config.ts')) return 'config';
    return 'util';
  }

  private rankFilesByRequestRelevance(files: string[], request: string): string[] {
    const requestLower = request.toLowerCase();
    const keywords = this.extractKeywords(request);

    return files.sort((a, b) => {
      const aScore = this.calculateRequestRelevanceScore(a, requestLower, keywords);
      const bScore = this.calculateRequestRelevanceScore(b, requestLower, keywords);
      return bScore - aScore;
    });
  }

  private calculateRequestRelevanceScore(file: string, request: string, keywords: string[]): number {
    let score = 0;
    const fileName = file.toLowerCase();

    // Direct keyword matches
    keywords.forEach(keyword => {
      if (fileName.includes(keyword)) score += 10;
    });

    // File type relevance
    if (request.includes('component') && fileName.includes('component')) score += 15;
    if (request.includes('api') && fileName.includes('route')) score += 15;
    if (request.includes('auth') && fileName.includes('auth')) score += 20;
    if (request.includes('database') && fileName.includes('schema')) score += 20;

    // Recent file priority (simplified - would need actual file modification times)
    if (fileName.includes('admin') || fileName.includes('agent')) score += 5;

    return score;
  }

  private isImplementationRequest(request: string): boolean {
    const implementationKeywords = [
      'implement', 'create', 'build', 'add', 'develop', 'code', 'write',
      'generate', 'make', 'setup', 'configure', 'fix', 'update', 'modify'
    ];
    return implementationKeywords.some(keyword => request.includes(keyword));
  }

  private isAnalysisRequest(request: string): boolean {
    const analysisKeywords = [
      'analyze', 'review', 'examine', 'check', 'understand', 'explain',
      'find', 'locate', 'search', 'investigate', 'identify', 'assess'
    ];
    return analysisKeywords.some(keyword => request.includes(keyword));
  }

  private isDebugRequest(request: string): boolean {
    const debugKeywords = [
      'debug', 'fix', 'error', 'issue', 'problem', 'bug', 'broken',
      'not working', 'fails', 'crash', 'exception'
    ];
    return debugKeywords.some(keyword => request.includes(keyword));
  }

  private isMainImplementationFile(file: string): boolean {
    const mainPatterns = ['index.', 'main.', 'app.', 'routes.', 'server.'];
    return mainPatterns.some(pattern => file.toLowerCase().includes(pattern));
  }

  private suggestNewFileNames(request: string, existingFiles: string[]): string[] {
    const suggestions: string[] = [];
    const requestLower = request.toLowerCase();

    if (requestLower.includes('component')) {
      suggestions.push('client/src/components/NewComponent.tsx');
    }
    if (requestLower.includes('page')) {
      suggestions.push('client/src/pages/new-page.tsx');
    }
    if (requestLower.includes('service')) {
      suggestions.push('server/services/new-service.ts');
    }
    if (requestLower.includes('api') || requestLower.includes('route')) {
      suggestions.push('server/routes/new-routes.ts');
    }

    return suggestions;
  }

  private findErrorProneFiles(files: string[]): string[] {
    // Prioritize files that commonly contain errors
    return files.sort((a, b) => {
      const aScore = this.getErrorProneScore(a);
      const bScore = this.getErrorProneScore(b);
      return bScore - aScore;
    }).slice(0, 5);
  }

  private getErrorProneScore(file: string): number {
    let score = 0;
    if (file.includes('routes.')) score += 10;
    if (file.includes('api/')) score += 8;
    if (file.includes('auth')) score += 8;
    if (file.includes('database') || file.includes('db.')) score += 7;
    if (file.includes('index.')) score += 5;
    return score;
  }

  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

// Export singleton instance
export const intelligentContext = IntelligentContextManager.getInstance();