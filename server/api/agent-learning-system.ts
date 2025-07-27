/**
 * AGENT LEARNING SYSTEM API ENDPOINTS
 * Complete 4-phase AI learning ecosystem integration
 */

import type { Express } from 'express';
import { agentMemorySystem } from '../memory/AgentMemorySystem';
import { agentLearningEngine } from '../learning/AgentLearningEngine';
import { agentCollaborationNetwork } from '../collaboration/AgentCollaborationNetwork';
import { livePerformanceMonitor } from '../monitoring/LivePerformanceMonitor';

export function registerAgentLearningSystemRoutes(app: Express): void {
  
  // PHASE 1: MEMORY SYSTEM ENDPOINTS
  app.get('/api/agent-learning/memory/:agentName/:userId', async (req, res) => {
    try {
      const { agentName, userId } = req.params;
      const memoryContext = await agentMemorySystem.getAgentMemoryContext(agentName, userId);
      const conversationSummary = await agentMemorySystem.getConversationSummary(agentName, userId);
      
      res.json({
        success: true,
        memoryContext,
        conversationSummary,
        agentName,
        userId
      });
    } catch (error) {
      console.error('Memory retrieval error:', error);
      res.status(500).json({ success: false, error: 'Memory retrieval failed' });
    }
  });

  app.post('/api/agent-learning/memory/update', async (req, res) => {
    try {
      const { agentName, userId, message, response, tools, successful } = req.body;
      
      await agentMemorySystem.updateAgentMemory(agentName, userId, message, response, tools, successful);
      
      res.json({
        success: true,
        message: 'Memory updated successfully'
      });
    } catch (error) {
      console.error('Memory update error:', error);
      res.status(500).json({ success: false, error: 'Memory update failed' });
    }
  });

  // PHASE 2: LEARNING ENGINE ENDPOINTS
  app.get('/api/agent-learning/confidence/:agentName', async (req, res) => {
    try {
      const { agentName } = req.params;
      const { message, context } = req.query;
      
      const confidenceScore = await agentLearningEngine.calculateConfidenceScore(
        agentName,
        String(message),
        context ? JSON.parse(String(context)) : []
      );
      
      res.json({
        success: true,
        confidenceScore,
        agentName
      });
    } catch (error) {
      console.error('Confidence calculation error:', error);
      res.status(500).json({ success: false, error: 'Confidence calculation failed' });
    }
  });

  app.get('/api/agent-learning/metrics/:agentName/:userId', async (req, res) => {
    try {
      const { agentName, userId } = req.params;
      const learningMetrics = await agentLearningEngine.getLearningMetrics(agentName, userId);
      
      res.json({
        success: true,
        learningMetrics
      });
    } catch (error) {
      console.error('Learning metrics error:', error);
      res.status(500).json({ success: false, error: 'Learning metrics retrieval failed' });
    }
  });

  app.post('/api/agent-learning/feedback', async (req, res) => {
    try {
      const { agentName, userMessage, agentResponse, userSatisfaction, taskSuccess } = req.body;
      
      await agentLearningEngine.processFeedbackLoop(
        agentName,
        userMessage,
        agentResponse,
        userSatisfaction,
        taskSuccess
      );
      
      res.json({
        success: true,
        message: 'Feedback processed successfully'
      });
    } catch (error) {
      console.error('Feedback processing error:', error);
      res.status(500).json({ success: false, error: 'Feedback processing failed' });
    }
  });

  // PHASE 3: COLLABORATION NETWORK ENDPOINTS
  app.post('/api/agent-learning/knowledge/share', async (req, res) => {
    try {
      const { sourceAgent, knowledgeType, title, description, solution, contextTags, targetAgents } = req.body;
      
      const knowledgeId = await agentCollaborationNetwork.shareKnowledge(
        sourceAgent,
        knowledgeType,
        title,
        description,
        solution,
        contextTags,
        targetAgents
      );
      
      res.json({
        success: true,
        knowledgeId,
        message: 'Knowledge shared successfully'
      });
    } catch (error) {
      console.error('Knowledge sharing error:', error);
      res.status(500).json({ success: false, error: 'Knowledge sharing failed' });
    }
  });

  app.get('/api/agent-learning/knowledge/:agentName', async (req, res) => {
    try {
      const { agentName } = req.params;
      const { taskContext, contextTags } = req.query;
      
      const relevantKnowledge = await agentCollaborationNetwork.getRelevantKnowledge(
        agentName,
        String(taskContext),
        contextTags ? JSON.parse(String(contextTags)) : []
      );
      
      res.json({
        success: true,
        relevantKnowledge,
        agentName
      });
    } catch (error) {
      console.error('Knowledge retrieval error:', error);
      res.status(500).json({ success: false, error: 'Knowledge retrieval failed' });
    }
  });

  app.get('/api/agent-learning/collaboration/metrics', async (req, res) => {
    try {
      const collaborationMetrics = agentCollaborationNetwork.getCollaborationMetrics();
      
      res.json({
        success: true,
        collaborationMetrics
      });
    } catch (error) {
      console.error('Collaboration metrics error:', error);
      res.status(500).json({ success: false, error: 'Collaboration metrics retrieval failed' });
    }
  });

  // Enhanced routing endpoint with intelligent agent assignment
  app.post('/api/agent-learning/smart-routing', async (req, res) => {
    try {
      const { taskType, context, urgency = 'medium' } = req.body;
      
      const routing = agentCollaborationNetwork.getBestAgentForTask(taskType, context, urgency);
      
      res.json({
        success: true,
        routing,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Smart routing error:', error);
      res.status(500).json({ success: false, error: 'Smart routing failed' });
    }
  });

  // Predictive insights endpoint for anticipating user needs
  app.get('/api/agent-learning/predictive-insights/:agentName/:userId', async (req, res) => {
    try {
      const { agentName, userId } = req.params;
      
      const insights = agentMemorySystem.getPredictiveInsights(agentName, userId);
      
      res.json({
        success: true,
        insights,
        agentName,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Predictive insights error:', error);
      res.status(500).json({ success: false, error: 'Predictive insights retrieval failed' });
    }
  });

  // Enhanced memory statistics with dynamic optimization metrics
  app.get('/api/agent-learning/memory/enhanced-stats', async (req, res) => {
    try {
      const stats = agentMemorySystem.getMemoryStats();
      
      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Enhanced memory stats error:', error);
      res.status(500).json({ success: false, error: 'Enhanced memory stats retrieval failed' });
    }
  });

  app.get('/api/agent-learning/specialization/:agentName', async (req, res) => {
    try {
      const { agentName } = req.params;
      const agentSpecialization = agentCollaborationNetwork.getAgentSpecialization(agentName);
      
      res.json({
        success: true,
        agentSpecialization
      });
    } catch (error) {
      console.error('Specialization retrieval error:', error);
      res.status(500).json({ success: false, error: 'Specialization retrieval failed' });
    }
  });

  app.get('/api/agent-learning/best-agent/:taskType', async (req, res) => {
    try {
      const { taskType } = req.params;
      const { contextTags } = req.query;
      
      const bestAgent = agentCollaborationNetwork.findBestAgentForTask(
        taskType,
        contextTags ? JSON.parse(String(contextTags)) : []
      );
      
      res.json({
        success: true,
        bestAgent,
        taskType
      });
    } catch (error) {
      console.error('Best agent selection error:', error);
      res.status(500).json({ success: false, error: 'Best agent selection failed' });
    }
  });

  // PHASE 4: LIVE PERFORMANCE MONITORING ENDPOINTS
  app.get('/api/agent-learning/performance/current/:userId?', async (req, res) => {
    try {
      const userId = req.params.userId || '42585527';
      const currentPerformance = await livePerformanceMonitor.getCurrentPerformance(userId);
      
      res.json({
        success: true,
        currentPerformance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Performance retrieval error:', error);
      res.status(500).json({ success: false, error: 'Performance retrieval failed' });
    }
  });

  app.get('/api/agent-learning/performance/overview/:userId?', async (req, res) => {
    try {
      const userId = req.params.userId || '42585527';
      const systemOverview = await livePerformanceMonitor.getSystemOverview(userId);
      
      res.json({
        success: true,
        systemOverview
      });
    } catch (error) {
      console.error('System overview error:', error);
      res.status(500).json({ success: false, error: 'System overview retrieval failed' });
    }
  });

  app.get('/api/agent-learning/performance/progress/:agentName/:userId?', async (req, res) => {
    try {
      const { agentName } = req.params;
      const userId = req.params.userId || '42585527';
      const learningProgress = await livePerformanceMonitor.getLearningProgress(agentName, userId);
      
      res.json({
        success: true,
        learningProgress
      });
    } catch (error) {
      console.error('Learning progress error:', error);
      res.status(500).json({ success: false, error: 'Learning progress retrieval failed' });
    }
  });

  app.get('/api/agent-learning/performance/alerts', async (req, res) => {
    try {
      const alerts = livePerformanceMonitor.getRealTimeAlerts();
      
      res.json({
        success: true,
        alerts
      });
    } catch (error) {
      console.error('Alerts retrieval error:', error);
      res.status(500).json({ success: false, error: 'Alerts retrieval failed' });
    }
  });

  app.post('/api/agent-learning/performance/alert', async (req, res) => {
    try {
      const { severity, agentName, message } = req.body;
      
      livePerformanceMonitor.addAlert(severity, agentName, message);
      
      res.json({
        success: true,
        message: 'Alert added successfully'
      });
    } catch (error) {
      console.error('Alert creation error:', error);
      res.status(500).json({ success: false, error: 'Alert creation failed' });
    }
  });

  app.post('/api/agent-learning/performance/monitoring/start', async (req, res) => {
    try {
      const { intervalSeconds = 30 } = req.body;
      
      livePerformanceMonitor.startMonitoring(intervalSeconds);
      
      res.json({
        success: true,
        message: `Monitoring started with ${intervalSeconds}s intervals`
      });
    } catch (error) {
      console.error('Monitoring start error:', error);
      res.status(500).json({ success: false, error: 'Monitoring start failed' });
    }
  });

  app.post('/api/agent-learning/performance/monitoring/stop', async (req, res) => {
    try {
      livePerformanceMonitor.stopMonitoring();
      
      res.json({
        success: true,
        message: 'Monitoring stopped successfully'
      });
    } catch (error) {
      console.error('Monitoring stop error:', error);
      res.status(500).json({ success: false, error: 'Monitoring stop failed' });
    }
  });

  // SYSTEM STATUS ENDPOINTS
  app.get('/api/agent-learning/system/status', async (req, res) => {
    try {
      const memoryStats = agentMemorySystem.getMemoryStats();
      const learningStats = agentLearningEngine.getLearningStats();
      const collaborationStats = agentCollaborationNetwork.getCollaborationStats();
      const monitoringStats = livePerformanceMonitor.getMonitoringStats();
      
      res.json({
        success: true,
        systemStatus: {
          memory: memoryStats,
          learning: learningStats,
          collaboration: collaborationStats,
          monitoring: monitoringStats,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('System status error:', error);
      res.status(500).json({ success: false, error: 'System status retrieval failed' });
    }
  });

  app.post('/api/agent-learning/system/clear-cache', async (req, res) => {
    try {
      const { component } = req.body; // 'memory', 'learning', 'collaboration', 'monitoring', or 'all'
      
      if (component === 'memory' || component === 'all') {
        agentMemorySystem.clearCache();
      }
      if (component === 'learning' || component === 'all') {
        agentLearningEngine.clearCache();
      }
      if (component === 'collaboration' || component === 'all') {
        agentCollaborationNetwork.clearCache();
      }
      if (component === 'monitoring' || component === 'all') {
        livePerformanceMonitor.clearHistory();
      }
      
      res.json({
        success: true,
        message: `Cache cleared for: ${component}`
      });
    } catch (error) {
      console.error('Cache clear error:', error);
      res.status(500).json({ success: false, error: 'Cache clear failed' });
    }
  });

  console.log('✅ AGENT LEARNING SYSTEM API: All 4-phase endpoints registered successfully');
}