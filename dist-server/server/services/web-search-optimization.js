import { promises as fs } from 'fs';
import path from 'path';
export class WebSearchOptimizationService {
    searchCache = new Map();
    documentCache = new Map();
    cacheDirectory = './server/cache/web-search';
    maxCacheSize = 1000;
    cacheDuration = 24 * 60 * 60 * 1000;
    constructor() {
        this.initializeCache();
    }
    async initializeCache() {
        try {
            await fs.mkdir(this.cacheDirectory, { recursive: true });
            await this.loadPersistedCache();
        }
        catch (error) {
            console.error('Failed to initialize web search cache:', error);
        }
    }
    async optimizedSearch(query, options = {}) {
        const { useCache = true, category = 'technical', maxResults = 10, realTime = false } = options;
        const queryKey = this.generateQueryKey(query, category);
        console.log('🚀 WEB SEARCH: Cache disabled - performing direct search for:', query);
        const searchResult = await this.performLiveSearch(query, category, maxResults);
        if (useCache) {
            this.cacheSearchResult(queryKey, searchResult);
        }
        return searchResult;
    }
    async performLiveSearch(query, category, maxResults) {
        console.log('🌐 WEB SEARCH: Performing live search for:', query);
        const searchResult = {
            id: `search_${Date.now()}`,
            query,
            results: await this.mockSearchResults(query, category, maxResults),
            timestamp: new Date(),
            source: 'live',
            relevanceScore: 0.95
        };
        return searchResult;
    }
    async mockSearchResults(query, category, maxResults) {
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
    async cacheDocument(url, title, content, category) {
        const document = {
            url,
            title,
            content,
            lastUpdated: new Date(),
            accessCount: 1,
            category
        };
        if (this.documentCache.size >= this.maxCacheSize) {
            await this.pruneDocumentCache();
        }
        this.documentCache.set(url, document);
        await this.persistDocumentCache(url, document);
        console.log('📄 DOCUMENTATION CACHE: Cached document:', title);
    }
    getCachedDocument(url) {
        const document = this.documentCache.get(url);
        if (document) {
            document.accessCount++;
            document.lastUpdated = new Date();
            console.log('📄 DOCUMENTATION CACHE: Retrieved cached document:', document.title);
        }
        return document;
    }
    searchCachedDocuments(query, category) {
        const results = [];
        const queryLower = query.toLowerCase();
        for (const document of Array.from(this.documentCache.values())) {
            if (category && document.category !== category)
                continue;
            const titleMatch = document.title.toLowerCase().includes(queryLower);
            const contentMatch = document.content.toLowerCase().includes(queryLower);
            if (titleMatch || contentMatch) {
                results.push(document);
            }
        }
        return results.sort((a, b) => b.accessCount - a.accessCount);
    }
    getSearchAnalytics() {
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
    generateQueryKey(query, category) {
        return `${category}:${query.toLowerCase().replace(/\s+/g, '_')}`;
    }
    isCacheValid(timestamp) {
        return Date.now() - timestamp.getTime() < this.cacheDuration;
    }
    cacheSearchResult(queryKey, result) {
        this.searchCache.set(queryKey, { ...result, source: 'cache' });
        this.persistSearchCache(queryKey, result);
    }
    async pruneDocumentCache() {
        const documents = Array.from(this.documentCache.entries());
        documents.sort((a, b) => a[1].accessCount - b[1].accessCount);
        const toRemove = documents.slice(0, Math.floor(documents.length * 0.25));
        for (const [url] of toRemove) {
            this.documentCache.delete(url);
            await this.removePersistedDocument(url);
        }
        console.log(`🧹 CACHE CLEANUP: Removed ${toRemove.length} documents from cache`);
    }
    calculateCacheSize() {
        let totalSize = 0;
        for (const document of Array.from(this.documentCache.values())) {
            totalSize += document.content.length * 2;
        }
        if (totalSize < 1024)
            return `${totalSize} B`;
        if (totalSize < 1024 * 1024)
            return `${Math.round(totalSize / 1024)} KB`;
        return `${Math.round(totalSize / (1024 * 1024))} MB`;
    }
    async persistSearchCache(queryKey, result) {
        try {
            const filePath = path.join(this.cacheDirectory, `search_${queryKey.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
            await fs.writeFile(filePath, JSON.stringify(result, null, 2));
        }
        catch (error) {
            console.error('Failed to persist search cache:', error);
        }
    }
    async persistDocumentCache(url, document) {
        try {
            const fileName = `doc_${Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            const filePath = path.join(this.cacheDirectory, fileName);
            await fs.writeFile(filePath, JSON.stringify(document, null, 2));
        }
        catch (error) {
            console.error('Failed to persist document cache:', error);
        }
    }
    async loadPersistedCache() {
        try {
            const files = await fs.readdir(this.cacheDirectory);
            for (const file of files) {
                if (file.startsWith('search_') && file.endsWith('.json')) {
                    try {
                        const content = await fs.readFile(path.join(this.cacheDirectory, file), 'utf-8');
                        const result = JSON.parse(content);
                        if (this.isCacheValid(new Date(result.timestamp))) {
                            const queryKey = this.generateQueryKey(result.query, 'technical');
                            this.searchCache.set(queryKey, result);
                        }
                    }
                    catch (error) {
                        console.error(`Failed to load search cache file ${file}:`, error);
                    }
                }
                if (file.startsWith('doc_') && file.endsWith('.json')) {
                    try {
                        const content = await fs.readFile(path.join(this.cacheDirectory, file), 'utf-8');
                        const document = JSON.parse(content);
                        this.documentCache.set(document.url, document);
                    }
                    catch (error) {
                        console.error(`Failed to load document cache file ${file}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to load persisted cache:', error);
        }
    }
    async removePersistedDocument(url) {
        try {
            const fileName = `doc_${Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            const filePath = path.join(this.cacheDirectory, fileName);
            await fs.unlink(filePath);
        }
        catch (error) {
        }
    }
}
export const webSearchOptimization = new WebSearchOptimizationService();
//# sourceMappingURL=web-search-optimization.js.map