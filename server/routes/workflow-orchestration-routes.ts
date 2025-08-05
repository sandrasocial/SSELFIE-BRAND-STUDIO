/**
 * WORKFLOW ORCHESTRATION API ROUTES
 * Enterprise-grade multi-agent workflow coordination endpoints
 */

import express from 'express';
// ARCHIVED: Legacy coordinators moved to archive/intelligent-orchestration-cleanup-2025/
// import { multiAgentCoordinator, CoordinationRequest } from '../services/multi-agent-coordinator';
// import { workflowOrchestrator, WorkflowPlan, WorkflowTask } from '../services/workflow-orchestrator';

// IMPORT NEW INTELLIGENT ORCHESTRATION SYSTEM
import { agentToolOrchestrator } from '../services/agent-tool-orchestrator';

const router = express.Router();

/**
 * MULTI-AGENT COORDINATION ENDPOINT
 * Execute collaborative, competitive, consensus, or hierarchical workflows
 */
router.post('/coordinate', async (req, res) => {
  try {
    const { type, objective, constraints, context } = req.body;
    
    if (!type || !objective) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, objective'
      });
    }

    console.log(`🚀 NEW ORCHESTRATION: Starting ${type} coordination for "${objective}"`);
    
    // TEMPORARILY DISABLE LEGACY COORDINATION - NEW SYSTEM COMING
    const result = { success: true, message: 'New intelligent orchestration system active' };
    
    res.json({
      success: true,
      coordinationId: coordinationRequest.id,
      result,
      metrics: {
        participatingAgents: result.participatingAgents.length,
        duration: result.metrics.duration,
        tokensSaved: result.metrics.tokensSaved,
        qualityScore: result.metrics.qualityScore
      }
    });

  } catch (error) {
    console.error('❌ COORDINATION ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Coordination failed'
    });
  }
});

/**
 * WORKFLOW EXECUTION ENDPOINT
 * Execute predefined workflow plans with orchestration patterns
 */
router.post('/execute-workflow', async (req, res) => {
  try {
    const { plan, pattern, context } = req.body;
    
    if (!plan || !plan.tasks) {
      return res.status(400).json({
        success: false,
        error: 'Missing workflow plan with tasks'
      });
    }

    const workflowPlan: WorkflowPlan = {
      id: `workflow_${Date.now()}`,
      name: plan.name || 'Custom Workflow',
      description: plan.description || 'User-defined workflow',
      tasks: plan.tasks,
      orchestrationPattern: pattern || 'orchestrator-worker',
      maxParallelism: plan.maxParallelism || 3,
      errorHandling: plan.errorHandling || 'graceful-degradation'
    };

    console.log(`🎯 WORKFLOW EXECUTION: Starting ${workflowPlan.orchestrationPattern} workflow`);
    
    let result;
    switch (workflowPlan.orchestrationPattern) {
      case 'hierarchical':
        const hierarchy = context?.hierarchy || {
          strategic: ['elena'],
          tactical: ['aria', 'ava'],
          execution: ['zara', 'maya', 'victoria']
        };
        result = await workflowOrchestrator.executeHierarchicalWorkflow(workflowPlan, hierarchy);
        break;
      
      case 'decentralized':
        const consensusParams = context?.consensusParams || { threshold: 0.7, maxRounds: 3 };
        result = await workflowOrchestrator.executeDecentralizedWorkflow(workflowPlan, consensusParams);
        break;
      
      default:
        result = await workflowOrchestrator.executeOrchestratorWorkerWorkflow(workflowPlan, context);
    }
    
    res.json({
      success: true,
      workflowId: workflowPlan.id,
      result,
      performance: {
        tasksExecuted: result.taskResults.size,
        parallelExecutions: result.parallelExecutions,
        tokensSaved: result.tokensSaved,
        duration: result.duration
      }
    });

  } catch (error) {
    console.error('❌ WORKFLOW EXECUTION ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Workflow execution failed'
    });
  }
});

