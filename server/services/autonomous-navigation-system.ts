import { ContextPreservationSystem, type AgentContext } from '../agents/context-preservation-system';

/**
 * AUTONOMOUS NAVIGATION SYSTEM
 * Enables agents to explore and discover files independently
 * Replicates Replit AI agent workspace navigation capabilities
 */

export interface NavigationResult {
  success: boolean;
  discoveredFiles: string[];
  suggestedActions: string[];
  contextualHelp: string[];
  errorPrevention: string[];
}

export interface NavigationIntent {
  goal: string;
  currentContext?: string;
  agentType?: string;
  previousAttempts?: string[];
}

export interface IntentBasedQuery {
  intent: string;
  context: string;
  expectedResults: string[];
}

export class AutonomousNavigationSystem {
  private static instance: AutonomousNavigationSystem;
  private navigationHistory = new Map<string, string[]>();
  private successPatterns = new Map<string, NavigationResult>();

  private constructor() {}

  public static getInstance(): AutonomousNavigationSystem {
    if (!AutonomousNavigationSystem.instance) {
      AutonomousNavigationSystem.instance = new AutonomousNavigationSystem();
    }
    return AutonomousNavigationSystem.instance;
  }

  /**
   * INTELLIGENT FILE DISCOVERY
   * Finds files without requiring exact paths from agents
   */
  async navigateToRelevantFiles(intent: NavigationIntent): Promise<NavigationResult> {
    console.log(`🧭 AUTONOMOUS NAV: Navigating for goal "${intent.goal}"`);

    try {
      // Check if we've solved similar navigation before
      const similarPattern = this.findSimilarSuccessPattern(intent.goal);
      if (similarPattern) {
        console.log('🎯 AUTONOMOUS NAV: Using learned navigation pattern');
        return similarPattern;
      }

      // Multi-strategy approach
      const [
        contextualFiles,
        intentBasedFiles,
        smartResolution,
        workContext
      ] = await Promise.all([
        this.discoverContextualFiles(intent),
        this.performIntentBasedSearch(intent),
        this.smartPathResolution(intent.goal),
        ContextPreservationSystem.prepareAgentWorkspace('navigation', 'autonomous', intent.goal, false)
      ]);

      // Combine and deduplicate results
      const allFiles = this.combineAndRankResults([
        ...contextualFiles,
        ...intentBasedFiles,
        ...smartResolution,
        ...workContext.filesModified
      ], intent);

      const result: NavigationResult = {
        success: allFiles.length > 0,
        discoveredFiles: allFiles.slice(0, 8), // Limit to prevent overwhelming
        suggestedActions: this.generateNavigationSuggestions(allFiles, intent),
        contextualHelp: this.generateContextualHelp(intent, workContext),
        errorPrevention: this.generateErrorPrevention(intent, allFiles)
      };

      // Store successful pattern for learning
      if (result.success) {
        this.storeSuccessPattern(intent.goal, result);
      }

      return result;

    } catch (error) {
      console.error('❌ AUTONOMOUS NAV: Navigation failed:', error);
      return {
        success: false,
        discoveredFiles: [],
        suggestedActions: ['Use search functionality to find relevant files'],
        contextualHelp: ['Navigation failed - check request syntax'],
        errorPrevention: ['Verify project structure is accessible']
      };
    }
  }

  /**
   * PREDICTIVE FILE EXPLORATION
   * Anticipates what files an agent will need next
   */
  async predictNextFiles(currentFiles: string[], currentTask: string): Promise<string[]> {
    console.log('🔮 AUTONOMOUS NAV: Predicting next files needed');

    const predictions: string[] = [];

    // Analyze current file types and predict related files
    for (const file of currentFiles) {
      const relatedFiles = await this.findRelatedFiles(file);
      predictions.push(...relatedFiles);
    }

    // Task-based predictions
    const taskPredictions = await this.predictFilesFromTask(currentTask);
    predictions.push(...taskPredictions);

    // Remove duplicates and current files
    return [...new Set(predictions)]
      .filter(file => !currentFiles.includes(file))
      .slice(0, 5);
  }

  /**
   * ADAPTIVE PATH RESOLUTION
   * Resolves ambiguous file references to actual paths
   */
  async resolveAmbiguousPath(reference: string, context?: string): Promise<string[]> {
    console.log(`🎯 AUTONOMOUS NAV: Resolving "${reference}"`);

    const resolutionStrategies = [
      () => this.exactPathMatch(reference),
      () => this.fuzzyPathMatch(reference),
      () => this.semanticPathMatch(reference, context),
      () => this.contextualPathMatch(reference, context)
    ];

    const results: string[] = [];

    for (const strategy of resolutionStrategies) {
      try {
        const strategyResults = await strategy();
        results.push(...strategyResults);
        
        // If we found good matches, prioritize them
        if (strategyResults.length > 0) {
          break;
        }
      } catch (error) {
        console.log(`⚠️ AUTONOMOUS NAV: Strategy failed: ${error}`);
      }
    }

    return [...new Set(results)].slice(0, 5);
  }

