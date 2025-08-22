/**
 * AGENT NAVIGATION SYSTEM
 * Intelligent file system navigation for admin agents with safety enforcement
 */

import { PathEnforcer, ValidationResult } from './path-enforcer';
import { AGENT_BOUNDARIES } from './agent-workspace';

export interface NavigationContext {
  agentName: string;
  currentPath: string;
  requestedPath: string;
  operation: 'read' | 'write' | 'create' | 'delete' | 'search';
}

export interface NavigationResult {
  allowed: boolean;
  path: string;
  warnings: string[];
  suggestions: string[];
  enforcedRules: string[];
}

export class AgentNavigator {
  /**
   * Smart file system search with agent-aware filtering
   */
  static async smartSearch(
    agentName: string, 
    searchQuery: string, 
    searchPaths?: string[]
  ): Promise<NavigationResult> {
    const agent = AGENT_BOUNDARIES[agentName];
    const result: NavigationResult = {
      allowed: true,
      path: '',
      warnings: [],
      suggestions: [],
      enforcedRules: []
    };

    if (!agent) {
      result.allowed = false;
      result.warnings.push(`Unknown agent: ${agentName}`);
      return result;
    }

    // Filter search paths to only include agent's allowed paths
    const allowedSearchPaths = searchPaths ? 
      searchPaths.filter(path => 
        agent.allowedPaths.some(allowedPath => path.startsWith(allowedPath))
      ) : 
      agent.allowedPaths;

    result.path = allowedSearchPaths.join(',');
    result.enforcedRules.push('Agent boundary filtering applied');

    // Add search suggestions based on agent specialty
    if (agentName === 'elena') {
      result.suggestions.push('Consider searching /server/agents/ for agent coordination');
      result.suggestions.push('Try /server/workflows/ for workflow templates');
    } else if (agentName === 'zara') {
      result.suggestions.push('Consider searching /client/src/components/ for UI components');
      result.suggestions.push('Try /client/src/pages/ for page components');
    } else if (agentName === 'rachel') {
      result.suggestions.push('Consider searching /client/src/pages/public/ for content pages');
      result.suggestions.push('Try /docs/business/ for business content');
    } else if (agentName === 'maya') {
      result.suggestions.push('Consider searching /server/ai/styling/ for styling logic');
      result.suggestions.push('Try /shared/types/styling/ for style types');
    } else if (agentName === 'olga') {
      result.suggestions.push('Consider searching /tools/ for organization tools');
      result.suggestions.push('Try /docs/ for documentation structure');
    }

    return result;
  }

  /**
   * Validate file operation before execution
   */
  static validateOperation(context: NavigationContext): ValidationResult {
    const pathValidation = PathEnforcer.validateAgentAccess(
      context.agentName, 
      context.requestedPath
    );

    if (!pathValidation.isValid) {
      return pathValidation;
    }

    // Additional operation-specific validations
    if (context.operation === 'delete') {
      pathValidation.warnings.push('DELETE operation detected - proceed with caution');
      pathValidation.enforcedRules.push('Delete operation warning');
    }

    if (context.operation === 'write' || context.operation === 'create') {
      const ownershipCheck = PathEnforcer.validateOwnership(
        context.agentName, 
        context.requestedPath
      );
      pathValidation.warnings.push(...ownershipCheck.warnings);
      pathValidation.enforcedRules.push(...ownershipCheck.enforcedRules);
    }

    return pathValidation;
  }

  /**
   * Get navigation suggestions for agent
   */
  static getNavigationSuggestions(agentName: string): string[] {
    const agent = AGENT_BOUNDARIES[agentName];
    if (!agent) return [`Unknown agent: ${agentName}`];

    const suggestions = [
      `📁 Your main workspace: ${agent.allowedPaths[0]}`,
      `🔧 Your capabilities: ${agent.capabilities.join(', ')}`,
      `📋 Required checks: ${agent.requiredChecks.join(', ')}`
    ];

    // Agent-specific suggestions
    switch (agentName) {
      case 'elena':
        suggestions.push('🎯 Coordinate agents via /server/agents/');
        suggestions.push('⚡ Create workflows in /server/workflows/');
        break;
      case 'zara':
        suggestions.push('🎨 Build UI in /client/src/components/');
        suggestions.push('📱 Create pages in /client/src/pages/');
        break;
      case 'rachel':
        suggestions.push('✍️ Edit content in /client/src/pages/public/');
        suggestions.push('📈 Update business docs in /docs/business/');
        break;
      case 'maya':
        suggestions.push('👗 Style logic in /server/ai/styling/');
        suggestions.push('📝 Style types in /shared/types/styling/');
        break;
      case 'olga':
        suggestions.push('🧹 Organization tools in /tools/');
        suggestions.push('📚 Documentation in /docs/');
        break;
      case 'victoria':
        suggestions.push('🏗️ Build pages in /client/src/pages/');
        suggestions.push('🎨 Components in /components/');
        break;
    }

    return suggestions;
  }

  /**
   * Safe file path resolution with validation
   */
  static resolveSafePath(agentName: string, relativePath: string): NavigationResult {
    const result: NavigationResult = {
      allowed: false,
      path: '',
      warnings: [],
      suggestions: [],
      enforcedRules: []
    };

    // Normalize path
    const normalizedPath = relativePath.startsWith('./') ? 
      relativePath.substring(2) : 
      relativePath;

    // Validate against agent boundaries
    const validation = PathEnforcer.validateAgentAccess(agentName, normalizedPath);
    
    result.allowed = validation.isValid;
    result.warnings = validation.errors.concat(validation.warnings);
    result.enforcedRules = validation.enforcedRules;

    if (validation.isValid) {
      result.path = normalizedPath;
    } else {
      // Suggest alternative paths
      const agent = AGENT_BOUNDARIES[agentName];
      if (agent) {
        result.suggestions = [
          'Consider these allowed paths instead:',
          ...agent.allowedPaths.map(path => `  ✅ ${path}`)
        ];
      }
    }

    return result;
  }
}

// Export navigation helpers
export const NAVIGATION_HELPERS = {
  /**
   * Quick agent workspace lookup
   */
  getAgentWorkspace: (agentName: string) => {
    const agent = AGENT_BOUNDARIES[agentName];
    return agent ? agent.allowedPaths[0] : null;
  },

  /**
   * Check if path is safe for agent
   */
  isSafePath: (agentName: string, path: string) => {
    const validation = PathEnforcer.validateAgentAccess(agentName, path);
    return validation.isValid;
  },

  /**
   * Get agent capabilities
   */
  getAgentCapabilities: (agentName: string) => {
    const agent = AGENT_BOUNDARIES[agentName];
    return agent ? agent.capabilities : [];
  }
};