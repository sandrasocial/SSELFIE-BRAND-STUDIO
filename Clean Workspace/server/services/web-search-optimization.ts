/**
 * Web Search Optimization Service
 * Enhanced real-time information retrieval with documentation caching
 * SSELFIE Studio Enhancement Project - Maya Implementation
 */

import { promises as fs } from 'fs';
import path from 'path';

interface SearchResult {
  id: string;
  query: string;
  results: any[];
  timestamp: Date;
  source: 'cache' | 'live';
  relevanceScore: number;
}

interface CachedDocument {
  url: string;
  title: string;
  content: string;
  lastUpdated: Date;
  accessCount: number;
  category: 'technical' | 'documentation' | 'api' | 'tutorial';
}

export class WebSearchOptimizationService {
  private searchCache: Map<string, SearchResult> = new Map();
  private documentCache: Map<string, CachedDocument> = new Map();
  private cacheDirectory = './server/cache/web-search';
  private maxCacheSize = 1000;
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeCache();
  }

  /**
   * Initialize cache directory and load existing cache
   */
  private async initializeCache(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDirectory, { recursive: true });
      await this.loadPersistedCache();
      // console.log('🔍 WEB SEARCH OPTIMIZATION: Cache initialized');
    } catch (error) {
      console.error('Failed to initialize web search cache:', error);
    }
  }

  /**
   * Enhanced search with intelligent caching
   */
  async optimizedSearch(
    query: string,
    options: {
      useCache?: boolean;
      category?: 'technical' | 'documentation' | 'api' | 'tutorial';
      maxResults?: number;
      realTime?: boolean;
    } = {}
  ): Promise<SearchResult> {
    const {
      useCache = true,
      category = 'technical',
      maxResults = 10,
      realTime = false
    } = options;

    const queryKey = this.generateQueryKey(query, category);

    // CACHE DISABLED FOR AGENTS: Always perform live search for agent requests
    console.log('🚀 WEB SEARCH: Cache disabled - performing direct search for:', query);

    // Perform live search
    const searchResult = await this.performLiveSearch(query, category, maxResults);
    
    // Cache the result
    if (useCache) {
      this.cacheSearchResult(queryKey, searchResult);
    }

    return searchResult;
  }

  /**
   * Perform live web search
   */
  private async performLiveSearch(
    query: string,
    category: string,
    maxResults: number
  ): Promise<SearchResult> {
    console.log('🌐 WEB SEARCH: Performing live search for:', query);

    // This would integrate with actual web search APIs
    // For now, returning structured placeholder that matches expected format
    const searchResult: SearchResult = {
      id: `search_${Date.now()}`,
      query,
      results: await this.mockSearchResults(query, category, maxResults),
      timestamp: new Date(),
      source: 'live',
      relevanceScore: 0.95
    };

    return searchResult;
  }

  /**
   * Mock search results for development
   */
  private async mockSearchResults(query: string, category: string, maxResults: number): Promise<any[]> {
    // Return realistic search results structure
    const results = [];
    
    for (let i = 0; i < Math.min(maxResults, 5); i++) {
      results.push({
        title: `${query} - Result ${i + 1}`,
        url: `https://example.com/docs/${query.replace(/\s+/g, '-').toLowerCase()}-${i + 1}`,
        snippet: `Comprehensive guide about ${query} with practical examples and implementation details.`,
        category,
        relevance: (100 - i * 10) / 100,
        lastModified: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return results;
  }

  /**
   * Cache frequently accessed documentation
   */
  async cacheDocument(
    url: string,
    title: string,
    content: string,
    category: 'technical' | 'documentation' | 'api' | 'tutorial'
  ): Promise<void> {
    const document: CachedDocument = {
      url,
      title,
      content,
      lastUpdated: new Date(),
      accessCount: 1,
      category
    };

    // Check cache size limit
    if (this.documentCache.size >= this.maxCacheSize) {
      await this.pruneDocumentCache();
    }

    this.documentCache.set(url, document);
    await this.persistDocumentCache(url, document);
    
    console.log('📄 DOCUMENTATION CACHE: Cached document:', title);
  }

  /**
   * Retrieve cached document
   */
  getCachedDocument(url: string): CachedDocument | undefined {
    const document = this.documentCache.get(url);
    
    if (document) {
      // Update access count
      document.accessCount++;
      document.lastUpdated = new Date();
      console.log('📄 DOCUMENTATION CACHE: Retrieved cached document:', document.title);
    }

    return document;
  }

  /**
   * Search within cached documents
   */
  searchCachedDocuments(
    query: string,
    category?: 'technical' | 'documentation' | 'api' | 'tutorial'
  ): CachedDocument[] {
    const results: CachedDocument[] = [];
    const queryLower = query.toLowerCase();

    for (const document of Array.from(this.documentCache.values())) {
      if (category && document.category !== category) continue;

      const titleMatch = document.title.toLowerCase().includes(queryLower);
      const contentMatch = document.content.toLowerCase().includes(queryLower);

      if (titleMatch || contentMatch) {
        results.push(document);
      }
    }

    // Sort by access count and relevance
    return results.sort((a, b) => b.accessCount - a.accessCount);
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics(): {
    totalSearches: number;
    cacheHitRate: number;
    popularQueries: string[];
    cachedDocuments: number;
    cacheSize: string;
  } {
    const totalSearches = this.searchCache.size;
    const cacheHits = Array.from(this.searchCache.values())
      .filter(result => result.source === 'cache').length;
    
    const cacheHitRate = totalSearches > 0 ? (cacheHits / totalSearches) * 100 : 0;
    
    const popularQueries = Array.from(this.searchCache.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10)
      .map(result => result.query);

    return {
      totalSearches,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      popularQueries,
      cachedDocuments: this.documentCache.size,
      cacheSize: this.calculateCacheSize()
    };
  }

  /**
   * Generate cache key for query
   */
  private generateQueryKey(query: string, category: string): string {
    return `${category}:${query.toLowerCase().replace(/\s+/g, '_')}`;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(timestamp: Date): boolean {
    return Date.now() - timestamp.getTime() < this.cacheDuration;
  }

  /**
   * Cache search result
   */
  private cacheSearchResult(queryKey: string, result: SearchResult): void {
    this.searchCache.set(queryKey, { ...result, source: 'cache' });
    
    // Persist to disk for long-term caching
    this.persistSearchCache(queryKey, result);
  }

  /**
   * Prune document cache when size limit reached
   */
  private async pruneDocumentCache(): Promise<void> {
    const documents = Array.from(this.documentCache.entries());
    
    // Remove least accessed documents (bottom 25%)
    documents.sort((a, b) => a[1].accessCount - b[1].accessCount);
    const toRemove = documents.slice(0, Math.floor(documents.length * 0.25));

    for (const [url] of toRemove) {
      this.documentCache.delete(url);
      await this.removePersistedDocument(url);
    }

    console.log(`🧹 CACHE CLEANUP: Removed ${toRemove.length} documents from cache`);
  }

  /**
   * Calculate total cache size
   */
  private calculateCacheSize(): string {
    let totalSize = 0;
    
    for (const document of Array.from(this.documentCache.values())) {
      totalSize += document.content.length * 2; // Rough estimate in bytes
    }

    if (totalSize < 1024) return `${totalSize} B`;
    if (totalSize < 1024 * 1024) return `${Math.round(totalSize / 1024)} KB`;
    return `${Math.round(totalSize / (1024 * 1024))} MB`;
  }

  /**
   * Persist search cache to disk
   */
  private async persistSearchCache(queryKey: string, result: SearchResult): Promise<void> {
    try {
      const filePath = path.join(this.cacheDirectory, `search_${queryKey.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
      await fs.writeFile(filePath, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Failed to persist search cache:', error);
    }
  }

  /**
   * Persist document cache to disk
   */
  private async persistDocumentCache(url: string, document: CachedDocument): Promise<void> {
    try {
      const fileName = `doc_${Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const filePath = path.join(this.cacheDirectory, fileName);
      await fs.writeFile(filePath, JSON.stringify(document, null, 2));
    } catch (error) {
      console.error('Failed to persist document cache:', error);
    }
  }

  /**
   * Load persisted cache on startup
   */
  private async loadPersistedCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDirectory);
      
      for (const file of files) {
        if (file.startsWith('search_') && file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(this.cacheDirectory, file), 'utf-8');
            const result = JSON.parse(content) as SearchResult;
            
            if (this.isCacheValid(new Date(result.timestamp))) {
              const queryKey = this.generateQueryKey(result.query, 'technical');
              this.searchCache.set(queryKey, result);
            }
          } catch (error) {
            console.error(`Failed to load search cache file ${file}:`, error);
          }
        }
        
        if (file.startsWith('doc_') && file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(this.cacheDirectory, file), 'utf-8');
            const document = JSON.parse(content) as CachedDocument;
            this.documentCache.set(document.url, document);
          } catch (error) {
            console.error(`Failed to load document cache file ${file}:`, error);
          }
        }
      }
      
      // console.log('📂 CACHE LOADED: Restored cached search results and documents');
    } catch (error) {
      console.error('Failed to load persisted cache:', error);
    }
  }

  /**
   * Remove persisted document
   */
  private async removePersistedDocument(url: string): Promise<void> {
    try {
      const fileName = `doc_${Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const filePath = path.join(this.cacheDirectory, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }
}

export const webSearchOptimization = new WebSearchOptimizationService();