// Search functionality now handled through hybrid intelligence system
import { ClaudeHybridBridge } from '../services/claude-hybrid-bridge';
import fs from 'fs';
import path from 'path';

export interface SemanticSearchResult {
  filePath: string;
  relevanceScore: number;
  contextType: 'component' | 'service' | 'utility' | 'config' | 'schema' | 'unknown';
  description: string;
  dependencies: string[];
  relatedFiles: string[];
}

export interface ProjectStructureMap {
  components: string[];
  services: string[];
  utilities: string[];
  schemas: string[];
  configs: string[];
  relationships: Map<string, string[]>;
}

class SemanticSearchSystem {
  private projectStructure: ProjectStructureMap | null = null;
  private fileContextCache = new Map<string, any>();
  
  /**
   * Enhanced search with semantic project understanding
   */
  async intelligentFileSearch(query: string, options: {
    contextHints?: string[];
    fileTypes?: string[];
    maxResults?: number;
    includeRelated?: boolean;
  } = {}): Promise<SemanticSearchResult[]> {
    try {
      console.log('🧠 SEMANTIC SEARCH: Starting intelligent file discovery');
      console.log('🔍 Query:', query);
      console.log('🎯 Options:', options);
      
      // Use hybrid intelligence for search
      const hybridBridge = ClaudeHybridBridge.getInstance();
      const searchResult = await hybridBridge.executeToolViaHybrid({
        toolName: 'search_filesystem',
        parameters: {
          query_description: query,
          class_names: options.contextHints || [],
          function_names: []
        },
        agentId: 'semantic-search',
        userId: 'system',
        conversationId: 'semantic-search'
      });
      const basicResults = searchResult.success ? searchResult.result : { results: [] };
      
      if (!basicResults?.results) {
        console.warn('⚠️ No basic search results found');
        return [];
      }
      
      // Enhance results with semantic analysis
      const enhancedResults: SemanticSearchResult[] = [];
      
      for (const result of basicResults.results) {
        const semanticResult = await this.analyzeFileSemantics(result, query);
        if (semanticResult.relevanceScore > 0.3) { // Higher threshold for quality
          enhancedResults.push(semanticResult);
          
          // Include related files if requested
          if (options.includeRelated) {
            const relatedFiles = await this.findRelatedFiles(result.filePath || result.path || '');
            semanticResult.relatedFiles = relatedFiles;
          }
        }
      }
      
      // Sort by relevance score
      enhancedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Apply max results limit
      const maxResults = options.maxResults || 10;
      const finalResults = enhancedResults.slice(0, maxResults);
      
      console.log(`✅ SEMANTIC SEARCH: Found ${finalResults.length} high-quality results`);
      return finalResults;
      
    } catch (error) {
      console.error('❌ SEMANTIC SEARCH ERROR:', error);
      return [];
    }
  }
  
