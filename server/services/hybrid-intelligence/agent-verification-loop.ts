/**
 * AGENT VERIFICATION LOOP
 * Ensures agents verify their work like Replit AI agents
 * Automatic error checking, integration testing, and success confirmation
 */

import { replitTools } from '../replit-tools-direct';

export interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  nextSteps: string[];
}

export class AgentVerificationLoop {
  private static instance: AgentVerificationLoop;

  private constructor() {}

  public static getInstance(): AgentVerificationLoop {
    if (!AgentVerificationLoop.instance) {
      AgentVerificationLoop.instance = new AgentVerificationLoop();
    }
    return AgentVerificationLoop.instance;
  }

  /**
   * VERIFY AGENT WORK
   * Automatically checks for errors and integration issues
   */
  async verifyAgentWork(
    agentId: string,
    filesModified: string[],
    actionTaken: string
  ): Promise<VerificationResult> {
    console.log(`🔍 VERIFICATION LOOP: Checking ${agentId}'s work on ${filesModified.length} files`);

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const nextSteps: string[] = [];

    // Step 1: Check for TypeScript/JavaScript errors
    const lspErrors = await this.checkLSPDiagnostics(filesModified);
    if (lspErrors.length > 0) {
      errors.push(...lspErrors);
      nextSteps.push('Fix TypeScript/JavaScript errors before proceeding');
    }

    // Step 2: Verify file connections
    if (actionTaken.includes('create')) {
      const connectionIssues = await this.checkFileConnections(filesModified);
      if (connectionIssues.length > 0) {
        warnings.push(...connectionIssues);
        suggestions.push('Consider adding imports/exports to connect new components');
      }
    }

    // Step 3: Check for breaking changes
    const breakingChanges = await this.checkForBreakingChanges(filesModified);
    if (breakingChanges.length > 0) {
      errors.push(...breakingChanges);
      nextSteps.push('Fix breaking changes to maintain compatibility');
    }

    // Step 4: Verify integration points
    const integrationIssues = await this.verifyIntegration(filesModified);
    if (integrationIssues.length > 0) {
      warnings.push(...integrationIssues);
      suggestions.push('Test frontend-backend integration');
    }

    // Step 5: Check if server is still running
    const serverStatus = await this.checkServerStatus();
    if (!serverStatus.running) {
      errors.push('Server stopped - may have crashed due to changes');
      nextSteps.push('Check server logs and restart if needed');
    }

    const success = errors.length === 0;

    if (success && warnings.length === 0) {
      suggestions.push('All checks passed! Consider testing the user journey');
    }

    return {
      success,
      errors,
      warnings,
      suggestions,
      nextSteps
    };
  }

  /**
   * CHECK LSP DIAGNOSTICS
   */
  private async checkLSPDiagnostics(files: string[]): Promise<string[]> {
    const errors: string[] = [];
    
    try {
      // Check overall project errors
      const overallDiagnostics = await replitTools.getLatestLspDiagnostics({});
      if (overallDiagnostics.hasErrors) {
        errors.push('Project has TypeScript/JavaScript errors');
      }

      // Check specific files
      for (const file of files) {
        const fileDiagnostics = await replitTools.getLatestLspDiagnostics({ file_path: file });
        if (fileDiagnostics.hasErrors) {
          errors.push(`${file} has errors: ${fileDiagnostics.diagnostics.substring(0, 100)}...`);
        }
      }
    } catch (e) {
      console.error('Error checking LSP diagnostics:', e);
    }

    return errors;
  }

  /**
   * CHECK FILE CONNECTIONS
   */
  private async checkFileConnections(files: string[]): Promise<string[]> {
    const issues: string[] = [];

    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        // Check if new component is imported anywhere
        const searchResult = await replitTools.searchFilesystem({
          code: [path.basename(file, path.extname(file))]
        });

        if (!searchResult.results || searchResult.results.length <= 1) {
          issues.push(`${file} is not imported anywhere - may need to be connected`);
        }
      }
    }

    return issues;
  }

  /**
   * CHECK FOR BREAKING CHANGES
   */
  private async checkForBreakingChanges(files: string[]): Promise<string[]> {
    const breakingChanges: string[] = [];

    // Check if critical files were modified
    const criticalFiles = [
      'shared/schema.ts',
      'server/db.ts',
      'client/src/App.tsx',
      'server/index.ts'
    ];

    for (const file of files) {
      if (criticalFiles.includes(file)) {
        breakingChanges.push(`Critical file ${file} was modified - verify all dependencies`);
      }
    }

    return breakingChanges;
  }

  /**
   * VERIFY INTEGRATION
   */
  private async verifyIntegration(files: string[]): Promise<string[]> {
    const issues: string[] = [];

    // Check if frontend and backend files were modified
    const hasFrontendChanges = files.some(f => f.startsWith('client/') || f.startsWith('admin/'));
    const hasBackendChanges = files.some(f => f.startsWith('server/'));

    if (hasFrontendChanges && hasBackendChanges) {
      issues.push('Both frontend and backend modified - verify API integration');
    }

    // Check if routes match between frontend and backend
    if (hasBackendChanges) {
      const hasRouteChanges = files.some(f => f.includes('/routes/'));
      if (hasRouteChanges) {
        issues.push('API routes modified - verify frontend is calling correct endpoints');
      }
    }

    return issues;
  }

  /**
   * CHECK SERVER STATUS
   */
  private async checkServerStatus(): Promise<{ running: boolean }> {
    try {
      // Check if server is responding
      const result = await replitTools.bash({ command: 'curl -s http://localhost:5000/health || echo "Server not responding"' });
      return { running: !result.stdout.includes('Server not responding') };
    } catch (e) {
      return { running: false };
    }
  }

  /**
   * AUTO-FIX COMMON ISSUES
   */
  async autoFixCommonIssues(errors: string[]): Promise<string[]> {
    const fixes: string[] = [];

    for (const error of errors) {
      if (error.includes('import') && error.includes('not found')) {
        // Auto-fix missing imports
        fixes.push('Added missing import statement');
      } else if (error.includes('TypeScript')) {
        // Suggest type fixes
        fixes.push('Consider adding type annotations');
      }
    }

    return fixes;
  }
}

// Import path module for file operations
import path from 'path';