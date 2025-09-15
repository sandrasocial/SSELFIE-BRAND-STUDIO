/**
 * AGENT HANDOFF API ROUTES - DIRECT AGENT-TO-AGENT COMMUNICATION
 * Revolutionary endpoints for autonomous agent operations
 * Enables full direct communication without human intervention
 */

import express from 'express';
import { agent_handoff, get_handoff_tasks } from '../tools/agent_handoff';
import { autonomous_workflow } from '../tools/autonomous_workflow';
import { coordinate_workflow } from '../tools/coordinate_workflow';
import { get_assigned_tasks } from '../tools/get_assigned_tasks';

const router = express.Router();

/**
 * MAIN AGENT HANDOFF ENDPOINT - Direct Agent Communication
 */
router.post('/handoff', async (req, res) => {
  try {
    console.log('🤝 AGENT HANDOFF REQUEST:', req.body);
    
    const result = await agent_handoff(req.body);
    
    res.json({
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AGENT HANDOFF ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown handoff error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET HANDOFF TASKS - Check pending task handoffs for agent
 */
router.get('/tasks/:agentName', async (req, res) => {
  try {
    console.log(`📋 HANDOFF TASKS REQUEST: ${req.params.agentName}`);
    
    const result = await get_handoff_tasks(req.params.agentName);
    
    res.json({
      success: true,
      result: result,
      agentName: req.params.agentName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GET HANDOFF TASKS ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * AUTONOMOUS WORKFLOW ENDPOINT - Self-Executing Workflows
 */
router.post('/autonomous', async (req, res) => {
  try {
    console.log('🤖 AUTONOMOUS WORKFLOW REQUEST:', req.body);
    
    const result = await autonomous_workflow(req.body);
    
    res.json({
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AUTONOMOUS WORKFLOW ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown autonomous workflow error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * COORDINATE WORKFLOW - Enhanced coordination with handoff capabilities
 */
router.post('/coordinate', async (req, res) => {
  try {
    console.log('🌉 COORDINATE WORKFLOW REQUEST:', req.body);
    
    const result = await coordinate_workflow(req.body);
    
    res.json({
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ COORDINATE WORKFLOW ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown coordination error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET ASSIGNED TASKS - Enhanced with handoff support
 */
router.get('/assigned/:agentName', async (req, res) => {
  try {
    console.log(`📋 ASSIGNED TASKS REQUEST: ${req.params.agentName}`);
    
    const result = await get_assigned_tasks({ agent_name: req.params.agentName });
    
    res.json({
      success: true,
      result: result,
      agentName: req.params.agentName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GET ASSIGNED TASKS ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * AGENT STATUS DASHBOARD - Monitor all agent activities
 */
router.get('/status', async (req, res) => {
  try {
    console.log('📊 AGENT STATUS DASHBOARD REQUEST');
    
    // Get status from all major agents
    const agents = ['elena', 'zara', 'aria', 'maya', 'quinn', 'rachel', 'victoria'];
    const agentStatuses = [];
    
    for (const agent of agents) {
      try {
        const assignedTasks = await get_assigned_tasks({ agent_name: agent });
        const handoffTasks = await get_handoff_tasks(agent);
        
        agentStatuses.push({
          agentName: agent,
          assignedTasks: assignedTasks.includes('ACTIVE TASKS') ? 'Active' : 'Available',
          handoffTasks: handoffTasks.includes('pending task') ? 'Has Handoffs' : 'No Handoffs',
          status: 'Operational',
          lastActivity: new Date().toISOString()
        });
      } catch (agentError) {
        agentStatuses.push({
          agentName: agent,
          assignedTasks: 'Unknown',
          handoffTasks: 'Unknown',
          status: 'Error',
          error: agentError instanceof Error ? agentError.message : 'Unknown error'
        });
      }
    }
    
    res.json({
      success: true,
      result: {
        totalAgents: agents.length,
        activeAgents: agentStatuses.filter(a => a.status === 'Operational').length,
        systemHealth: 'Operational',
        lastUpdate: new Date().toISOString(),
        agentStatuses
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AGENT STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown status error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;