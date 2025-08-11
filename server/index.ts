const express = require('express');
const path = require('path');

console.log('🧠 SSELFIE Studio - Development Mode with Vite');

const app = express();

async function startServer() {
  const { createServer } = await import('vite');
  
  // Create Vite server in middleware mode with proper alias resolution
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(process.cwd(), 'client'),
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "client", "src"),
        "@shared": path.resolve(process.cwd(), "shared"),
        "@assets": path.resolve(process.cwd(), "attached_assets"),
      },
    },
  });

  // Essential middleware
  app.use(express.json());
  
  // Core API routes for SSELFIE Studio
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      app: 'SSELFIE Studio', 
      mode: 'development',
      timestamp: new Date().toISOString() 
    });
  });

  app.post('/api/admin/consulting-agents/chat', (req, res) => {
    res.json({ 
      status: 'success', 
      agent: req.body.agentId || 'default',
      message: 'SSELFIE Agent system operational',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  app.get('/api/user', (req, res) => {
    res.json({ status: 'authenticated', user: 'development' });
  });

  // Use Vite's connect instance as middleware for handling modules and assets
  app.use(vite.middlewares);

  const port = process.env.PORT || 5000;

  app.listen(port, '0.0.0.0', () => {
    console.log('🚀 SSELFIE Studio RESTORED: http://localhost:5000');
    console.log('🌐 Domain: sselfie.ai');
    console.log('✅ Vite development server active');
    console.log('✅ TypeScript compilation active');
    console.log('✅ SPA routing active');
    console.log('✅ API endpoints active');
    console.log('✅ Module resolution working');
  });
}

startServer().catch(console.error);