import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = Number(process.env.PORT) || 5000;

async function setupServer() {
  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Try to use Vite dev server if available, fall back to static serving
  let viteDevMode = false;
  try {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.join(__dirname, '../client')
      });
      app.use(vite.ssrFixStacktrace);
      app.use(vite.middlewares);
      viteDevMode = true;
      console.log('🔥 Vite dev server enabled');
    }
  } catch (error) {
    console.log('📁 Using static file serving (Vite unavailable)');
    
    // Serve static files with correct MIME types
    app.use('/src', express.static(path.join(__dirname, '../client/src'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
      }
    }));
    
    // Serve client public assets
    app.use('/assets', express.static(path.join(__dirname, '../client/public')));
    app.use(express.static(path.join(__dirname, '../client/public')));
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      server: `SSELFIE Studio (${viteDevMode ? 'Vite' : 'Static'})`
    });
  });

  // Only serve HTML fallback if not using Vite
  if (!viteDevMode) {
    const htmlPath = path.join(__dirname, '../client/index.html');
    app.get('*', (req, res) => {
      if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
      } else {
        res.status(404).send('App not found');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSELFIE Studio running on port ${port}`);
    console.log(`🌐 Access: http://localhost:${port}`);
  });
}

setupServer().catch(console.error);