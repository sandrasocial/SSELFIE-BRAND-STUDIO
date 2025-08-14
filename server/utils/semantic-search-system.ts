/**
 * ACTIVE: SEMANTIC SEARCH SYSTEM - CORE INTELLIGENCE
 * Advanced natural language search with semantic matching,
 * priority-based ranking, and intelligent file discovery.
 * 
 * Integrated with autonomous navigation and agent knowledge base.
 */

import { search_filesystem } from '../tools/search_filesystem';

// REDIRECT ALL SEMANTIC SEARCH FUNCTIONALITY TO NEW INTELLIGENT SYSTEM
export interface SemanticSearchResult {
  filePath: string;
  relevanceScore: number;
  contextType: 'component' | 'service' | 'utility' | 'config' | 'schema' | 'unknown';
  description: string;
  dependencies: string[];
  relatedFiles: string[];
}

// COMPREHENSIVE INTELLIGENT SEARCH SYSTEM - ACTIVE
class SemanticSearchSystem {
  private activeSystemLog() {
    console.log('🧠 SEMANTIC SEARCH: Using comprehensive intelligent search system');
    console.log('🔍 FEATURES: Natural language, priority ranking, contextual discovery');
  }
  
  /**
   * ACTIVE: Comprehensive intelligent file search with semantic matching
   * Integrates with autonomous navigation and agent knowledge base
   */
  async intelligentFileSearch(query: string, options: {
    contextHints?: string[];
    fileTypes?: string[];
    maxResults?: number;
    includeRelated?: boolean;
  } = {}): Promise<SemanticSearchResult[]> {
    this.activeSystemLog();
    
    try {
      // REDIRECT TO NEW INTELLIGENT SEARCH SYSTEM
      const results = await search_filesystem({
        query_description: query,
        class_names: options.contextHints || [],
        function_names: []
      });
      
      // Convert new search results to old format for backwards compatibility
      const resultsArray = Array.isArray(results) ? results : (typeof results === 'object' && results && 'results' in results ? results.results : []);
      return resultsArray.slice(0, options.maxResults || 10).map(result => ({
        filePath: result.fileName,
        relevanceScore: (result.priority || 50) / 100, // Convert priority to 0-1 score
        contextType: this.determineContextType(result.fileName),
        description: result.reason,
        dependencies: [],
        relatedFiles: result.relatedFiles || []
      }));
      
    } catch (error) {
      console.error('❌ DEPRECATED SEARCH ERROR:', error);
      return [];
    }
  }

  private determineContextType(filePath: string): SemanticSearchResult['contextType'] {
    if (filePath.includes('/components/') || filePath.endsWith('.tsx')) return 'component';
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('schema') || filePath.includes('database')) return 'schema';
    if (filePath.includes('config')) return 'config';
    return 'unknown';
  }
  
  /**
   * DEPRECATED: All functionality moved to intelligent search system
   */
  clearCache(): void {
    console.log('🧹 DEPRECATED: Cache cleared (functionality moved to intelligent search system)');
  }
}

export const semanticSearchSystem = new SemanticSearchSystem();