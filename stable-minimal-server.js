// AGENT COORDINATION: Minimal stable server for app deployment
import express from 'express';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static('dist'));

// Health check for deployment
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SSELFIE Studio stable' });
});

// Agent coordination for testing
app.post('/api/consulting-agents/admin/consulting-chat', (req, res) => {
  const { agentId, message } = req.body;
  console.log(`Agent ${agentId}:`, message);
  res.json({ success: true, agent: agentId, response: 'System stable' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('🚀 SSELFIE Studio ready for deployment on port 5000');
});