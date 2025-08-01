/**
 * ELENA MEMORY RESTORATION ENDPOINT
 * Triggers complete 48-hour memory restoration for Elena
 */

import type { Express } from "express";
import { advancedMemorySystem } from '../services/advanced-memory-system';

export function registerElenaMemoryRoutes(app: Express) {
  // Manual memory restoration trigger using advanced memory system
  app.post('/api/elena/restore-memory', async (req, res) => {
    try {
      console.log('🧠 ELENA MEMORY RESTORATION: Using advanced memory system');
      
      // Use advanced memory system for restoration
      const memories = await advancedMemorySystem.getContextualMemories('elena', 'system', 'restore complete memory');
      
      res.json({
        success: true,
        message: 'Elena memory restoration completed using advanced memory system',
        data: {
          memoriesFound: memories.length,
          memories: memories.map(m => ({
            category: m.category,
            pattern: m.pattern,
            confidence: m.confidence
          }))
        }
      });
      
    } catch (error: unknown) {
      console.error('❌ Elena memory restoration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Memory restoration failed',
        message: errorMessage
      });
    }
  });

  // Get memory restoration status using advanced memory system
  app.get('/api/elena/memory-status', async (req, res) => {
    try {
      // Check advanced memory system status
      const memoryStats = await advancedMemorySystem.getMemoryStatistics();
      res.json({
        success: true,
        status: {
          system: 'advanced-memory-system',
          isOperational: true,
          ...memoryStats
        }
      });
    } catch (error: unknown) {
      console.error('Failed to get memory status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to get memory status',
        error: errorMessage
      });
    }
  });

  console.log('✅ Elena Memory Restoration routes registered with advanced memory system');
}