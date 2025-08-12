const express = require('express');
const { spawn } = require('child_process');

console.log('🔍 MINIMAL STABLE SERVER - Testing root cause of instability');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'minimal-stable', 
    message: 'Testing server stability without complex routes',
    timestamp: new Date().toISOString()
  });
});

// Agent endpoint for Zara to diagnose
app.post('/api/consulting-agents/admin/consulting-chat', (req, res) => {
  console.log(`🤖 AGENT CONNECTION: ${req.body?.agentId || 'unknown'}`);
  res.json({ 
    success: true,
    message: 'MINIMAL SERVER: Agent connection established. Ready for root cause analysis.',
    agent: req.body?.agentId || 'unknown',
    server_mode: 'diagnostic'
  });
});

// Keep server alive
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ MINIMAL SERVER LIVE on port ${port}`);
  console.log(`🔍 Testing if basic server stays alive without complex routes...`);
});

// Prevent exit
process.on('SIGTERM', () => console.log('Received SIGTERM, but staying alive for diagnosis'));
process.on('SIGINT', () => console.log('Received SIGINT, but staying alive for diagnosis'));

// Keep event loop active
setInterval(() => {
  console.log(`⏰ Server heartbeat: ${new Date().toISOString()}`);
}, 30000);

console.log('🔧 Minimal server should stay alive independently - testing...');