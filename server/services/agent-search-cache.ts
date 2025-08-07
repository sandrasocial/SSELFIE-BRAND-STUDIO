import { LRUCache } from 'lru-cache';

interface SearchResult {
  query: string;
  results: any;
  timestamp: Date;
  agentName: string;
  userId: string;
}

interface AgentContext {
  recentSearches: SearchResult[];
  fileAccess: string[];
  lastActivity: Date;
}

export class AgentSearchCache {
  private static instance: AgentSearchCache;
  private searchCache: LRUCache<string, SearchResult>;
  private agentContexts: Map<string, AgentContext>;

  constructor() {
    this.searchCache = new LRUCache<string, SearchResult>({
      max: 500, // Store 500 recent searches
      ttl: 1000 * 60 * 30, // 30 minutes TTL
    });
    
    this.agentContexts = new Map();
  }

  static getInstance(): AgentSearchCache {
    if (!AgentSearchCache.instance) {
      AgentSearchCache.instance = new AgentSearchCache();
    }
    return AgentSearchCache.instance;
  }

  // Check if a similar search was recently performed
  shouldSkipSearch(agentName: string, userId: string, query: string): { skip: boolean; cachedResult?: any } {
    const cacheKey = `${agentName}-${userId}-${this.normalizeQuery(query)}`;
    const cached = this.searchCache.get(cacheKey);
    
    if (cached && this.isRecentSearch(cached.timestamp)) {
      console.log(`🔄 ${agentName}: Skipping repeated search for: ${query}`);
      return { skip: true, cachedResult: cached.results };
    }
    
    return { skip: false };
  }

  // Cache search results
  cacheSearchResult(agentName: string, userId: string, query: string, results: any): void {
    const cacheKey = `${agentName}-${userId}-${this.normalizeQuery(query)}`;
    const searchResult: SearchResult = {
      query,
      results,
      timestamp: new Date(),
      agentName,
      userId
    };
    
    this.searchCache.set(cacheKey, searchResult);
    
    // Update agent context
    this.updateAgentContext(agentName, userId, searchResult);
    
    console.log(`💾 ${agentName}: Cached search results for: ${query}`);
  }

  // Get agent's recent context to avoid repetition
  getAgentContext(agentName: string, userId: string): AgentContext | null {
    const contextKey = `${agentName}-${userId}`;
    return this.agentContexts.get(contextKey) || null;
  }

  private updateAgentContext(agentName: string, userId: string, searchResult: SearchResult): void {
    const contextKey = `${agentName}-${userId}`;
    let context = this.agentContexts.get(contextKey);
    
    if (!context) {
      context = {
        recentSearches: [],
        fileAccess: [],
        lastActivity: new Date()
      };
    }
    
    // Add to recent searches (keep last 10)
    context.recentSearches.unshift(searchResult);
    if (context.recentSearches.length > 10) {
      context.recentSearches = context.recentSearches.slice(0, 10);
    }
    
    context.lastActivity = new Date();
    this.agentContexts.set(contextKey, context);
  }

  // Track file access to prevent redundant operations
  trackFileAccess(agentName: string, userId: string, filePath: string): void {
    const contextKey = `${agentName}-${userId}`;
    let context = this.agentContexts.get(contextKey);
    
    if (!context) {
      context = {
        recentSearches: [],
        fileAccess: [],
        lastActivity: new Date()
      };
    }
    
    // Add file access (keep unique paths, last 20)
    if (!context.fileAccess.includes(filePath)) {
      context.fileAccess.unshift(filePath);
      if (context.fileAccess.length > 20) {
        context.fileAccess = context.fileAccess.slice(0, 20);
      }
    }
    
    this.agentContexts.set(contextKey, context);
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isRecentSearch(timestamp: Date): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - timestamp.getTime()) / (1000 * 60);
    return diffMinutes < 15; // Consider searches from last 15 minutes as recent
  }

  // Clear cache for specific agent/user
  clearAgentCache(agentName: string, userId: string): void {
    const contextKey = `${agentName}-${userId}`;
    this.agentContexts.delete(contextKey);
    
    // Clear related search cache entries
    for (const [key] of this.searchCache.entries()) {
      if (key.startsWith(`${agentName}-${userId}-`)) {
        this.searchCache.delete(key);
      }
    }
    
    console.log(`🧹 Cleared cache for ${agentName}-${userId}`);
  }
}

export const searchCache = AgentSearchCache.getInstance();