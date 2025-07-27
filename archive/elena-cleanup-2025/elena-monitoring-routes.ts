import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { db } from "../db";
import { agentConversations } from "@shared/schema";
import { sql } from "drizzle-orm";

export function registerElenaMonitoringRoutes(app: Express) {
  // Agent Activity Monitor - Elena's coordination system
  app.post("/api/admin/agent-activity-monitor", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get recent agent activity from conversations
      const recentActivity = await db
        .select({
          agent_id: agentConversations.agentId,
          agent_response: agentConversations.agentResponse,
          timestamp: agentConversations.timestamp,
          user_message: agentConversations.userMessage
        })
        .from(agentConversations)
        .where(sql`${agentConversations.timestamp} > NOW() - INTERVAL '10 minutes'`)
        .orderBy(sql`${agentConversations.timestamp} DESC`)
        .limit(50);

      // Process activity into agent statuses
      const agentStatuses = processAgentActivity(recentActivity);
      
      // Get workflow tasks (if any are active)
      const workflowTasks = await getActiveWorkflowTasks();

      res.json({
        success: true,
        agentStatuses,
        workflowTasks,
        lastUpdate: new Date().toISOString(),
        monitoringActive: true
      });

    } catch (error) {
      console.error("Elena monitoring error:", error);
      res.status(500).json({ error: "Failed to monitor agent activity" });
    }
  });

  // Elena's Agent Status Report
  app.post("/api/admin/elena/status-report", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get comprehensive agent status for Elena's reporting
      const allAgents = ['aria', 'zara', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'];
      const agentReports = [];

      for (const agentId of allAgents) {
        const lastActivity = await db
          .select({
            timestamp: agentConversations.timestamp,
            user_message: agentConversations.userMessage,
            agent_response: agentConversations.agentResponse
          })
          .from(agentConversations)
          .where(eq(agentConversations.agentId, agentId))
          .orderBy(desc(agentConversations.timestamp))
          .limit(1);

        const isActive = lastActivity.length > 0 && 
          (new Date().getTime() - new Date(lastActivity[0].timestamp).getTime()) < 5 * 60 * 1000; // 5 minutes

        agentReports.push({
          agentId,
          isActive,
          lastActivity: lastActivity[0] || null,
          currentTask: extractCurrentTask(lastActivity[0]?.agent_response || ''),
          status: isActive ? 'working' : 'idle'
        });
      }

      // Elena's formatted report
      const elenaReport = {
        totalAgents: allAgents.length,
        activeAgents: agentReports.filter(a => a.isActive).length,
        idleAgents: agentReports.filter(a => !a.isActive).length,
        agentDetails: agentReports,
        coordinationSummary: generateCoordinationSummary(agentReports),
        recommendations: generateElenaRecommendations(agentReports)
      };

      res.json({
        success: true,
        report: elenaReport,
        timestamp: new Date().toISOString(),
        elenaStatus: 'monitoring'
      });

    } catch (error) {
      console.error("Elena status report error:", error);
      res.status(500).json({ error: "Failed to generate status report" });
    }
  });
}

function processAgentActivity(activity: any[]): any[] {
  const agents = ['aria', 'zara', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'];
  const agentStatuses = [];

  for (const agentId of agents) {
    const agentActivity = activity.filter(a => a.agent_id === agentId);
    const latestActivity = agentActivity[0];
    
    let status = 'idle';
    let currentTask = 'Awaiting tasks';
    let progress = 0;
    let lastActivity = 'Ready';
    let timeRemaining = '--';

    if (latestActivity) {
      const timeDiff = new Date().getTime() - new Date(latestActivity.timestamp).getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      if (minutesAgo < 5) {
        status = 'working';
        currentTask = extractCurrentTask(latestActivity.agent_response);
        progress = estimateProgress(latestActivity.agent_response);
        timeRemaining = estimateTimeRemaining(latestActivity.agent_response);
      }
      
      lastActivity = minutesAgo === 0 ? 'Now' : `${minutesAgo}m ago`;
    }

    agentStatuses.push({
      id: agentId,
      name: capitalizeFirst(agentId),
      status,
      currentTask,
      progress,
      lastActivity,
      timeRemaining
    });
  }

  return agentStatuses;
}

function extractCurrentTask(response: string): string {
  if (!response) return 'Awaiting tasks';
  
  // Look for task indicators in agent responses
  const taskPatterns = [
    /working on (.+?)[\.\!]/i,
    /creating (.+?)[\.\!]/i,
    /implementing (.+?)[\.\!]/i,
    /designing (.+?)[\.\!]/i,
    /building (.+?)[\.\!]/i
  ];

  for (const pattern of taskPatterns) {
    const match = response.match(pattern);
    if (match) {
      return match[1].substring(0, 50) + (match[1].length > 50 ? '...' : '');
    }
  }

  return 'Processing task';
}

function estimateProgress(response: string): number {
  // Simple progress estimation based on response content
  if (response.includes('completed') || response.includes('finished')) return 100;
  if (response.includes('almost done') || response.includes('finalizing')) return 85;
  if (response.includes('working on') || response.includes('implementing')) return 60;
  if (response.includes('starting') || response.includes('beginning')) return 20;
  return 0;
}

function estimateTimeRemaining(response: string): string {
  // Simple time estimation
  if (response.includes('almost done')) return '2-3 min';
  if (response.includes('working on')) return '5-10 min';
  if (response.includes('complex') || response.includes('detailed')) return '15-20 min';
  return '5 min';
}

async function getActiveWorkflowTasks(): Promise<any[]> {
  // For now, return empty array - this would connect to workflow system
  return [];
}

function generateCoordinationSummary(agentReports: any[]): string {
  const active = agentReports.filter(a => a.isActive).length;
  const total = agentReports.length;
  
  if (active === 0) {
    return `All ${total} agents are idle and ready for tasks.`;
  } else if (active === 1) {
    return `1 agent is currently working, ${total - 1} are available.`;
  } else {
    return `${active} agents are actively working, ${total - active} are available for coordination.`;
  }
}

function generateElenaRecommendations(agentReports: any[]): string[] {
  const recommendations = [];
  const active = agentReports.filter(a => a.isActive).length;
  
  if (active === 0) {
    recommendations.push("All agents ready - consider assigning coordination tasks");
  }
  
  if (active > 5) {
    recommendations.push("High agent utilization - monitor for task conflicts");
  }
  
  const staleAgents = agentReports.filter(a => 
    a.lastActivity && 
    new Date().getTime() - new Date(a.lastActivity.timestamp || 0).getTime() > 30 * 60 * 1000
  );
  
  if (staleAgents.length > 0) {
    recommendations.push(`${staleAgents.length} agents have been idle for >30min`);
  }
  
  return recommendations;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}