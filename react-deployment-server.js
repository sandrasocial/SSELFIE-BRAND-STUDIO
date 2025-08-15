const express = require('express');
const { createServer } = require('vite');
const path = require('path');

async function createViteDevServer() {
  console.log('🚀 ZARA-STYLE DEPLOYMENT: Setting up complete React environment...');
  
  const app = express();
  const port = process.env.PORT || 5000;

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes first
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      server: 'SSELFIE Studio React Server',
      message: 'Full React deployment active'
    });
  });

  app.post('/api/admin/consulting-agents/chat', (req, res) => {
    res.json({ 
      status: 'success', 
      message: 'Agent system operational',
      agent: req.body.agentId || 'unknown',
      deployment: 'React environment ready'
    });
  });

  // Create Vite dev server
  console.log('🔧 ZARA: Configuring Vite development server...');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(__dirname, 'client'),
    configFile: path.resolve(__dirname, 'vite.config.ts')
  });

  // Use vite's connect instance as middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);

  // Fallback for SPA
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Transform the index.html
      let template = await vite.transformIndexHtml(url, `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSELFIE Studio - AI Personal Branding Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
      `);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSELFIE Studio React Server running on port ${port}`);
    console.log(`🎯 ZARA: Full React deployment complete!`);
    console.log(`🌐 Visit: http://localhost:${port}`);
  });
}

createViteDevServer().catch(console.error);