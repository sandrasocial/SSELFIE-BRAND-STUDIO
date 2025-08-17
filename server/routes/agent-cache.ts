import express, { Request, Response } from 'express';
import { agentSearchCache } from '../services/agent-search-cache';

const router = express.Router();

/**
 * Clear cache for specific conversation (what you originally wanted)
 */
router.post('/clear-conversation', (req: Request, res: Response) => {
  const { conversationId, agentName } = req.body;
  
  if (!conversationId || !agentName) {
    return res.status(400).json({ 
      error: 'conversationId and agentName are required' 
    });
  }
  
  agentSearchCache.clearConversationCache(conversationId, agentName);
  
  res.json({ 
    success: true, 
    message: `Cache cleared for ${agentName} in conversation ${conversationId}` 
  });
});

/**
 * Clear ALL cache data (keeps system, clears data)
 */
router.post('/clear-all', (req: Request, res: Response) => {
  agentSearchCache.clearAllCache();
  
  res.json({ 
    success: true, 
    message: 'All agent cache data cleared - System preserved' 
  });
});

/**
 * Get cache statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  const stats = agentSearchCache.getCacheStats();
  res.json({ 
    success: true, 
    stats 
  });
});

/**
 * Get search summary for specific agent/conversation
 */
router.get('/summary/:conversationId/:agentName', (req: Request, res: Response) => {
  const { conversationId, agentName } = req.params;
  const summary = agentSearchCache.getSearchSummary(conversationId, agentName);
  
  res.json({ 
    success: true, 
    summary 
  });
});

export default router;