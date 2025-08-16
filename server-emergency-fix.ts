import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { setupVite } from './server/vite.js';

const app = express();
const server = createServer(app);

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple admin agent test endpoint
app.post('/api/consulting/:agentId', (req, res) => {
  const { agentId } = req.params;
  const { message } = req.body;
  
  console.log(`🤖 ${agentId.toUpperCase()} called with message:`, message);
  
  res.json({
    agent: agentId,
    response: `${agentId.toUpperCase()} received your message: "${message}". The server is now operational and agent infrastructure is ready for full Claude API integration.`,
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Setup Vite for frontend
await setupVite(app, server);

const port = 5000;
server.listen(port, () => {
  console.log(`🚀 Emergency server running on http://localhost:${port}`);
  console.log('📋 Admin agents Elena, Quinn, and Zara are ready for testing');
});