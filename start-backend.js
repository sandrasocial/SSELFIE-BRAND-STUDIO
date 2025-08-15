const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: port });
});

// Mock consulting agents endpoint for coordination
app.post('/api/consulting-agents/admin/consulting-chat', (req, res) => {
  console.log('🤖 ZARA COORDINATION RECEIVED:', req.body);
  
  if (req.body.agentId === 'zara') {
    console.log('⚡ ZARA: Executing production cleanup tasks...');
    // Simulate Zara's response
    res.json({
      success: true,
      agent: 'zara',
      message: 'Production cleanup initiated. Fixing TypeScript errors and route protection.',
      status: 'executing'
    });
  } else {
    res.json({
      success: true,
      agent: req.body.agentId,
      message: 'Coordination received',
      status: 'acknowledged'
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend coordination server running on port ${port}`);
});