  /**
   * Analyze file semantics and context
   */
  private async analyzeFileSemantics(fileResult: any, query: string): Promise<SemanticSearchResult> {
    const filePath = fileResult.filePath || fileResult.path || '';
    let relevanceScore = 0.5; // Base score
    let contextType: SemanticSearchResult['contextType'] = 'unknown';
    let description = fileResult.summary || 'File found in search';
    let dependencies: string[] = [];
    
    try {
      // Determine context type from file path and extension
      if (filePath.includes('/components/') || filePath.endsWith('.tsx')) {
        contextType = 'component';
        relevanceScore += 0.2;
      } else if (filePath.includes('/services/') || filePath.includes('/utils/')) {
        contextType = filePath.includes('/services/') ? 'service' : 'utility';
        relevanceScore += 0.15;
      } else if (filePath.includes('schema') || filePath.includes('database')) {
        contextType = 'schema';
        relevanceScore += 0.1;
      } else if (filePath.includes('config') || filePath.endsWith('.config.ts')) {
        contextType = 'config';
        relevanceScore += 0.05;
      }
      
      // Boost score for query relevance
      const queryWords = query.toLowerCase().split(' ');
      const pathWords = filePath.toLowerCase().split(/[\/\-_\.]/);
      const matchingWords = queryWords.filter(word => 
        pathWords.some((pathWord: string) => pathWord.includes(word) || word.includes(pathWord))
      );
      
      relevanceScore += (matchingWords.length / queryWords.length) * 0.3;
      
      // Analyze file content for dependencies if available
      if (fileResult.content) {
        dependencies = this.extractDependencies(fileResult.content);
        if (dependencies.length > 0) {
          relevanceScore += 0.1;
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Error analyzing file semantics:', error);
    }
    
    return {
      filePath,
      relevanceScore: Math.min(relevanceScore, 1.0), // Cap at 1.0
      contextType,
      description,
      dependencies,
      relatedFiles: []
    };
  }
  
  /**
   * Extract import dependencies from file content
   */
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    try {
      // Extract imports
      const importRegex = /import.*?from\s+['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
          dependencies.push(importPath);
        }
      }
      
      // Extract require statements
      const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        const requirePath = match[1];
        if (requirePath.startsWith('./') || requirePath.startsWith('../') || requirePath.startsWith('@/')) {
          dependencies.push(requirePath);
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Error extracting dependencies:', error);
    }
    
    return Array.from(new Set(dependencies)); // Remove duplicates
  }
  
  /**
   * Find files related to the given file path
   */
  private async findRelatedFiles(filePath: string): Promise<string[]> {
    try {
      const relatedFiles: string[] = [];
      const baseName = path.basename(filePath, path.extname(filePath));
      const dirName = path.dirname(filePath);
      
      // Look for related files with similar names
      const hybridBridge = ClaudeHybridBridge.getInstance();
      const searchResult = await hybridBridge.executeToolViaHybrid({
        toolName: 'search_filesystem',
        parameters: {
          query_description: `Files related to ${baseName}`,
          function_names: [],
          class_names: []
        },
        agentId: 'semantic-search',
        userId: 'system',
        conversationId: 'semantic-search'
      });
      const relatedSearch = searchResult.success ? searchResult.result : { results: [] };
      
      if (relatedSearch?.results) {
        for (const result of relatedSearch.results) {
          const resultPath = result.filePath || result.path || '';
          if (resultPath !== filePath && 
              (resultPath.includes(baseName) || resultPath.includes(dirName))) {
            relatedFiles.push(resultPath);
          }
        }
      }
      
      return relatedFiles.slice(0, 5); // Limit to 5 related files
      
    } catch (error) {
      console.warn('⚠️ Error finding related files:', error);
      return [];
    }
  }
  
  /**
   * Build project structure map for intelligent navigation
   */
  async buildProjectStructureMap(): Promise<ProjectStructureMap> {
    if (this.projectStructure) {
      return this.projectStructure;
    }
    
    try {
      console.log('🏗️ BUILDING PROJECT STRUCTURE MAP');
      
      const structure: ProjectStructureMap = {
        components: [],
        services: [],
        utilities: [],
        schemas: [],
        configs: [],
        relationships: new Map()
      };
      
      // Search for different file types
      const searches = [
        { type: 'components', query: 'React components tsx files' },
        { type: 'services', query: 'service files backend API' },
        { type: 'utilities', query: 'utility helper functions' },
        { type: 'schemas', query: 'database schema types' },
        { type: 'configs', query: 'configuration files' }
      ];
      
      for (const searchConfig of searches) {
        const hybridBridge = ClaudeHybridBridge.getInstance();
        const searchResult = await hybridBridge.executeToolViaHybrid({
          toolName: 'search_filesystem',
          parameters: {
            query_description: searchConfig.query,
            function_names: [],
            class_names: []
          },
          agentId: 'semantic-search',
          userId: 'system',
          conversationId: 'semantic-search'
        });
        const results = searchResult.success ? searchResult.result : { results: [] };
        
        if (results?.results) {
          const filePaths = results.results.map((r: any) => r.filePath || r.path || '');
          (structure as any)[searchConfig.type] = filePaths;
          console.log(`📁 Found ${filePaths.length} ${searchConfig.type} files`);
        }
      }
      
      this.projectStructure = structure;
      console.log('✅ PROJECT STRUCTURE MAP BUILT');
      return structure;
      
    } catch (error) {
      console.error('❌ Error building project structure:', error);
      return {
        components: [],
        services: [],
        utilities: [],
        schemas: [],
        configs: [],
        relationships: new Map()
      };
    }
  }
  
  /**
   * Clear cached data
   */
  clearCache(): void {
    this.projectStructure = null;
    this.fileContextCache.clear();
    console.log('🧹 SEMANTIC SEARCH: Cache cleared');
  }
}

export const semanticSearchSystem = new SemanticSearchSystem();