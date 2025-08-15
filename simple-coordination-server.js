const express = require('express');
const app = express();

app.use(express.json());

// Mock coordination responses for testing
const agentResponses = {
  elena: "✅ ELENA: Multi-agent coordination system operational. Ready to delegate tasks to Quinn (frontend) and Zara (build systems).",
  quinn: "🎯 QUINN: Frontend specialist ready. Can analyze React/TypeScript issues, fix component errors, and optimize build configurations.",
  zara: "🔧 ZARA: Build system expert standing by. Can handle package management, Vite configuration, deployment setup, and dependency resolution."
};

app.post('/api/consulting-agents/admin/consulting-chat', (req, res) => {
  const { agentId, message } = req.body;
  
  console.log(`🤖 Agent ${agentId.toUpperCase()}: ${message}`);
  
  const response = agentResponses[agentId] || `${agentId} received: ${message}`;
  
  res.json({
    success: true,
    agent: agentId,
    response: response,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    agents: Object.keys(agentResponses),
    coordination: 'active'
  });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Agent Coordination Server: http://localhost:${PORT}`);
  console.log('📡 Available agents:', Object.keys(agentResponses).join(', '));
});