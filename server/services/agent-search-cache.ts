/**
 * Agent Search Cache System - RESTORED FROM ARCHIVE
 * Prevents repetitive search loops by caching and aggregating search results
 * Applies to ALL agents to prevent Elena-style context loss issues
 */

interface SearchCacheEntry {
  query: string;
  results: any[];
  timestamp: number;
  agentName: string;
  conversationId: string;
}

interface AgentSearchContext {
  conversationId: string;
  agentName: string;
  searchHistory: SearchCacheEntry[];
  aggregatedResults: Map<string, any>;
  totalFilesSearched: number;
  lastSearchTime: number;
}

class AgentSearchCacheService {
  private cache = new Map<string, AgentSearchContext>();
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_SEARCH_RESULTS = 500; // Aggregate up to 500 files
  
  /**
   * Get conversation-specific search context for an agent
   */
  getSearchContext(conversationId: string, agentName: string): AgentSearchContext {
    const key = `${conversationId}_${agentName}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(key, {
        conversationId,
        agentName,
        searchHistory: [],
        aggregatedResults: new Map(),
        totalFilesSearched: 0,
        lastSearchTime: 0
      });
    }
    
    return this.cache.get(key)!;
  }
  
  /**
   * Check if agent has already searched for similar content
   */
  hasSimilarSearch(context: AgentSearchContext, query: string): boolean {
    const queryLower = query.toLowerCase();
    const similarityThreshold = 0.7;
    
    return context.searchHistory.some(entry => {
      const entryQueryLower = entry.query.toLowerCase();
      const similarity = this.calculateSimilarity(queryLower, entryQueryLower);
      return similarity > similarityThreshold;
    });
  }
  
  /**
   * Add search results to agent's context cache
   */
  addSearchResults(
    conversationId: string, 
    agentName: string, 
    query: string, 
    results: any[]
  ): void {
    const context = this.getSearchContext(conversationId, agentName);
    
    // Add to search history
    const entry: SearchCacheEntry = {
      query,
      results,
      timestamp: Date.now(),
      agentName,
      conversationId
    };
    
    context.searchHistory.push(entry);
    context.lastSearchTime = Date.now();
    
    // Aggregate unique results (with null safety)
    if (results && Array.isArray(results)) {
      results.forEach(result => {
        if (result && result.path && !context.aggregatedResults.has(result.path)) {
          context.aggregatedResults.set(result.path, result);
        }
      });
    }
    
    context.totalFilesSearched = context.aggregatedResults.size;
    
    // Cleanup old entries to prevent memory bloat
    this.cleanupOldEntries(context);
  }
  
  /**
   * Get comprehensive search summary for agent context
   */
  getSearchSummary(conversationId: string, agentName: string): string {
    const context = this.getSearchContext(conversationId, agentName);
    
    if (context.searchHistory.length === 0) {
      return "No previous searches in this conversation.";
    }
    
    const recentSearches = context.searchHistory
      .slice(-5)
      .map(entry => `• ${entry.query} (${entry.results.length} results)`)
      .join('\n');
    
    const topFiles = Array.from(context.aggregatedResults.values())
      .slice(0, 20)
      .map(file => `• ${file.path}`)
      .join('\n');
    
    return `
## PREVIOUS SEARCH CONTEXT (Conversation: ${conversationId})
**Total Searches Performed**: ${context.searchHistory.length}
**Total Unique Files Found**: ${context.totalFilesSearched}
**Recent Search Queries**:
${recentSearches}

**Key Files Already Discovered**:
${topFiles}
${context.totalFilesSearched > 20 ? `\n...and ${context.totalFilesSearched - 20} more files` : ''}

**⚠️ SEARCH OPTIMIZATION**: You have comprehensive file visibility. Focus on analysis rather than additional searches.`;
  }
  
  /**
   * Suggest whether agent should search or use cached results
   */
  shouldSkipSearch(conversationId: string, agentName: string, query: string): {
    shouldSkip: boolean;
    reason: string;
    suggestedFiles?: any[];
  } {
    // CACHE SYSTEM DISABLED: Always allow agents to search actual project files
    console.log(`🚀 SEARCH ALLOWED: Agent ${agentName} performing direct filesystem search for: "${query}"`);
    return { 
      shouldSkip: false, 
      reason: "Direct filesystem search enabled - cache blocking disabled" 
    };
  }
  
  /**
   * Find relevant files from cached results
   */
  private findRelevantCachedFiles(context: AgentSearchContext, query: string): any[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);
    
    return Array.from(context.aggregatedResults.values())
      .filter(file => {
        const filePath = file.path.toLowerCase();
        const content = (file.content || '').toLowerCase();
        
        return queryTerms.some(term => 
          filePath.includes(term) || 
          content.includes(term)
        );
      })
      .sort((a, b) => {
        // Sort by relevance score
        const scoreA = this.calculateRelevanceScore(a, queryTerms);
        const scoreB = this.calculateRelevanceScore(b, queryTerms);
        return scoreB - scoreA;
      });
  }
  
  /**
   * Calculate string similarity for duplicate search detection
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Calculate relevance score for file ranking
   */
  private calculateRelevanceScore(file: any, queryTerms: string[]): number {
    const filePath = file.path.toLowerCase();
    const content = (file.content || '').toLowerCase();
    
    let score = 0;
    queryTerms.forEach(term => {
      if (filePath.includes(term)) score += 3;
      if (content.includes(term)) score += 1;
    });
    
    return score;
  }
  
  /**
   * Clean up old cache entries to prevent memory bloat
   */
  private cleanupOldEntries(context: AgentSearchContext): void {
    const now = Date.now();
    context.searchHistory = context.searchHistory.filter(
      entry => now - entry.timestamp < this.CACHE_DURATION
    );
    
    // Keep only the most recent 50 searches per conversation
    if (context.searchHistory.length > 50) {
      context.searchHistory = context.searchHistory.slice(-50);
    }
  }
  
  /**
   * Clear cache for a specific conversation (THIS IS WHAT YOU ORIGINALLY WANTED)
   */
  /**
   * OLGA'S FIX: Gentle cache refresh instead of aggressive clearing
   */
  refreshConversationCache(conversationId: string, agentName: string, preserveContext: boolean = true): void {
    const key = `${conversationId}_${agentName}`;
    
    if (preserveContext) {
      const existing = this.cache.get(key);
      if (existing) {
        (existing as any).timestamp = Date.now();
        console.log(`🔄 CACHE REFRESHED for ${agentName} in conversation ${conversationId} (context preserved)`);
        return;
      }
    }
    
    // HARD CLEAR: Only when explicitly needed
    this.cache.delete(key);
    console.log(`⚠️ CACHE CLEARED for ${agentName} in conversation ${conversationId} (context lost)`);
  }
  
  /**
   * Clear ALL cache data (keeps system, clears data)
   */
  clearAllCache(): void {
    this.cache.clear();
    console.log('🧹 ALL AGENT CACHE DATA CLEARED - System preserved');
  }
  
  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    totalConversations: number;
    totalSearches: number;
    averageFilesPerConversation: number;
  } {
    const contexts = Array.from(this.cache.values());
    const totalSearches = contexts.reduce((sum, ctx) => sum + ctx.searchHistory.length, 0);
    const totalFiles = contexts.reduce((sum, ctx) => sum + ctx.totalFilesSearched, 0);
    
    return {
      totalConversations: contexts.length,
      totalSearches,
      averageFilesPerConversation: contexts.length > 0 ? totalFiles / contexts.length : 0
    };
  }
}

// Export singleton instance - RESTORED AND ACTIVE
export const agentSearchCache = new AgentSearchCacheService();