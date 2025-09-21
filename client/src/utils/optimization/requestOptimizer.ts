/**
 * Request Optimization with Caching and Deduplication
 */

export class RequestOptimizer {
  private static pendingRequests: Map<string, Promise<any>> = new Map();
  private static requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static async request<T>(
    key: string,
    requestFn: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    // Check cache first
    if (useCache) {
      const cached = this.requestCache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📦 Cache hit for ${key}`);
        return cached.data;
      }
    }

    // Check if request is already pending (deduplication)
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      console.log(`⏳ Deduplicating request for ${key}`);
      return pendingRequest;
    }

    // Make new request
    const promise = requestFn().then(data => {
      // Cache the result
      if (useCache) {
        this.requestCache.set(key, { data, timestamp: Date.now() });
      }
      
      // Remove from pending
      this.pendingRequests.delete(key);
      
      return data;
    }).catch(error => {
      // Remove from pending on error
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  static clearCache() {
    this.requestCache.clear();
    console.log('🧹 Request cache cleared');
  }

  static clearPendingRequests() {
    this.pendingRequests.clear();
    console.log('🧹 Pending requests cleared');
  }

  static getCacheStats() {
    return {
      cacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.requestCache.keys())
    };
  }
}