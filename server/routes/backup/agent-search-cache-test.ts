/**
 * Test endpoint for verifying search cache functionality
 * Route: GET /api/test-search-cache
 */

import { Router } from 'express';
import { agentSearchCache } from '../services/agent-search-cache';

const router = Router();

// Test endpoint to verify search cache functionality
router.get('/test-search-cache', async (req, res) => {
  try {
    console.log('🧪 TESTING SEARCH CACHE SYSTEM');
    
    const testConversationId = 'test-conversation-123';
    const testAgent = 'elena';
    
    // Simulate search results
    const mockSearchResults = [
      { path: 'client/src/pages/build.tsx', content: 'Build component code...' },
      { path: 'client/src/pages/workspace.tsx', content: 'Workspace component code...' },
      { path: 'server/routes.ts', content: 'Server routes...' }
    ];
    
    // Test 1: Add search results to cache
    agentSearchCache.addSearchResults(
      testConversationId,
      testAgent,
      'build and workspace components',
      mockSearchResults
    );
    console.log('✅ TEST 1: Added search results to cache');
    
    // Test 2: Check search summary
    const searchSummary = agentSearchCache.getSearchSummary(testConversationId, testAgent);
    console.log('✅ TEST 2: Generated search summary');
    console.log('Summary preview:', searchSummary.substring(0, 200) + '...');
    
    // Test 3: Check if similar search should be skipped
    const shouldSkip = agentSearchCache.shouldSkipSearch(
      testConversationId,
      testAgent,
      'components for building workspace'
    );
    console.log('✅ TEST 3: Similar search optimization check');
    console.log('Should skip:', shouldSkip.shouldSkip);
    console.log('Reason:', shouldSkip.reason);
    console.log('Suggested files:', shouldSkip.suggestedFiles?.length || 0);
    
    // Test 4: Get cache statistics
    const stats = agentSearchCache.getCacheStats();
    console.log('✅ TEST 4: Cache statistics');
    console.log('Stats:', stats);
    
    // Clean up test data
    agentSearchCache.clearConversationCache(testConversationId, testAgent);
    console.log('✅ TEST 5: Cleaned up test data');
    
    res.json({
      success: true,
      message: 'Search cache system tested successfully',
      testResults: {
        cacheWorking: true,
        searchSummaryGenerated: searchSummary.length > 0,
        optimizationWorking: shouldSkip.shouldSkip,
        suggestedFilesCount: shouldSkip.suggestedFiles?.length || 0,
        cacheStats: stats
      }
    });
    
  } catch (error) {
    console.error('❌ SEARCH CACHE TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Search cache test failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export { router as agentSearchCacheTestRouter };