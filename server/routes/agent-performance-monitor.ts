import { Request, Response } from 'express';
import { storage } from '../storage';
import { agentConversations } from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function getAgentCoordinationMetrics(req: Request, res: Response) {
  try {
    // Get real-time metrics from database using Drizzle
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const conversations = await storage.db
      .select()
      .from(agentConversations)
      .where(sql`${agentConversations.timestamp} > ${todayStart}`);

    // Calculate metrics from conversations
    const uniqueAgents = new Set(conversations.map(c => c.agentName)).size;
    const totalConversations = conversations.length;
    const filesCreated = conversations.filter(c => 
      c.agentResponse?.includes('AGENT FILE OPERATION SUCCESS') ||
      c.agentResponse?.includes('created successfully')
    ).length;
    
    // Calculate success rate for file operations
    const fileOperations = conversations.filter(c => 
      c.agentResponse?.includes('file') || 
      c.agentResponse?.includes('create') ||
      c.agentResponse?.includes('component')
    ).length;
    
    const successRate = fileOperations > 0 ? Math.round((filesCreated / fileOperations) * 100) : 0;
    
    res.json({
      activeWorkflows: Math.floor(Math.random() * 3) + 1, // Will be dynamic when workflows are tracked
      agentsWorking: uniqueAgents,
      filesCreatedToday: filesCreated,
      averageResponseTime: Math.round(Math.random() * 10 + 5), // Simulated for now
      successRate: successRate,
      totalConversations: totalConversations
    });
  } catch (error) {
    console.error('Error fetching coordination metrics:', error);
    res.status(500).json({ error: 'Failed to fetch coordination metrics' });
  }
}

export async function getAgentStatuses(req: Request, res: Response) {
  try {
    // Get agent status from recent activity
    const result = await storage.db.execute(`
      SELECT 
        agent_id,
        COUNT(*) as message_count,
        COUNT(CASE WHEN agent_response LIKE '%AGENT FILE OPERATION SUCCESS%' THEN 1 END) as files_created,
        MAX(timestamp) as last_activity,
        SUBSTRING(
          ARRAY_AGG(user_message ORDER BY timestamp DESC)[1], 
          1, 100
        ) as current_task,
        ROUND(
          (COUNT(CASE WHEN agent_response LIKE '%AGENT FILE OPERATION SUCCESS%' THEN 1 END) * 100.0) / 
          NULLIF(COUNT(*), 0),
          1
        ) as efficiency
      FROM agent_conversations 
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY agent_id
      ORDER BY last_activity DESC
    `);

    const agentStatuses = result.rows.map((row: any) => {
      const timeSinceActivity = new Date().getTime() - new Date(row.last_activity).getTime();
      const minutesSince = Math.floor(timeSinceActivity / (1000 * 60));
      
      let status = 'idle';
      if (minutesSince < 5) status = 'working';
      else if (minutesSince < 30) status = 'active';

      return {
        id: row.agent_id,
        name: row.agent_id.charAt(0).toUpperCase() + row.agent_id.slice(1),
        status,
        currentTask: row.current_task || 'No recent tasks',
        lastActivity: `${minutesSince} minutes ago`,
        filesCreated: row.files_created || 0,
        efficiency: row.efficiency || 0
      };
    });

    res.json(agentStatuses);
  } catch (error) {
    console.error('Error fetching agent statuses:', error);
    res.status(500).json({ error: 'Failed to fetch agent statuses' });
  }
}

export async function getAgentAccountability(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    
    // Get detailed accountability data for specific agent
    const result = await storage.db.execute(`
      SELECT 
        timestamp,
        user_message,
        agent_response,
        CASE 
          WHEN agent_response LIKE '%files%' OR agent_response LIKE '%create%' OR agent_response LIKE '%implement%' 
          THEN 'Delivery Promise Detected'
          ELSE 'General Response'
        END as promised_deliverable,
        CASE 
          WHEN agent_response LIKE '%AGENT FILE OPERATION SUCCESS%' 
          THEN 'File Created'
          ELSE 'No File Creation'
        END as actual_delivery
      FROM agent_conversations 
      WHERE agent_id = ? 
        AND timestamp > NOW() - INTERVAL '24 hours'
      ORDER BY timestamp DESC 
      LIMIT 20
    `, [agentId]);

    const recentActivity = result.rows;
    const totalPromises = recentActivity.filter(a => a.promised_deliverable === 'Delivery Promise Detected').length;
    const deliveredFiles = recentActivity.filter(a => a.actual_delivery === 'File Created').length;
    
    const accountabilityScore = totalPromises > 0 ? Math.round((deliveredFiles / totalPromises) * 100) : 0;

    res.json({
      agentId,
      accountabilityScore,
      recentActivity: recentActivity.map(activity => ({
        timestamp: activity.timestamp,
        userMessage: activity.user_message,
        agentResponse: activity.agent_response,
        promisedDeliverable: activity.promised_deliverable,
        actualDelivery: activity.actual_delivery
      }))
    });
  } catch (error) {
    console.error('Error fetching agent accountability:', error);
    res.status(500).json({ error: 'Failed to fetch agent accountability' });
  }
}