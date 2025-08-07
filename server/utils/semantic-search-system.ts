/**
 * DEPRECATED: SEMANTIC SEARCH SYSTEM REPLACED
 * This functionality has been integrated into the new intelligent search system
 * in server/tools/tool-exports.ts with superior priority-based ranking,
 * semantic matching, and related file discovery.
 * 
 * Redirecting to new intelligent search system...
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

// SIMPLIFIED WRAPPER AROUND NEW INTELLIGENT SEARCH SYSTEM
class SemanticSearchSystem {
  private deprecationWarning() {
    console.warn('⚠️ DEPRECATED: SemanticSearchSystem replaced by intelligent search in tool-exports.ts');
    console.log('🔄 REDIRECTING: Using new priority-based search system instead');
  }
  
  /**
   * DEPRECATED: Use new intelligent search system instead
   * This method redirects to the advanced search in tool-exports.ts
   */
  async intelligentFileSearch(query: string, options: {
    contextHints?: string[];
    fileTypes?: string[];
    maxResults?: number;
    includeRelated?: boolean;
  } = {}): Promise<SemanticSearchResult[]> {
    this.deprecationWarning();
    
    try {
      // REDIRECT TO NEW INTELLIGENT SEARCH SYSTEM
      const results = await search_filesystem({
        query_description: query,
        class_names: options.contextHints || [],
        function_names: []
      });
      
      // Convert new search results to old format for backwards compatibility
      return (results?.results || []).slice(0, options.maxResults || 10).map(result => ({
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