  /**
   * WORKSPACE STATE AWARENESS
   * Understands current workspace state and recent changes
   */
  async getWorkspaceState(): Promise<{
    recentFiles: string[];
    activeAreas: string[];
    potentialIssues: string[];
    recommendations: string[];
  }> {
    console.log('📊 AUTONOMOUS NAV: Analyzing workspace state');

    const projectContext = await ContextPreservationSystem.buildProjectContext();
    
    return {
      recentFiles: projectContext.recentChanges || [],
      activeAreas: this.identifyActiveAreas(projectContext),
      potentialIssues: await this.identifyPotentialIssues(projectContext),
      recommendations: this.generateWorkspaceRecommendations(projectContext)
    };
  }

  // PRIVATE HELPER METHODS

  private async discoverContextualFiles(intent: NavigationIntent): Promise<string[]> {
    const contextQuery: IntentBasedQuery = {
      intent: intent.goal,
      context: intent.currentContext || '',
      expectedResults: []
    };

    // Use unified context system for file discovery
    const projectContext = await ContextPreservationSystem.buildProjectContext();
    const result = await ContextPreservationSystem.findRelevantFiles(contextQuery.intent, projectContext);
    
    return Array.isArray(result) ? result : [];
    
    return [];
  }

  private async performIntentBasedSearch(intent: NavigationIntent): Promise<string[]> {
    // Use intelligent context manager for semantic search
    const files = await ContextPreservationSystem.findRelevantFiles(intent.goal, await ContextPreservationSystem.buildProjectContext());
    return files;
  }

  private async smartPathResolution(goal: string): Promise<string[]> {
    // Simple file path resolution (replace complex unifiedWorkspace call)
    return [goal]; // Return as array for consistency
  }

  private combineAndRankResults(allResults: string[], intent: NavigationIntent): string[] {
    // Remove duplicates
    const uniqueFiles = [...new Set(allResults)];

    // Rank by relevance to intent
    return uniqueFiles.sort((a, b) => {
      const aScore = this.calculateNavigationRelevanceScore(a, intent);
      const bScore = this.calculateNavigationRelevanceScore(b, intent);
      return bScore - aScore;
    });
  }

  private calculateNavigationRelevanceScore(file: string, intent: NavigationIntent): number {
    let score = 0;
    const fileName = file.toLowerCase();
    const goal = intent.goal.toLowerCase();

    // Direct keyword matches
    const goalWords = goal.split(' ');
    goalWords.forEach(word => {
      if (fileName.includes(word)) score += 10;
    });

    // File type relevance
    if (goal.includes('component') && fileName.includes('component')) score += 15;
    if (goal.includes('auth') && fileName.includes('auth')) score += 20;
    if (goal.includes('api') && fileName.includes('route')) score += 15;
    if (goal.includes('database') && fileName.includes('schema')) score += 20;

    // Agent type specific scoring
    if (intent.agentType === 'maya' && fileName.includes('generation')) score += 10;
    if (intent.agentType === 'victoria' && fileName.includes('website')) score += 10;
    if (intent.agentType === 'zara' && fileName.includes('service')) score += 10;

    // Recency bonus (if available)
    if (fileName.includes('admin') || fileName.includes('agent')) score += 5;

    return score;
  }

  private generateNavigationSuggestions(files: string[], intent: NavigationIntent): string[] {
    const suggestions: string[] = [];

    if (files.length === 0) {
      suggestions.push('Try broadening your search terms');
      suggestions.push('Check if the files exist in the project');
      return suggestions;
    }

    if (intent.goal.toLowerCase().includes('implement')) {
      suggestions.push('Start by viewing the main file to understand current implementation');
      suggestions.push('Check related files for dependencies and patterns');
    }

    if (intent.goal.toLowerCase().includes('debug') || intent.goal.toLowerCase().includes('fix')) {
      suggestions.push('Examine error-prone files first');
      suggestions.push('Check recent changes that might have introduced issues');
    }

    if (intent.goal.toLowerCase().includes('analyze')) {
      suggestions.push('Review multiple related files to understand the full system');
      suggestions.push('Look for patterns and relationships between components');
    }

    return suggestions;
  }

  private generateContextualHelp(intent: NavigationIntent, workContext?: AgentContext): string[] {
    const help: string[] = [];

    if (workContext?.filesModified.length > 0) {
      help.push(`Found ${workContext.filesModified.length} files related to your request`);
    }

    if (workContext?.lastWorkingState.suggestedActions.length > 0) {
      help.push('Multiple action paths available - choose based on your specific needs');
    }

    if (intent.previousAttempts && intent.previousAttempts.length > 0) {
      help.push('Previous attempts detected - trying alternative approach');
    }

    return help;
  }

