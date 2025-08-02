/**
 * SMART ROUTING TEST SUITE
 * Tests the dual architecture implementation to verify token optimization
 */

import { smartRoutingLayer } from '../services/smart-routing-layer';
import { tokenUsageMonitor } from '../monitoring/token-usage-monitor';

export class SmartRoutingTest {
  
  /**
   * Test file operations route to direct tools
   */
  static async testFileOperations(): Promise<void> {
    console.log('🧪 TESTING: File operations routing...');
    
    // Clear previous logs
    tokenUsageMonitor.clearLog();
    
    const testCases = [
      'read file server/routes.ts',
      'create file test.ts with content console.log("test")',
      'view file package.json',
    ];
    
    for (const message of testCases) {
      try {
        const result = await smartRoutingLayer.routeRequest(
          '42585527',
          'test-agent',
          message,
          null,
          true
        );
        
        console.log('📊 FILE OP TEST RESULT:', {
          message: message.substring(0, 30),
          routingPath: result.routingPath,
          costOptimized: result.costOptimized,
          tokensUsed: result.tokenUsage || 0
        });
        
      } catch (error) {
        console.error('❌ FILE OP TEST FAILED:', message, error);
      }
    }
    
    const stats = tokenUsageMonitor.getUsageStats(1);
    console.log('📈 FILE OPERATIONS STATS:', stats);
  }
  
  /**
   * Test intelligence tasks route to Claude API
   */
  static async testIntelligenceTasks(): Promise<void> {
    console.log('🧪 TESTING: Intelligence tasks routing...');
    
    const testCases = [
      'explain how React hooks work',
      'generate a TypeScript component',
      'analyze this code architecture',
    ];
    
    for (const message of testCases) {
      try {
        const result = await smartRoutingLayer.routeRequest(
          '42585527',
          'test-agent',
          message,
          null,
          true
        );
        
        console.log('📊 INTELLIGENCE TEST RESULT:', {
          message: message.substring(0, 30),
          routingPath: result.routingPath,
          costOptimized: result.costOptimized,
          tokensUsed: result.tokenUsage || 0
        });
        
      } catch (error) {
        console.error('❌ INTELLIGENCE TEST FAILED:', message, error);
      }
    }
    
    const stats = tokenUsageMonitor.getUsageStats(1);
    console.log('📈 INTELLIGENCE TASKS STATS:', stats);
  }
  
  /**
   * Test hybrid tasks use both systems
   */
  static async testHybridTasks(): Promise<void> {
    console.log('🧪 TESTING: Hybrid tasks routing...');
    
    const testCases = [
      'create a new component file and explain the implementation',
      'read the routes file and suggest improvements',
      'update server.ts with better error handling',
    ];
    
    for (const message of testCases) {
      try {
        const result = await smartRoutingLayer.routeRequest(
          '42585527',
          'test-agent',
          message,
          null,
          true
        );
        
        console.log('📊 HYBRID TEST RESULT:', {
          message: message.substring(0, 30),
          routingPath: result.routingPath,
          costOptimized: result.costOptimized,
          tokensUsed: result.tokenUsage || 0
        });
        
      } catch (error) {
        console.error('❌ HYBRID TEST FAILED:', message, error);
      }
    }
    
    const stats = tokenUsageMonitor.getUsageStats(1);
    console.log('📈 HYBRID TASKS STATS:', stats);
  }
  
  /**
   * Run complete routing verification test
   */
  static async runCompleteTest(): Promise<{
    fileOpsUsedDirectTools: boolean;
    intelligenceUsedClaudeAPI: boolean;
    hybridUsedBoth: boolean;
    totalTokensSaved: number;
    routingWorking: boolean;
  }> {
    console.log('🚀 SMART ROUTING: Running complete verification test...');
    
    // Clear monitoring data
    tokenUsageMonitor.clearLog();
    
    // Run all test categories
    await this.testFileOperations();
    await this.testIntelligenceTasks();
    await this.testHybridTasks();
    
    // Analyze results
    const stats = tokenUsageMonitor.getUsageStats(1);
    const recentEntries = tokenUsageMonitor.getRecentEntries(50);
    
    const fileOpsUsedDirectTools = recentEntries.some(entry => 
      entry.routingPath === 'direct_tools' && entry.tokensUsed === 0
    );
    
    const intelligenceUsedClaudeAPI = recentEntries.some(entry => 
      entry.routingPath === 'claude_api' && entry.tokensUsed > 0
    );
    
    const hybridUsedBoth = recentEntries.some(entry => 
      entry.routingPath === 'hybrid'
    );
    
    const routingWorking = fileOpsUsedDirectTools && intelligenceUsedClaudeAPI;
    
    const results = {
      fileOpsUsedDirectTools,
      intelligenceUsedClaudeAPI,
      hybridUsedBoth,
      totalTokensSaved: stats.savingsPercentage,
      routingWorking,
      fullStats: stats,
      testEntries: recentEntries.length
    };
    
    console.log('✅ SMART ROUTING TEST COMPLETE:', results);
    
    return results;
  }
}

// Export test function for easy execution
export async function runSmartRoutingTest() {
  return await SmartRoutingTest.runCompleteTest();
}