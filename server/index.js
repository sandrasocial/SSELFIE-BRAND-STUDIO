const express = require('express');

// Simple error handler for deployment
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Simple logging
const logger = {
  info: (data) => console.log('INFO:', data),
  error: (data) => console.error('ERROR:', data)
};

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    agents: 'autonomous_mode_enabled',
    deployment: 'stabilized'
  });
});

// Admin consulting agents route
app.get('/admin/consulting-agents', (req, res) => {
  res.json({
    agents: [
      {
        name: 'ELENA',
        role: 'Strategic Execution Leader',
        specialty: 'Workflow coordination, multi-agent task management, strategic decision making',
        status: 'autonomous'
      },
      {
        name: 'ZARA', 
        role: 'Backend Systems Architect',
        specialty: 'Complete backend system creation, full-stack development, performance optimization',
        status: 'autonomous'
      },
      {
        name: 'OLGA',
        role: 'Organization & Infrastructure',
        specialty: 'File management, infrastructure cleanup, system maintenance, documentation',
        status: 'autonomous'
      },
      {
        name: 'MAYA',
        role: 'Celebrity Stylist & Creative Director',
        specialty: 'Fashion trends expertise, editorial styling, creative direction',
        status: 'autonomous'
      },
      {
        name: 'VICTORIA',
        role: 'UX Strategist & Business Consultant',
        specialty: 'User experience design, business strategy, product roadmapping',
        status: 'autonomous'
      }
    ],
    coordination_status: 'active',
    specialties_updated: true,
    autonomous_mode: 'enabled',
    deployment_status: 'stabilized',
    last_update: new Date().toISOString()
  });
});

// Admin coordination endpoint
app.post('/admin/coordinate-agent', (req, res) => {
  const { target_agent, task_description, priority } = req.body;
  
  res.json({
    status: 'coordination_initiated',
    target_agent: target_agent?.toUpperCase(),
    task: task_description,
    priority: priority || 'medium',
    autonomous_execution: true,
    timestamp: new Date().toISOString()
  });
});

// Agent status dashboard
app.get('/admin/dashboard', (req, res) => {
  res.json({
    system_status: 'operational',
    server_running: true,
    port: 5000,
    agents_autonomous: true,
    specialties_corrected: true,
    deployment_ready: true,
    last_stabilization: '2025-08-11T12:00:00Z'
  });
});

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 SSELFIE Studio Server running on port ${port}`);
  logger.info('🤖 Autonomous agents ready for deployment');
});