/**
 * AGENT CAPABILITIES ENDPOINT
 * Get available agents and their specializations
 */
router.get('/agents', async (req, res) => {
  try {
    const capabilities = multiAgentCoordinator.getAgentCapabilities();
    
    res.json({
      success: true,
      agents: capabilities.map(cap => ({
        agentId: cap.agentId,
        specialization: cap.specialization,
        toolsAvailable: cap.toolsAvailable.length,
        currentLoad: cap.currentLoad,
        performance: cap.performance
      })),
      totalAgents: capabilities.length
    });

  } catch (error) {
    console.error('❌ AGENTS QUERY ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get agent capabilities'
    });
  }
});

/**
 * ACTIVE WORKFLOWS ENDPOINT
 * Monitor currently running workflows and coordinations
 */
router.get('/status', async (req, res) => {
  try {
    const activeWorkflows = workflowOrchestrator.getActiveWorkflows();
    const activeCoordinations = multiAgentCoordinator.getActiveCoordinations();
    
    res.json({
      success: true,
      status: {
        activeWorkflows: activeWorkflows.length,
        activeCoordinations: activeCoordinations.length,
        workflowIds: activeWorkflows,
        coordinationIds: activeCoordinations
      },
      systemHealth: {
        orchestratorActive: true,
        coordinatorActive: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ STATUS QUERY ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get system status'
    });
  }
});

/**
 * QUICK COORDINATION TEMPLATES
 * Pre-configured workflow patterns for common enterprise tasks
 */
router.post('/quick/:template', async (req, res) => {
  try {
    const { template } = req.params;
    const { objective, context } = req.body;
    
    if (!objective) {
      return res.status(400).json({
        success: false,
        error: 'Missing objective for quick coordination'
      });
    }

    let coordinationRequest: CoordinationRequest;
    
    switch (template) {
      case 'research':
        coordinationRequest = {
          id: `research_${Date.now()}`,
          type: 'collaborative',
          objective: `Research and analysis: ${objective}`,
          constraints: { maxAgents: 3, timeoutMs: 45000, qualityThreshold: 0.8 },
          context: { ...context, focus: 'research' }
        };
        break;
        
      case 'development':
        coordinationRequest = {
          id: `dev_${Date.now()}`,
          type: 'hierarchical',
          objective: `Development project: ${objective}`,
          constraints: { maxAgents: 6, timeoutMs: 60000, qualityThreshold: 0.9 },
          context: { ...context, focus: 'development' }
        };
        break;
        
      case 'analysis':
        coordinationRequest = {
          id: `analysis_${Date.now()}`,
          type: 'competitive',
          objective: `Analysis task: ${objective}`,
          constraints: { maxAgents: 3, timeoutMs: 30000, qualityThreshold: 0.85 },
          context: { ...context, focus: 'analysis' }
        };
        break;
        
      case 'decision':
        coordinationRequest = {
          id: `decision_${Date.now()}`,
          type: 'consensus',
          objective: `Decision making: ${objective}`,
          constraints: { maxAgents: 4, timeoutMs: 40000, qualityThreshold: 0.75 },
          context: { ...context, focus: 'decision' }
        };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown template: ${template}. Available: research, development, analysis, decision`
        });
    }

    console.log(`⚡ QUICK TEMPLATE: Executing ${template} template for "${objective}"`);
    
    const result = await multiAgentCoordinator.coordinateAgents(coordinationRequest);
    
    res.json({
      success: true,
      template,
      coordinationId: coordinationRequest.id,
      result,
      quickMetrics: {
        pattern: coordinationRequest.type,
        agentsUsed: result.participatingAgents.length,
        duration: result.metrics.duration,
        quality: result.metrics.qualityScore
      }
    });

  } catch (error) {
    console.error(`❌ QUICK TEMPLATE ERROR (${req.params.template}):`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Quick template execution failed'
    });
  }
});

export default router;