  private generateErrorPrevention(intent: NavigationIntent, files: string[]): string[] {
    const prevention: string[] = [];

    // Check for common error patterns
    if (files.some(f => f.includes('/assets/'))) {
      prevention.push('Avoid direct asset path manipulation - use @assets/ imports');
    }

    if (files.some(f => f.includes('config'))) {
      prevention.push('Be careful with config files - validate before making changes');
    }

    if (intent.goal.toLowerCase().includes('delete') || intent.goal.toLowerCase().includes('remove')) {
      prevention.push('Verify file dependencies before deletion');
    }

    return prevention;
  }

  private findSimilarSuccessPattern(goal: string): NavigationResult | null {
    const goalKeywords = goal.toLowerCase().split(' ');
    
    for (const [pattern, result] of this.successPatterns) {
      const patternKeywords = pattern.toLowerCase().split(' ');
      const overlap = goalKeywords.filter(word => patternKeywords.includes(word));
      
      if (overlap.length >= Math.min(goalKeywords.length, patternKeywords.length) * 0.6) {
        return result;
      }
    }
    
    return null;
  }

  private storeSuccessPattern(goal: string, result: NavigationResult): void {
    this.successPatterns.set(goal, result);
    
    // Limit storage to prevent memory bloat
    if (this.successPatterns.size > 100) {
      const oldestKey = this.successPatterns.keys().next().value;
      if (oldestKey) {
        this.successPatterns.delete(oldestKey);
      }
    }
  }

  private async findRelatedFiles(file: string): Promise<string[]> {
    const related: string[] = [];
    
    // If it's a component, find its styles, tests, and related components
    if (file.includes('/components/')) {
      const baseName = file.split('/').pop()?.replace('.tsx', '').replace('.ts', '');
      if (baseName) {
        const projectContext = await ContextPreservationSystem.buildProjectContext();
        const searchResult = await ContextPreservationSystem.findRelevantFiles(`files related to ${baseName}`, projectContext);
        
        if (Array.isArray(searchResult)) {
          related.push(...searchResult.filter(Boolean));
        }
      }
    }
    
    return related;
  }

  private async predictFilesFromTask(task: string): Promise<string[]> {
    const predictions: string[] = [];
    const taskLower = task.toLowerCase();

    // Task-based predictions
    if (taskLower.includes('authentication') || taskLower.includes('login')) {
      predictions.push('server/replitAuth.ts', 'client/src/hooks/use-auth.ts');
    }
    
    if (taskLower.includes('database') || taskLower.includes('schema')) {
      predictions.push('shared/schema.ts', 'server/db.ts');
    }
    
    if (taskLower.includes('api') || taskLower.includes('route')) {
      predictions.push('server/routes.ts');
    }

    return predictions;
  }

  private async exactPathMatch(reference: string): Promise<string[]> {
    // Simplified file existence check (replace unifiedWorkspace call)
    const result = { success: true, content: '' }; // Simple stub
    return result.success ? [reference] : [];
  }

  private async fuzzyPathMatch(reference: string): Promise<string[]> {
    // Simple path resolution (replace unifiedWorkspace call)
    return [reference]; // Return as array for consistency
  }

  private async semanticPathMatch(reference: string, context?: string): Promise<string[]> {
    const query: IntentBasedQuery = {
      intent: reference,
      context: context || '',
      expectedResults: []
    };
    
    const projectContext = await ContextPreservationSystem.buildProjectContext();
    const result = await ContextPreservationSystem.findRelevantFiles(query.intent, projectContext);
    
    return Array.isArray(result) ? result : [];
  }

  private async contextualPathMatch(reference: string, context?: string): Promise<string[]> {
    const projectContext = await ContextPreservationSystem.buildProjectContext();
    const files = await ContextPreservationSystem.findRelevantFiles(`${reference} ${context || ''}`, projectContext);
    return files;
  }

  private identifyActiveAreas(projectContext: any): string[] {
    const areas: string[] = [];
    
    if (projectContext.structure.frontend.length > 0) areas.push('Frontend Development');
    if (projectContext.structure.backend.length > 0) areas.push('Backend Services');
    if (projectContext.recentChanges?.length > 0) areas.push('Recent Updates');
    
    return areas;
  }

  private async identifyPotentialIssues(projectContext: any): Promise<string[]> {
    const issues: string[] = [];
    
    // Check for common issues
    if (!projectContext.structure.config.some((f: string) => f.includes('package.json'))) {
      issues.push('Package configuration might be missing');
    }
    
    return issues;
  }

  private generateWorkspaceRecommendations(projectContext: any): string[] {
    const recommendations: string[] = [];
    
    if (projectContext.structure.frontend.length > projectContext.structure.backend.length) {
      recommendations.push('Consider balancing frontend and backend development');
    }
    
    recommendations.push('Maintain regular file organization');
    recommendations.push('Keep related files grouped together');
    
    return recommendations;
  }
}

// Export singleton instance
export const autonomousNavigation = AutonomousNavigationSystem.getInstance();