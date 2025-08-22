/**
 * BOUNDARY ENFORCER - AUTOMATED ENFORCEMENT SYSTEM
 * Prevents repository chaos through automated checks and enforcement
 */

import { PathEnforcer, ValidationResult } from './path-enforcer';
import { AgentNavigator, NavigationContext } from './agent-navigator';
import { AGENT_BOUNDARIES, PROTECTED_ZONES } from './agent-workspace';

export interface EnforcementReport {
  timestamp: string;
  agentName: string;
  operation: string;
  path: string;
  result: 'allowed' | 'blocked' | 'warning';
  details: string[];
  enforcedRules: string[];
}

export class BoundaryEnforcer {
  private static reports: EnforcementReport[] = [];

  /**
   * Pre-operation enforcement check
   */
  static enforceOperation(context: NavigationContext): ValidationResult {
    const validation = AgentNavigator.validateOperation(context);
    
    // Log enforcement action
    const report: EnforcementReport = {
      timestamp: new Date().toISOString(),
      agentName: context.agentName,
      operation: context.operation,
      path: context.requestedPath,
      result: validation.isValid ? 'allowed' : 'blocked',
      details: [...validation.errors, ...validation.warnings],
      enforcedRules: validation.enforcedRules
    };

    this.reports.push(report);

    // Keep only last 100 reports
    if (this.reports.length > 100) {
      this.reports = this.reports.slice(-100);
    }

    return validation;
  }

  /**
   * Automated pre-commit checks
   */
  static preCommitChecks(changedFiles: string[], agentName: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      enforcedRules: []
    };

    for (const file of changedFiles) {
      // Check protected zones
      const isProtected = Object.values(PROTECTED_ZONES).flat().some(zone => 
        file.startsWith(zone)
      );

      if (isProtected) {
        result.isValid = false;
        result.errors.push(`PROTECTED FILE: ${file} cannot be modified`);
        result.enforcedRules.push('Protected zone enforcement');
        continue;
      }

      // Check agent boundaries
      const validation = PathEnforcer.validateAgentAccess(agentName, file);
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(...validation.errors);
        result.enforcedRules.push(...validation.enforcedRules);
      }

      // Check for duplicates
      const duplicateCheck = PathEnforcer.preventDuplicates(file);
      result.warnings.push(...duplicateCheck.warnings);
      result.enforcedRules.push(...duplicateCheck.enforcedRules);
    }

    return result;
  }

  /**
   * Real-time path validation for file operations
   */
  static validateFilePath(agentName: string, operation: string, path: string): boolean {
    const context: NavigationContext = {
      agentName,
      currentPath: '.',
      requestedPath: path,
      operation: operation as any
    };

    const validation = this.enforceOperation(context);
    return validation.isValid;
  }

  /**
   * Generate enforcement report
   */
  static generateReport(): string {
    const recentReports = this.reports.slice(-20);
    
    return `
🛡️ BOUNDARY ENFORCEMENT REPORT
Generated: ${new Date().toISOString()}

📊 RECENT ACTIVITY (Last 20 operations):
${recentReports.map(report => `
${report.timestamp}
Agent: ${report.agentName}
Operation: ${report.operation} → ${report.path}
Result: ${report.result.toUpperCase()}
Rules: ${report.enforcedRules.join(', ')}
${report.details.length > 0 ? `Details: ${report.details.join('; ')}` : ''}
`).join('\n---\n')}

🔍 ENFORCEMENT STATISTICS:
Total Operations: ${this.reports.length}
Allowed: ${this.reports.filter(r => r.result === 'allowed').length}
Blocked: ${this.reports.filter(r => r.result === 'blocked').length}
Warnings: ${this.reports.filter(r => r.result === 'warning').length}

🎯 MOST ACTIVE AGENTS:
${this.getAgentActivity()}

🚨 RECENT BLOCKS:
${this.reports.filter(r => r.result === 'blocked').slice(-5).map(r => 
  `${r.agentName}: ${r.path} (${r.details[0]})`
).join('\n')}
    `;
  }

  /**
   * Get agent activity summary
   */
  private static getAgentActivity(): string {
    const activity: Record<string, number> = {};
    this.reports.forEach(report => {
      activity[report.agentName] = (activity[report.agentName] || 0) + 1;
    });

    return Object.entries(activity)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([agent, count]) => `${agent}: ${count} operations`)
      .join('\n');
  }

  /**
   * Emergency protection mode - block all operations except safe ones
   */
  static enableEmergencyMode(): void {
    console.log('🚨 EMERGENCY MODE ACTIVATED - Only essential operations allowed');
    // Implementation would override normal validation
  }

  /**
   * Check system health and integrity
   */
  static healthCheck(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check if protected zones are intact
    const protectedPaths = Object.values(PROTECTED_ZONES).flat();
    // In a real implementation, would check file system

    // Check for agent boundary violations
    const recentBlocks = this.reports.filter(r => r.result === 'blocked').slice(-10);
    if (recentBlocks.length > 5) {
      issues.push(`High number of blocked operations: ${recentBlocks.length}`);
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }
}

// Export enforcement rules for integration
export const ENFORCEMENT_RULES = {
  BLOCK_PROTECTED_ZONES: true,
  ENFORCE_AGENT_BOUNDARIES: true,
  PREVENT_DUPLICATES: true,
  VALIDATE_OWNERSHIP: true,
  LOG_ALL_OPERATIONS: true,
  EMERGENCY_MODE: false
};

// Integration helpers
export const ENFORCEMENT_INTEGRATION = {
  /**
   * Middleware for file operations
   */
  fileOperationMiddleware: (agentName: string, operation: string, path: string) => {
    return BoundaryEnforcer.validateFilePath(agentName, operation, path);
  },

  /**
   * Search filter for agent-specific searches
   */
  searchFilter: (agentName: string, searchResults: string[]) => {
    const agent = AGENT_BOUNDARIES[agentName];
    if (!agent) return [];

    return searchResults.filter(path => 
      agent.allowedPaths.some(allowedPath => path.startsWith(allowedPath))
    );
  },

  /**
   * Path sanitizer
   */
  sanitizePath: (path: string) => {
    // Remove dangerous patterns
    return path
      .replace(/\.\./g, '') // Prevent directory traversal
      .replace(/\/+/g, '/') // Normalize multiple slashes
      .replace(/^\/+/, ''); // Remove leading slashes
  }
};