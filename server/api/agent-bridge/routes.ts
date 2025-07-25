// SSELFIE Studio Agent Bridge - Express Routes
// Luxury agent-to-agent communication API endpoints

import express from 'express';
import { AgentTask, TaskSubmissionRequest, TaskStatusResponse, ValidationResult } from './types.js';
import { storeTask, getTaskExecution, getActiveTasks } from './database.js';
import { ExecutionEngine } from './execution-engine.js';
import { TaskCompletionValidator } from './completion-validator.js';
import { isAuthenticated } from '../../replitAuth.js';

const router = express.Router();
const executionEngine = new ExecutionEngine();
const taskValidator = new TaskCompletionValidator();

// Health check endpoint (no auth required for monitoring)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'SSELFIE Agent Bridge',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Middleware: Require authentication for all other agent bridge endpoints  
router.use('*', (req, res, next) => {
  // Skip auth for health check
  if (req.originalUrl.endsWith('/health')) {
    return next();
  }
  return isAuthenticated(req, res, next);
});

// Submit new task from admin agent
router.post('/submit-task', async (req, res) => {
  try {
    console.log('🎯 AGENT BRIDGE: Received task submission:', req.body.agentName);
    
    const taskData: TaskSubmissionRequest = req.body;
    
    // Validate required fields
    if (!taskData.agentName || !taskData.instruction || !taskData.completionCriteria) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentName, instruction, completionCriteria'
      });
    }

    // Create agent task
    const task: AgentTask = {
      taskId: globalThis.crypto.randomUUID(),
      agentName: taskData.agentName,
      instruction: taskData.instruction,
      conversationContext: taskData.conversationContext || [],
      priority: taskData.priority || 'medium',
      completionCriteria: taskData.completionCriteria,
      qualityGates: taskData.qualityGates || [
        'typescript_compilation',
        'file_implementation',
        'security_validation',
        'luxury_standards'
      ],
      estimatedDuration: taskData.estimatedDuration,
      createdAt: new Date()
    };
    
    // Store in database
    await storeTask(task);
    
    // Begin execution pipeline
    const execution = await executionEngine.initiateExecution(task);
    
    const response: TaskStatusResponse = {
      success: true,
      taskId: task.taskId,
      status: execution.status,
      progress: execution.progress,
      estimatedCompletion: new Date(Date.now() + task.estimatedDuration * 60000)
    };

    console.log('✅ AGENT BRIDGE: Task submitted successfully:', task.taskId);
    res.json(response);
    
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Task submission failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Task submission failed'
    });
  }
});

// Get task status for Elena monitoring
router.get('/task-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log('📊 AGENT BRIDGE: Status requested for task:', taskId);
    
    const execution = await getTaskExecution(taskId);
    
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const response: TaskStatusResponse = {
      success: true,
      taskId: execution.taskId,
      status: execution.status,
      progress: execution.progress,
      estimatedCompletion: new Date(Date.now() + (execution.context.estimatedDuration * 60000)),
      validationResults: execution.validationResults
    };

    res.json(response);
    
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Status check failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Status check failed'
    });
  }
});

// Get all active tasks for Elena dashboard
router.get('/active-tasks', async (req, res) => {
  try {
    console.log('📋 AGENT BRIDGE: Active tasks requested');
    
    const activeTasks = await getActiveTasks();
    
    res.json({
      success: true,
      tasks: activeTasks,
      count: activeTasks.length
    });
    
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Active tasks retrieval failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve active tasks'
    });
  }
});

// Validate task completion manually
router.post('/validate-task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log('🔍 AGENT BRIDGE: Manual validation requested for task:', taskId);
    
    const validationResults = await taskValidator.validateTask(taskId);
    
    res.json({
      success: true,
      taskId,
      validationResults,
      allPassed: validationResults.every(result => result.passed)
    });
    
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Task validation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Task validation failed'
    });
  }
});

// Get task execution details (for debugging)
router.get('/task-details/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log('🔍 AGENT BRIDGE: Task details requested:', taskId);
    
    const execution = await getTaskExecution(taskId);
    
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      execution
    });
    
  } catch (error) {
    console.error('❌ AGENT BRIDGE: Task details retrieval failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve task details'
    });
  }
});

// Health check endpoint already defined above

export default router;