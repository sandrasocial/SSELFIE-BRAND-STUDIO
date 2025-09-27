import { app, setupApp } from './index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT) || Number(process.env.REPLIT_DEV_DOMAIN) || 5000;

async function startServer() {
  await setupApp();

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const possibleDistPaths = [
      path.join(__dirname, '../dist/public'),
      path.join(__dirname, '../client/dist'),
      path.join(__dirname, '../dist')
    ];
    for (const distPath of possibleDistPaths) {
      if (fs.existsSync(distPath)) {
        console.log(`📁 Serving static files from: ${distPath}`);
        app.use((await import('express')).default.static(distPath));
        app.use('/assets', (await import('express')).default.static(path.join(distPath, 'assets')));
        break;
      }
    }
    app.use('/attached_assets', (await import('express')).default.static(path.join(__dirname, '../attached_assets')));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path === '/health' || res.headersSent) {
        return;
      }
      const possibleIndexPaths = [
        path.join(__dirname, '../dist/public/index.html'),
        path.join(__dirname, '../client/dist/index.html'),
        path.join(__dirname, '../dist/index.html')
      ];
      for (const indexPath of possibleIndexPaths) {
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }
      res.status(404).send('Application not found - please run npm run build');
    });
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server accessible at: http://0.0.0.0:${port}`);
  });

  server.on('error', (err) => {
    console.error('❌ Server startup error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log(`📍 Port ${port} is already in use. Trying port ${port + 1}...`);
      return;
    }
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
