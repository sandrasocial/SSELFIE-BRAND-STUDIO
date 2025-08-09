import { Router } from 'express';
// ELIMINATED: ContextPreservationSystem - replaced with simple-memory-service
import { simpleMemoryService } from '../services/simple-memory-service';
import { autonomousNavigation } from '../services/autonomous-navigation-system';
import { UnifiedStateManager } from '../services/unified-state-manager';
import { CodebaseUnderstandingIntelligence } from '../agents/codebase-understanding-intelligence';
import { agentPerformanceMonitor } from '../services/agent-performance-monitor';
import { requireAdmin, validateUserId, getAdminUserData } from '../middleware/admin-middleware';

const adminCacheRouter = Router();

/**
 * ADMIN CACHE CLEANING ENDPOINT
 * Cleans cached data for fresh agent starts
 */
adminCacheRouter.post('/clear-agent-cache', requireAdmin, async (req, res) => {
  try {
    const adminData = getAdminUserData();
    const { userId = adminData.id, clearAll = false } = req.body;
    
    // Validate user ID format
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: `User ID validation failed: ${userIdValidation.idType}`
      });
    }
    
    console.log('🧹 ADMIN CACHE CLEAN: Starting cache cleanup...');
    
    // Clear simplified memory cache
    simpleMemoryService.clearAgentMemory('*', userIdValidation.normalizedId!);
    
    // Clear navigation learning data
    autonomousNavigation.clearNavigationData();
    
    // Clear workspace state
    UnifiedStateManager.getInstance().clearWorkspaceState();
    
    // Clear codebase intelligence cache
    CodebaseUnderstandingIntelligence.clearCache();
    
    console.log('✅ ADMIN CACHE CLEAN: All cached data cleared successfully');
    
    res.json({
      success: true,
      message: 'Agent cache cleared successfully',
      cleared: [
        'Context preservation cache',
        'Navigation learning patterns', 
        'Agent workspace state',
        'Codebase intelligence cache'
      ]
    });
    
  } catch (error) {
    console.error('❌ ADMIN CACHE CLEAN: Failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET AGENT PERFORMANCE METRICS
 * Returns performance metrics for all agents
 */
adminCacheRouter.get('/agent-performance', async (req, res) => {
  try {
    const systemOverview = agentPerformanceMonitor.getSystemOverview();
    const performanceIssues = agentPerformanceMonitor.checkPerformanceIssues();
    
    // Get individual agent reports
    const agentReports: Record<string, any> = {};
    ['victoria', 'maya', 'rachel', 'sophia', 'ava', 'quinn', 'martha', 'diana', 'wilma'].forEach(agentId => {
      agentReports[agentId] = agentPerformanceMonitor.getAgentPerformanceReport(agentId);
    });

    res.json({
      success: true,
      systemOverview,
      performanceIssues,
      agentReports
    });

  } catch (error) {
    console.error('❌ ADMIN PERFORMANCE CHECK: Failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default adminCacheRouter;