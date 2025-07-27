// SSELFIE STUDIO - INTELLIGENT AGENT ROUTING API ROUTES

import { Request, Response, Router } from 'express';
import { IntelligentAgentRouter } from '../intelligent-agent-router';
import { isAuthenticated } from '../replitAuth';

const router = Router();

/**
 * Route a request to the optimal agent
 */
router.post('/route-request', isAuthenticated, async (req: Request, res: Response) => {
  try {
    console.log('🧠 INTELLIGENT ROUTING: Processing route request...');
    
    const { requestType, description, filePath, urgency = 'MEDIUM', estimatedComplexity = 5 } = req.body;
    
    if (!requestType || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: requestType and description'
      });
    }
    
    const routingDecision = IntelligentAgentRouter.routeRequest({
      requestType,
      description,
      filePath,
      urgency,
      estimatedComplexity
    });
    
    res.json({
      success: true,
      routing: routingDecision,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ ROUTING ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to route request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get agent availability and status
 */
router.get('/agent-statuses', isAuthenticated, async (req: Request, res: Response) => {
  try {
    console.log('📊 AGENT STATUSES: Getting current agent availability...');
    
    const statuses = IntelligentAgentRouter.getAgentStatuses();
    const metrics = IntelligentAgentRouter.getRoutingMetrics();
    
    res.json({
      success: true,
      agents: statuses,
      metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AGENT STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent statuses'
    });
  }
});

/**
 * Update agent load (called when tasks are assigned/completed)
 */
router.post('/update-agent-load', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { agentId, newLoad } = req.body;
    
    if (!agentId || newLoad === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId and newLoad'
      });
    }
    
    IntelligentAgentRouter.updateAgentLoad(agentId, newLoad);
    
    console.log(`📊 LOAD UPDATE: Agent ${agentId} load updated to ${newLoad}`);
    
    res.json({
      success: true,
      message: `Agent ${agentId} load updated successfully`
    });
    
  } catch (error) {
    console.error('❌ LOAD UPDATE ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agent load'
    });
  }
});

/**
 * Update agent performance metrics (called when tasks complete)
 */
router.post('/update-agent-metrics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { agentId, completionTime, success } = req.body;
    
    if (!agentId || completionTime === undefined || success === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId, completionTime, and success'
      });
    }
    
    IntelligentAgentRouter.updateAgentMetrics(agentId, completionTime, success);
    
    console.log(`📈 METRICS UPDATE: Agent ${agentId} - ${completionTime}min, success: ${success}`);
    
    res.json({
      success: true,
      message: `Agent ${agentId} metrics updated successfully`
    });
    
  } catch (error) {
    console.error('❌ METRICS UPDATE ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agent metrics'
    });
  }
});

/**
 * Get routing optimization suggestions
 */
router.get('/optimization-suggestions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    console.log('🎯 OPTIMIZATION: Generating routing suggestions...');
    
    const statuses = IntelligentAgentRouter.getAgentStatuses();
    const metrics = IntelligentAgentRouter.getRoutingMetrics();
    
    // Generate optimization suggestions
    const suggestions = [];
    
    // Check for overloaded agents
    const overloadedAgents = statuses.filter(agent => 
      agent.currentLoad / agent.maxConcurrentTasks > 0.8
    );
    
    if (overloadedAgents.length > 0) {
      suggestions.push({
        type: 'LOAD_BALANCING',
        priority: 'HIGH',
        description: `${overloadedAgents.length} agents are near capacity`,
        action: 'Consider redistributing tasks or increasing agent capacity',
        affectedAgents: overloadedAgents.map(a => a.agentId)
      });
    }
    
    // Check for underutilized agents
    const underutilizedAgents = statuses.filter(agent => 
      agent.currentLoad === 0 && agent.successRate > 95
    );
    
    if (underutilizedAgents.length > 2) {
      suggestions.push({
        type: 'UTILIZATION',
        priority: 'MEDIUM',
        description: `${underutilizedAgents.length} high-performing agents are idle`,
        action: 'Consider routing more complex tasks to these agents',
        affectedAgents: underutilizedAgents.map(a => a.agentId)
      });
    }
    
    // Check for agents with declining performance
    const decliningAgents = statuses.filter(agent => agent.successRate < 90);
    
    if (decliningAgents.length > 0) {
      suggestions.push({
        type: 'PERFORMANCE',
        priority: 'HIGH',
        description: `${decliningAgents.length} agents showing performance issues`,
        action: 'Review task complexity and agent specialization alignment',
        affectedAgents: decliningAgents.map(a => a.agentId)
      });
    }
    
    res.json({
      success: true,
      suggestions,
      metrics,
      analysisTimestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ OPTIMIZATION ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate optimization suggestions'
    });
  }
});

/**
 * Test routing with sample requests
 */
router.post('/test-routing', isAuthenticated, async (req: Request, res: Response) => {
  try {
    console.log('🧪 ROUTING TEST: Running test scenarios...');
    
    const testScenarios = [
      {
        name: 'Design Task',
        request: {
          requestType: 'design',
          description: 'Create a luxury component for admin dashboard',
          filePath: 'client/src/components/admin/AdminCard.tsx',
          urgency: 'MEDIUM',
          estimatedComplexity: 6
        }
      },
      {
        name: 'Technical Task',
        request: {
          requestType: 'technical',
          description: 'Fix performance issue in database queries',
          urgency: 'HIGH',
          estimatedComplexity: 8
        }
      },
      {
        name: 'Content Task',
        request: {
          requestType: 'content',
          description: 'Update voice consistency across landing page',
          filePath: 'client/src/pages/landing.tsx',
          urgency: 'LOW',
          estimatedComplexity: 4
        }
      }
    ];
    
    const results = testScenarios.map(scenario => ({
      scenario: scenario.name,
      routing: IntelligentAgentRouter.routeRequest(scenario.request),
      request: scenario.request
    }));
    
    res.json({
      success: true,
      testResults: results,
      summary: {
        totalScenarios: testScenarios.length,
        routingEngine: 'Intelligent Agent Router v1.0',
        testTimestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ ROUTING TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run routing tests'
    });
  }
});

export default router;