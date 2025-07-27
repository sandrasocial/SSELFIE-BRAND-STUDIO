/**
 * ELENA MEMORY RESTORATION ENDPOINT
 * Triggers complete 48-hour memory restoration for Elena
 */

import type { Express } from "express";
import { elenaMemoryRestoration } from '../services/elena-memory-restoration';

export function registerElenaMemoryRoutes(app: Express) {
  // Manual memory restoration trigger
  app.post('/api/elena/restore-memory', async (req, res) => {
    try {
      console.log('🧠 ELENA MEMORY RESTORATION: Manual trigger initiated');
      
      const restoredMemory = await elenaMemoryRestoration.restoreComplete48HourMemory();
      
      res.json({
        success: true,
        message: 'Elena memory restoration completed',
        summary: elenaMemoryRestoration.getMemorySummary(),
        stats: {
          conversations: restoredMemory.conversations.length,
          workflows: restoredMemory.workflows.length,
          keyInsights: restoredMemory.keyInsights.length,
          timelineEvents: restoredMemory.timeline.length
        }
      });
      
    } catch (error) {
      console.error('❌ Elena memory restoration failed:', error);
      res.status(500).json({
        success: false,
        error: 'Memory restoration failed',
        message: error.message
      });
    }
  });

  console.log('✅ Elena Memory Restoration routes registered');
}