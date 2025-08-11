import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer } from 'vite';

const app = express();
const port = Number(process.env.PORT) || 5000;

async function startServer() {
  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.join(__dirname, '../client'),
  });

  // Use Vite's middleware for development
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  // API middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      server: 'SSELFIE Studio with Vite'
    });
  });

  app.use('/api/admin/consulting-agents/chat', (req, res) => {
    res.json({ 
      status: 'success', 
      message: 'Agent system operational',
      agent: req.body.agentId || 'unknown'
    });
  });

  app.use('/api/auth/user', (req, res) => {
    res.status(401).json({ error: 'Not authenticated' });
  });

  // Start server
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
    console.log(`🌐 Access your app: http://localhost:${port}`);
    console.log(`📦 Vite dev server integrated for hot reloading`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});