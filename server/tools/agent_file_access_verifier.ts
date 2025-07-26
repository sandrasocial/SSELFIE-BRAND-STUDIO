/**
 * AGENT FILE ACCESS VERIFIER - Ensures all admin agents can see autonomous orchestrator files
 * Created to fix Elena's inability to see autonomous orchestrator infrastructure
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface FileAccessReport {
  fileName: string;
  fullPath: string;
  exists: boolean;
  accessible: boolean;
  size?: number;
  lastModified?: Date;
  contentPreview?: string;
}

export interface AutonomousOrchestratorVerification {
  totalFiles: number;
  accessibleFiles: number;
  missingFiles: string[];
  files: FileAccessReport[];
  searchKeywords: string[];
  verification: 'COMPLETE' | 'PARTIAL' | 'FAILED';
}

export class AgentFileAccessVerifier {
  
  /**
   * Verify all autonomous orchestrator system files for agent access
   */
  static async verifyAutonomousOrchestratorAccess(): Promise<AutonomousOrchestratorVerification> {
    console.log('🔍 AGENT FILE ACCESS: Starting autonomous orchestrator verification...');
    
    // Define all autonomous orchestrator files that should exist
    const expectedFiles = [
      'server/api/autonomous-orchestrator/deploy-all-agents.ts',
      'server/api/autonomous-orchestrator/coordination-metrics.ts',
      'server/services/intelligent-task-distributor.ts',
      'server/services/agent-knowledge-sharing.ts',
      'server/templates/workflow-templates.ts'
    ];
    
    const searchKeywords = [
      'deploy-all-agents', 'intelligent-task-distributor', 'agent-knowledge-sharing',
      'workflow-templates', 'coordination-metrics', 'autonomous-orchestrator',
      'orchestrator', 'deployment', 'coordination', 'workflow', 'knowledge', 'sharing',
      'task assignment', 'agent coordination', 'multi-agent', 'workflow execution'
    ];
    
    const fileReports: FileAccessReport[] = [];
    const missingFiles: string[] = [];
    let accessibleCount = 0;
    
    for (const filePath of expectedFiles) {
      try {
        const fullPath = path.resolve(filePath);
        const stats = await fs.stat(fullPath);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        const report: FileAccessReport = {
          fileName: filePath,
          fullPath,
          exists: true,
          accessible: true,
          size: stats.size,
          lastModified: stats.mtime,
          contentPreview: content.substring(0, 500)
        };
        
        fileReports.push(report);
        accessibleCount++;
        
        console.log(`✅ AGENT ACCESS: ${filePath} - ${stats.size} bytes, accessible`);
        
      } catch (error) {
        const report: FileAccessReport = {
          fileName: filePath,
          fullPath: path.resolve(filePath),
          exists: false,
          accessible: false
        };
        
        fileReports.push(report);
        missingFiles.push(filePath);
        
        console.log(`❌ AGENT ACCESS: ${filePath} - NOT ACCESSIBLE`);
      }
    }
    
    // Determine verification status
    let verification: 'COMPLETE' | 'PARTIAL' | 'FAILED';
    if (accessibleCount === expectedFiles.length) {
      verification = 'COMPLETE';
    } else if (accessibleCount > 0) {
      verification = 'PARTIAL';
    } else {
      verification = 'FAILED';
    }
    
    console.log(`🎯 AGENT ACCESS: Verification ${verification} - ${accessibleCount}/${expectedFiles.length} files accessible`);
    
    return {
      totalFiles: expectedFiles.length,
      accessibleFiles: accessibleCount,
      missingFiles,
      files: fileReports,
      searchKeywords,
      verification
    };
  }
  
  /**
   * Generate agent-readable file listing for autonomous orchestrator system
   */
  static async generateAgentFileMap(): Promise<{
    autonomousOrchestratorFiles: string[];
    fileContents: Record<string, string>;
    searchGuide: string[];
  }> {
    console.log('🗺️ AGENT FILE MAP: Generating comprehensive file map for agents...');
    
    const verification = await this.verifyAutonomousOrchestratorAccess();
    const fileContents: Record<string, string> = {};
    const autonomousOrchestratorFiles: string[] = [];
    
    for (const file of verification.files) {
      if (file.exists && file.accessible) {
        autonomousOrchestratorFiles.push(file.fileName);
        
        try {
          const content = await fs.readFile(file.fullPath, 'utf-8');
          fileContents[file.fileName] = content.substring(0, 2000); // First 2000 chars for agents
        } catch (error) {
          fileContents[file.fileName] = 'Error reading file content';
        }
      }
    }
    
    const searchGuide = [
      'Use "autonomous-orchestrator" to find deployment system files',
      'Use "intelligent-task-distributor" to find agent assignment system',
      'Use "agent-knowledge-sharing" to find cross-agent learning system',
      'Use "workflow-templates" to find multi-agent collaboration workflows',
      'Use "coordination-metrics" to find system monitoring capabilities',
      'Search in server/api/autonomous-orchestrator/ directory',
      'Search in server/services/ directory for core services',
      'Search in server/templates/ directory for workflow templates'
    ];
    
    console.log(`🗺️ AGENT FILE MAP: Generated map with ${autonomousOrchestratorFiles.length} accessible files`);
    
    return {
      autonomousOrchestratorFiles,
      fileContents,
      searchGuide
    };
  }
  
  /**
   * Test agent search functionality specifically for autonomous orchestrator files
   */
  static async testAgentSearch(searchQuery: string): Promise<{
    query: string;
    filesFound: string[];
    success: boolean;
    recommendations: string[];
  }> {
    console.log(`🧪 AGENT SEARCH TEST: Testing search for "${searchQuery}"`);
    
    const verification = await this.verifyAutonomousOrchestratorAccess();
    const filesFound: string[] = [];
    const recommendations: string[] = [];
    
    // Simulate how agents would search
    const queryLower = searchQuery.toLowerCase();
    
    for (const file of verification.files) {
      if (file.exists && file.accessible) {
        const fileName = file.fileName.toLowerCase();
        const content = file.contentPreview?.toLowerCase() || '';
        
        // Check if search would find this file
        if (fileName.includes(queryLower) || content.includes(queryLower)) {
          filesFound.push(file.fileName);
        }
      }
    }
    
    // Generate recommendations for better searches
    if (filesFound.length === 0) {
      recommendations.push('Try searching for "deploy-all-agents" to find deployment system');
      recommendations.push('Try searching for "intelligent-task-distributor" to find task assignment');
      recommendations.push('Try searching for "workflow-templates" to find collaboration workflows');
      recommendations.push('Search in "server/api/autonomous-orchestrator" directory specifically');
    }
    
    const success = filesFound.length > 0;
    
    console.log(`🧪 AGENT SEARCH TEST: Query "${searchQuery}" found ${filesFound.length} files - ${success ? 'SUCCESS' : 'NEEDS IMPROVEMENT'}`);
    
    return {
      query: searchQuery,
      filesFound,
      success,
      recommendations
    };
  }
}

// Export singleton functions for easy use
export const verifyAutonomousOrchestratorAccess = AgentFileAccessVerifier.verifyAutonomousOrchestratorAccess;
export const generateAgentFileMap = AgentFileAccessVerifier.generateAgentFileMap;
export const testAgentSearch = AgentFileAccessVerifier.testAgentSearch;