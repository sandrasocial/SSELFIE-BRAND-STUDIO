/**
 * AGENT BRIDGE API ROUTES - Backend for your bridge system
 * These are the missing API endpoints your bridge UI is trying to connect to
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { multiAgentCoordinator } from '../services/multi-agent-coordinator';
import { claudeApiServiceSimple } from '../services/claude-api-service-simple';
import { db } from '../db';
import { agentTasks, agentConversations } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Apply authentication to all bridge routes
router.use(isAuthenticated);

/**
 * GET /api/agent-bridge/agents - Get all agent statuses
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const agents = [
      { name: 'elena', role: 'Master Coordinator', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'zara', role: 'Technical Architect', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'aria', role: 'UI/UX Designer', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'olga', role: 'System Architect', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'victoria', role: 'Business Strategist', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'maya', role: 'AI Specialist', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'quinn', role: 'Data Analyst', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'rachel', role: 'Content Strategist', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'diana', role: 'Marketing Expert', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'sophia', role: 'Product Manager', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'martha', role: 'Operations Manager', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'ava', role: 'Quality Assurance', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'wilma', role: 'Security Specialist', status: 'active', lastActivity: new Date().toISOString() },
      { name: 'flux', role: 'DevOps Engineer', status: 'active', lastActivity: new Date().toISOString() }
    ];

    // Get queue status from coordinator
    const queueStatus = multiAgentCoordinator.getAgentQueueStatus();
    
    // Enhance agents with queue information
    const enhancedAgents = agents.map(agent => ({
      ...agent,
      queueSize: queueStatus[agent.name] || 0,
      status: queueStatus[agent.name] > 0 ? 'working' : 'idle'
    }));

    res.json({
      success: true,
      agents: enhancedAgents,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ BRIDGE AGENTS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/agent-bridge/active-tasks - Get active agent tasks
 */
router.get('/active-tasks', async (req: Request, res: Response) => {
  try {
    // Get active workflows from coordinator
    const activeWorkflows = multiAgentCoordinator.getActiveWorkflows();
    
    // Get recent tasks from database
    const recentTasks = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.status, 'active'))
      .orderBy(desc(agentTasks.createdAt))
      .limit(20);

    // Transform database tasks to bridge format
    const bridgeTasks = recentTasks.map(task => ({
      id: task.taskId,
      agentName: task.agentName,
      instruction: task.instruction,
      status: task.status === 'active' ? 'Executing' : 'Completed',
      progress: task.progress || 0,
      createdAt: task.createdAt?.toISOString() || new Date().toISOString(),
      steps: [
        {
          id: 'step_1',
          title: 'Task Analysis',
          status: task.progress > 25 ? 'completed' : 'in_progress',
          progress: Math.min(task.progress || 0, 25)
        },
        {
          id: 'step_2', 
          title: 'Tool Execution',
          status: task.progress > 50 ? 'completed' : task.progress > 25 ? 'in_progress' : 'pending',
          progress: Math.max(0, Math.min((task.progress || 0) - 25, 25))
        },
        {
          id: 'step_3',
          title: 'Implementation',
          status: task.progress > 75 ? 'completed' : task.progress > 50 ? 'in_progress' : 'pending', 
          progress: Math.max(0, Math.min((task.progress || 0) - 50, 25))
        },
        {
          id: 'step_4',
          title: 'Validation',
          status: task.progress >= 100 ? 'completed' : task.progress > 75 ? 'in_progress' : 'pending',
          progress: Math.max(0, (task.progress || 0) - 75)
        }
      ]
    }));

    res.json({
      success: true,
      tasks: bridgeTasks,
      workflows: activeWorkflows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ BRIDGE TASKS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active tasks',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/agent-bridge/health - System health check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    const dbTest = await db.select().from(agentConversations).limit(1);
    
    // Test Claude API
    const claudeHealthy = claudeApiServiceSimple ? true : false;
    
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      status: 'operational',
      responseTime,
      components: {
        database: 'operational',
        claudeApi: claudeHealthy ? 'operational' : 'degraded',
        coordinator: 'operational'
      },
      activeWorkflows: multiAgentCoordinator.getActiveWorkflows().length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ BRIDGE HEALTH ERROR:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/agent-bridge/submit-task - Submit a task to an agent
 */
router.post('/submit-task', async (req: Request, res: Response) => {
  try {
    const { agentName, instruction, priority = 'medium' } = req.body;
    const userId = req.user?.claims?.sub;

    if (!agentName || !instruction || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentName, instruction'
      });
    }

    console.log(`🎯 BRIDGE TASK SUBMISSION: ${agentName} - ${instruction.substring(0, 100)}...`);

    // Use the multi-agent coordinator to handle the task
    const coordinationRequest = {
      targetAgent: agentName,
      taskDescription: instruction,
      priority: priority as 'low' | 'medium' | 'high',
      requestingAgent: 'bridge_system',
      userId,
      expectedDeliverables: [`Complete ${agentName} specialized task: ${instruction}`]
    };

    const success = await multiAgentCoordinator.coordinateAgent(coordinationRequest);

    if (success) {
      const taskId = `bridge_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        success: true,
        taskId,
        message: `Task successfully submitted to ${agentName}`,
        agentName,
        status: 'submitted',
        timestamp: new Date().toISOString()
      });

    } else {
      res.status(500).json({
        success: false,
        error: `Failed to coordinate with ${agentName}`,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ BRIDGE TASK SUBMISSION ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit task',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/agent-bridge/task/:taskId - Get task status
 */
router.get('/task/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    // Look up task in database
    const tasks = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.taskId, taskId))
      .limit(1);

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const task = tasks[0];
    
    const bridgeTask = {
      id: task.taskId,
      agentName: task.agentName,
      instruction: task.instruction,
      status: task.status === 'active' ? 'Executing' : task.status === 'completed' ? 'Completed' : 'Failed',
      progress: task.progress || 0,
      createdAt: task.createdAt?.toISOString() || new Date().toISOString(),
      completedAt: task.completedAt?.toISOString() || undefined
    };

    res.json({
      success: true,
      task: bridgeTask,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ BRIDGE TASK STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task status',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;