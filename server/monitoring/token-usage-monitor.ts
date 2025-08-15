/**
 * TOKEN USAGE MONITORING
 * Tracks and analyzes token consumption patterns to verify smart routing effectiveness
 */

export interface TokenUsageEntry {
  timestamp: Date;
  agentName: string;
  requestType: string;
  routingPath: 'direct_tools' | 'claude_api' | 'hybrid';
  tokensUsed: number;
  costOptimized: boolean;
  message: string;
  userId: string;
}

export class TokenUsageMonitor {
  private static instance: TokenUsageMonitor;
  private usageLog: TokenUsageEntry[] = [];
  private readonly MAX_LOG_SIZE = 1000;

  static getInstance(): TokenUsageMonitor {
    if (!TokenUsageMonitor.instance) {
      TokenUsageMonitor.instance = new TokenUsageMonitor();
    }
    return TokenUsageMonitor.instance;
  }

  /**
   * Log token usage for analysis
   */
  logTokenUsage(entry: Omit<TokenUsageEntry, 'timestamp'>): void {
    const fullEntry: TokenUsageEntry = {
      ...entry,
      timestamp: new Date()
    };

    this.usageLog.push(fullEntry);

    // Keep log size manageable
    if (this.usageLog.length > this.MAX_LOG_SIZE) {
      this.usageLog = this.usageLog.slice(-this.MAX_LOG_SIZE);
    }

    console.log('📊 TOKEN USAGE:', {
      agent: entry.agentName,
      routing: entry.routingPath,
      tokens: entry.tokensUsed,
      optimized: entry.costOptimized
    });
  }

  /**
   * Get token usage statistics
   */
  getUsageStats(timeWindowHours: number = 24): {
    totalTokens: number;
    optimizedRequests: number;
    totalRequests: number;
    savingsPercentage: number;
    routingBreakdown: Record<string, number>;
  } {
    const cutoff = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const recentEntries = this.usageLog.filter(entry => entry.timestamp > cutoff);

    const totalTokens = recentEntries.reduce((sum, entry) => sum + entry.tokensUsed, 0);
    const optimizedRequests = recentEntries.filter(entry => entry.costOptimized).length;
    const totalRequests = recentEntries.length;

    const routingBreakdown = recentEntries.reduce((breakdown, entry) => {
      breakdown[entry.routingPath] = (breakdown[entry.routingPath] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    // Estimate potential savings (assuming all requests would have used Claude API)
    const directToolRequests = recentEntries.filter(entry => entry.routingPath === 'direct_tools').length;
    const estimatedSavedTokens = directToolRequests * 4000; // Minimum Claude API usage
    const savingsPercentage = totalRequests > 0 ? (estimatedSavedTokens / (totalTokens + estimatedSavedTokens)) * 100 : 0;

    return {
      totalTokens,
      optimizedRequests,
      totalRequests,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
      routingBreakdown
    };
  }

  /**
   * Get recent usage entries for debugging
   */
  getRecentEntries(limit: number = 10): TokenUsageEntry[] {
    return this.usageLog.slice(-limit);
  }

  /**
   * Clear usage log (for testing/reset)
   */
  clearLog(): void {
    this.usageLog = [];
    console.log('📊 TOKEN MONITOR: Usage log cleared');
  }
}

export const tokenUsageMonitor = TokenUsageMonitor.getInstance();