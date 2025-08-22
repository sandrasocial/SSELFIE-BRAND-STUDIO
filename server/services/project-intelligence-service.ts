/**
 * PROJECT INTELLIGENCE SERVICE
 * Ensures agents understand existing project structure and work on existing files
 * instead of creating duplicates or conflicting systems
 */

import { searchFilesystem } from '../tools/search_filesystem';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface ProjectStructureMap {
  pages: string[];
  components: string[];
  routes: string[];
  apis: string[];
  services: string[];
  utils: string[];
  allFiles: string[];
}

export interface ExistingFileContext {
  filepath: string;
  purpose: string;
  framework: string;
  dependencies: string[];
  isRouted: boolean;
  lastModified: Date;
}

export class ProjectIntelligenceService {
  private static instance: ProjectIntelligenceService;
  private projectMap: ProjectStructureMap | null = null;
  private fileContexts: Map<string, ExistingFileContext> = new Map();

  private constructor() {
    this.initializeProjectMapping();
  }

  static getInstance(): ProjectIntelligenceService {
    if (!this.instance) {
      this.instance = new ProjectIntelligenceService();
    }
    return this.instance;
  }

  /**
   * CRITICAL: Map all existing files before agents start working
   */
  async initializeProjectMapping(): Promise<ProjectStructureMap> {
    console.log('🧠 PROJECT INTELLIGENCE: Mapping existing codebase structure...');
    
    // Get comprehensive file listing
    const results = await searchFilesystem({
      query_description: "Get complete project structure including all pages, components, APIs, and services to prevent agents from creating duplicates"
    });

    const projectMap: ProjectStructureMap = {
      pages: [],
      components: [],
      routes: [],
      apis: [],
      services: [],
      utils: [],
      allFiles: []
    };

    if (results.files) {
      for (const file of results.files) {
        projectMap.allFiles.push(file.path);
        
        // Categorize files
        if (file.path.includes('/pages/')) {
          projectMap.pages.push(file.path);
        }
        if (file.path.includes('/components/')) {
          projectMap.components.push(file.path);
        }
        if (file.path.includes('/api/')) {
          projectMap.apis.push(file.path);
        }
        if (file.path.includes('/services/')) {
          projectMap.services.push(file.path);
        }
        if (file.path.includes('/utils/')) {
          projectMap.utils.push(file.path);
        }

        // Build file context
        const context: ExistingFileContext = {
          filepath: file.path,
          purpose: this.inferFilePurpose(file.path, file.summary || ''),
          framework: this.detectFramework(file.path, file.summary || ''),
          dependencies: this.extractDependencies(file.summary || ''),
          isRouted: this.checkIfRouted(file.path),
          lastModified: new Date()
        };
        
        this.fileContexts.set(file.path, context);
      }
    }

    this.projectMap = projectMap;
    
    console.log(`✅ PROJECT MAPPED: ${projectMap.pages.length} pages, ${projectMap.components.length} components found`);
    console.log(`🎯 EXISTING PAGES: ${projectMap.pages.map(p => p.split('/').pop()).join(', ')}`);
    
    return projectMap;
  }

  /**
   * CRITICAL: Before agents create files, check if they already exist
   */
  async preventDuplicateCreation(agentName: string, intendedAction: string, targetFile?: string): Promise<{
    shouldProceed: boolean;
    existingFile?: string;
    recommendation: string;
    reasoning: string;
  }> {
    if (!this.projectMap) {
      await this.initializeProjectMapping();
    }

    console.log(`🔍 DUPLICATE CHECK: ${agentName} wants to ${intendedAction}`);

    // Check for landing page duplication (most common issue)
    if (intendedAction.toLowerCase().includes('landing') || intendedAction.toLowerCase().includes('editorial')) {
      const existingLanding = this.projectMap!.pages.find(p => 
        p.includes('landing.tsx') && !p.includes('editorial-landing')
      );
      
      if (existingLanding) {
        return {
          shouldProceed: false,
          existingFile: existingLanding,
          recommendation: `Update existing ${existingLanding} instead of creating new editorial-landing.tsx`,
          reasoning: 'Landing page already exists with proper React+Wouter framework structure'
        };
      }
    }

    // Check for component duplication
    if (intendedAction.toLowerCase().includes('create') && targetFile) {
      const existingSimilar = this.projectMap!.allFiles.find(f => 
        f.toLowerCase().includes(targetFile.toLowerCase().replace(/\.(tsx|ts|js|jsx)$/, ''))
      );
      
      if (existingSimilar) {
        return {
          shouldProceed: false,
          existingFile: existingSimilar,
          recommendation: `Update existing ${existingSimilar} instead of creating ${targetFile}`,
          reasoning: 'Similar file already exists - agents should enhance existing files, not create duplicates'
        };
      }
    }

    return {
      shouldProceed: true,
      recommendation: 'No conflicts detected - proceed with caution',
      reasoning: 'File does not conflict with existing structure'
    };
  }

