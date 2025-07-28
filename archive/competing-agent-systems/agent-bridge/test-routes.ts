// SSELFIE Studio Agent Bridge - Test Routes
// Manual testing endpoints for agent bridge system

import express from 'express';
import { isAuthenticated } from '../../replitAuth.js';

const router = express.Router();

// Test endpoint to simulate an agent task submission
router.post('/test-task-submission', isAuthenticated, async (req, res) => {
  try {
    console.log('🧪 AGENT BRIDGE TEST: Simulating task submission');
    
    const testTask = {
      agentName: 'aria',
      instruction: 'Create a luxury component for the admin dashboard with Times New Roman typography and editorial styling',
      conversationContext: [
        'User requested a new admin component',
        'Component should follow SSELFIE luxury standards',
        'Use black and white color scheme'
      ],
      priority: 'high',
      completionCriteria: [
        'Component created with .tsx extension',
        'Uses Times New Roman for headlines',
        'Follows luxury design patterns',
        'Integrates with existing admin dashboard'
      ],
      qualityGates: [
        'typescript_compilation',
        'file_implementation',
        'luxury_standards',
        'security_validation'
      ],
      estimatedDuration: 15
    };

    // Call the actual submit-task endpoint
    const response = await fetch('http://localhost:5000/api/agent-bridge/submit-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || ''
      },
      body: JSON.stringify(testTask)
    });

    const result = await response.json();
    
    res.json({
      success: true,
      test: 'task-submission',
      result
    });

  } catch (error) {
    console.error('❌ AGENT BRIDGE TEST: Task submission test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    });
  }
});

// Test endpoint to check all agent bridge endpoints
router.get('/test-all-endpoints', isAuthenticated, async (req, res) => {
  try {
    console.log('🧪 AGENT BRIDGE TEST: Testing all endpoints');
    
    const results = {
      health: { status: 'pending' },
      activeTasks: { status: 'pending' }
    };

    // Test health endpoint
    try {
      const healthResponse = await fetch('http://localhost:5000/api/agent-bridge/health');
      results.health = await healthResponse.json();
    } catch (error) {
      results.health = { status: 'failed', error: error.message };
    }

    // Test active tasks endpoint
    try {
      const tasksResponse = await fetch('http://localhost:5000/api/agent-bridge/active-tasks', {
        headers: {
          'Cookie': req.headers.cookie || ''
        }
      });
      results.activeTasks = await tasksResponse.json();
    } catch (error) {
      results.activeTasks = { status: 'failed', error: error.message };
    }

    res.json({
      success: true,
      test: 'all-endpoints',
      results
    });

  } catch (error) {
    console.error('❌ AGENT BRIDGE TEST: Endpoint test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    });
  }
});

export default router;