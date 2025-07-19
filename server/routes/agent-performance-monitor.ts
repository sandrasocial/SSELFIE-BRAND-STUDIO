import { Router } from 'express';
import { db } from '../db';
import { agentConversations, agentPerformanceMetrics } from '@shared/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Real-time agent performance monitoring endpoint
router.get('/api/agent-performance/live', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get real-time agent activity and file creation metrics
    const agentActivity = await db
      .select({
        agentId: agentConversations.agentId,
        totalConversations: sql<number>`COUNT(*)`,
        recentActivity: sql<number>`COUNT(CASE WHEN timestamp > NOW() - INTERVAL '10 minutes' THEN 1 END)`,
        filesCreated: sql<number>`COUNT(CASE WHEN agent_response LIKE '%AGENT FILE OPERATION SUCCESS%' THEN 1 END)`,
        lastActivity: sql<string>`MAX(timestamp)`,
        minutesSinceLastActivity: sql<number>`EXTRACT(MINUTE FROM (NOW() - MAX(timestamp)))`,
        currentStatus: sql<string>`CASE 
          WHEN MAX(timestamp) > NOW() - INTERVAL '2 minutes' THEN 'active'
          WHEN MAX(timestamp) > NOW() - INTERVAL '10 minutes' THEN 'working' 
          ELSE 'idle'
        END`
      })
      .from(agentConversations)
      .where(eq(agentConversations.userId, userId))
      .groupBy(agentConversations.agentId)
      .orderBy(desc(sql`MAX(timestamp)`));

    // Calculate AI speed effectiveness metrics
    const performanceMetrics = agentActivity.map(agent => ({
      ...agent,
      aiSpeedRating: calculateAISpeedRating(agent.recentActivity, agent.filesCreated, agent.minutesSinceLastActivity),
      deliveryEfficiency: (agent.filesCreated / Math.max(agent.totalConversations, 1)) * 100
    }));

    res.json({
      timestamp: new Date().toISOString(),
      totalActiveAgents: agentActivity.filter(a => a.currentStatus === 'active').length,
      averageResponseTime: calculateAverageResponseTime(agentActivity),
      totalFilesCreated: agentActivity.reduce((sum, a) => sum + a.filesCreated, 0),
      agents: performanceMetrics
    });

  } catch (error) {
    console.error('Agent performance monitoring error:', error);
    res.status(500).json({ error: 'Failed to fetch agent performance data' });
  }
});

// Agent accountability tracking endpoint
router.get('/api/agent-accountability/:agentId', isAuthenticated, async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = req.user?.claims?.sub;

    const accountabilityData = await db
      .select({
        timestamp: agentConversations.timestamp,
        userMessage: agentConversations.userMessage,
        agentResponse: agentConversations.agentResponse,
        promisedDeliverable: sql<string>`CASE 
          WHEN agent_response LIKE '%minutes%' OR agent_response LIKE '%complete%' OR agent_response LIKE '%will%' 
          THEN 'Delivery Promise Detected' 
          ELSE 'General Response' 
        END`,
        actualDelivery: sql<string>`CASE 
          WHEN agent_response LIKE '%AGENT FILE OPERATION SUCCESS%' 
          THEN 'File Created' 
          ELSE 'No File Creation' 
        END`
      })
      .from(agentConversations)
      .where(eq(agentConversations.agentId, agentId))
      .orderBy(desc(agentConversations.timestamp))
      .limit(20);

    res.json({
      agentId,
      accountabilityScore: calculateAccountabilityScore(accountabilityData),
      recentActivity: accountabilityData
    });

  } catch (error) {
    console.error('Agent accountability tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch accountability data' });
  }
});

// Helper functions for AI performance calculations
function calculateAISpeedRating(recentActivity: number, filesCreated: number, minutesSince: number): number {
  // AI Speed Rating: 0-100 based on recent activity, file creation, and response time
  const activityScore = Math.min(recentActivity * 20, 40); // Max 40 points for activity
  const deliveryScore = Math.min(filesCreated * 30, 40); // Max 40 points for file delivery
  const speedScore = minutesSince < 2 ? 20 : minutesSince < 5 ? 10 : 0; // Max 20 points for speed
  
  return Math.min(activityScore + deliveryScore + speedScore, 100);
}

function calculateAverageResponseTime(agents: any[]): number {
  const activeTimes = agents.map(a => a.minutesSinceLastActivity).filter(t => t < 60);
  return activeTimes.length > 0 ? activeTimes.reduce((sum, time) => sum + time, 0) / activeTimes.length : 0;
}

function calculateAccountabilityScore(conversations: any[]): number {
  const promises = conversations.filter(c => c.promisedDeliverable === 'Delivery Promise Detected').length;
  const deliveries = conversations.filter(c => c.actualDelivery === 'File Created').length;
  
  return promises > 0 ? Math.round((deliveries / promises) * 100) : 100;
}

export default router;