  /**
   * Get existing file for agent to work on instead of creating new one
   */
  getExistingFileForTask(taskDescription: string): string | null {
    if (!this.projectMap) return null;

    const task = taskDescription.toLowerCase();

    // Map common tasks to existing files
    if (task.includes('landing') || task.includes('homepage')) {
      return this.projectMap.pages.find(p => p.includes('landing.tsx')) || null;
    }
    
    if (task.includes('gallery') || task.includes('photos')) {
      return this.projectMap.pages.find(p => p.includes('sselfie-gallery.tsx')) || null;
    }
    
    if (task.includes('maya') || task.includes('style')) {
      return this.projectMap.pages.find(p => p.includes('maya.tsx')) || null;
    }
    
    if (task.includes('workspace') || task.includes('dashboard')) {
      return this.projectMap.pages.find(p => p.includes('workspace.tsx')) || null;
    }

    return null;
  }

  /**
   * Generate intelligent task instruction that works on existing files
   */
  generateCorrectTaskInstruction(originalTask: string, agentName: string): string {
    const existingFile = this.getExistingFileForTask(originalTask);
    
    if (existingFile) {
      const filename = existingFile.split('/').pop();
      return `UPDATE existing file ${existingFile} to ${originalTask.replace(/create|build|implement/gi, 'enhance')} - DO NOT create new files. Work on the existing ${filename} using React+Wouter framework patterns.`;
    }
    
    return `${originalTask} - First check if similar files exist using search tool, then UPDATE existing files instead of creating duplicates.`;
  }

  private inferFilePurpose(filepath: string, summary: string): string {
    if (filepath.includes('landing')) return 'Homepage/Landing page';
    if (filepath.includes('workspace')) return 'User dashboard';
    if (filepath.includes('gallery')) return 'Photo gallery';
    if (filepath.includes('maya')) return 'Style consultation';
    if (filepath.includes('victoria')) return 'Website builder';
    return summary.split('.')[0] || 'Unknown purpose';
  }

  private detectFramework(filepath: string, summary: string): string {
    if (summary.includes('next/') || summary.includes('Next.js')) return 'Next.js';
    if (summary.includes('wouter') || summary.includes('React')) return 'React+Wouter';
    return 'React+Wouter'; // Default assumption
  }

  private extractDependencies(summary: string): string[] {
    const deps: string[] = [];
    if (summary.includes('wouter')) deps.push('wouter');
    if (summary.includes('framer-motion')) deps.push('framer-motion');
    if (summary.includes('react-helmet')) deps.push('react-helmet');
    return deps;
  }

  private checkIfRouted(filepath: string): boolean {
    return filepath.includes('/pages/') && filepath.endsWith('.tsx');
  }

  /**
   * Get project overview for Elena delegation system
   */
  getProjectOverview(): string {
    if (!this.projectMap) return 'Project not mapped yet';
    
    return `
**SSELFIE Studio Project Overview**
- **Framework**: React + Wouter (NOT Next.js)
- **Pages**: ${this.projectMap.pages.length} existing pages
- **Components**: ${this.projectMap.components.length} existing components

**Key Existing Files**:
${this.projectMap.pages.slice(0, 10).map(p => `- ${p.split('/').pop()}`).join('\n')}

**CRITICAL RULES**:
1. UPDATE existing files, never create duplicates
2. Use React+Wouter patterns (wouter/Link, react-helmet/Helmet)
3. Landing page is client/src/pages/landing.tsx - update this, don't create editorial-landing.tsx
4. Check existing files first using search tool before any work
    `;
  }
}

// Global instance
export const projectIntelligence = ProjectIntelligenceService.getInstance();