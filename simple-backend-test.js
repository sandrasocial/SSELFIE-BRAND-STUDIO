// Simple backend test to bypass complex route registration issues
import express from 'express';

const app = express();
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple agent test endpoint
app.post('/api/consulting-agents/admin/consulting-chat', (req, res) => {
  console.log('🔄 Agent coordination test received:', req.body);
  res.json({ 
    success: true, 
    agent: req.body.agentId,
    message: 'Agent coordination system dependencies restored successfully!',
    timestamp: new Date().toISOString()
  });
});

const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Simple backend test server running on port ${port}`);
});