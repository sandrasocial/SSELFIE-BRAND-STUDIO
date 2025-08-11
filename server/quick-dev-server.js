const express = require('express');
const { createServer } = require('vite');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 5000;

async function startDevServer() {
  console.log('🚀 Starting SSELFIE Studio with Vite dev server...');
  
  // Create Vite server in middleware mode with minimal config
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.join(__dirname, '../client'),
    plugins: [], // Skip problematic plugins
    define: {
      'process.env.NODE_ENV': '"development"'
    }
  });

  // Essential middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes first (before Vite middleware)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      server: 'SSELFIE Studio Dev'
    });
  });

  app.post('/api/admin/consulting-agents/chat', (req, res) => {
    res.json({ 
      status: 'success', 
      message: 'Agent system operational',
      agent: req.body.agentId || 'unknown'
    });
  });

  app.get('/api/auth/user', (req, res) => {
    res.status(401).json({ error: 'Not authenticated' });
  });

  // Use Vite's dev middleware to handle React/TypeScript compilation
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  // Start server
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSELFIE Studio DEV SERVER on port ${port}`);
    console.log(`🌐 Access your app: http://localhost:${port}`);
    console.log(`⚡ Vite will compile your React/TypeScript files on-demand`);
  });
}

startDevServer().catch(err => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});