import { search_filesystem } from '../tools/search_filesystem.js';
class SemanticSearchSystem {
    activeSystemLog() {
        console.log('🧠 SEMANTIC SEARCH: Using comprehensive intelligent search system');
        console.log('🔍 FEATURES: Natural language, priority ranking, contextual discovery');
    }
    async intelligentFileSearch(query, options = {}) {
        this.activeSystemLog();
        try {
            const results = await search_filesystem({
                query_description: query,
                class_names: options.contextHints || [],
                function_names: []
            });
            return (results?.results || []).slice(0, options.maxResults || 10).map(result => ({
                filePath: result.fileName,
                relevanceScore: (result.priority || 50) / 100,
                contextType: this.determineContextType(result.fileName),
                description: result.reason,
                dependencies: [],
                relatedFiles: result.relatedFiles || []
            }));
        }
        catch (error) {
            console.error('❌ DEPRECATED SEARCH ERROR:', error);
            return [];
        }
    }
    determineContextType(filePath) {
        if (filePath.includes('/components/') || filePath.endsWith('.tsx'))
            return 'component';
        if (filePath.includes('/services/'))
            return 'service';
        if (filePath.includes('/utils/'))
            return 'utility';
        if (filePath.includes('schema') || filePath.includes('database'))
            return 'schema';
        if (filePath.includes('config'))
            return 'config';
        return 'unknown';
    }
    clearCache() {
        console.log('🧹 DEPRECATED: Cache cleared (functionality moved to intelligent search system)');
    }
}
export const semanticSearchSystem = new SemanticSearchSystem();
//# sourceMappingURL=semantic-search-system.js.map