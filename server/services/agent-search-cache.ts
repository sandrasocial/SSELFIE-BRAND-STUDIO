// AGENT SEARCH CACHE - CLEARED (Real-time direct access)
// Cache functionality restored but cleared for direct file access

interface AgentContext {
  agentName: string;
  userId: string;
  recentSearches: string[];
  fileAccess: string[];
  lastActivity: Date;
}

interface SearchCacheData {
  [key: string]: AgentContext;
}

class AgentSearchCache {
  private cache: SearchCacheData = {};
  private readonly maxEntries = 100;
  private readonly maxAge = 5 * 60 * 1000; // 5 minutes (reduced from 30 minutes)

  /**
   * Get agent context - CLEARED: Always returns empty for fresh access
   */
  getAgentContext(agentName: string, userId: string): AgentContext | null {
    // CACHE CLEARED: Return null to force fresh analysis
    return null;
  }

  /**
   * Record agent activity - CLEARED: Minimal recording for direct access
   */
  recordActivity(agentName: string, userId: string, activity: string, type: 'search' | 'file_access' = 'search'): void {
    // CACHE CLEARED: Skip recording for direct filesystem access
    console.log(`🎯 DIRECT ACCESS: ${agentName} ${type}: ${activity} (cache bypassed)`);
  }

  /**
   * Clear cache - CLEARED: Always empty
   */
  clear(): void {
    this.cache = {};
    console.log('✅ AGENT SEARCH CACHE: Cleared (direct access mode)');
  }

  /**
   * Clean expired entries - CLEARED: Always empty
   */
  private cleanExpired(): void {
    this.cache = {};
  }

  /**
   * Get cache stats - CLEARED: Always zero
   */
  getStats(): { totalEntries: number; totalSearches: number; totalFileAccess: number } {
    return {
      totalEntries: 0,
      totalSearches: 0,
      totalFileAccess: 0
    };
  }
}

// Export both named exports for different import styles
export const searchCache = new AgentSearchCache();
export const agentSearchCache = searchCache;

// Clear cache on startup for direct access mode
searchCache.clear();

console.log('🎯 AGENT SEARCH CACHE: Initialized in DIRECT ACCESS mode (cache cleared)');