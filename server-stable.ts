import express from 'express';
import { createServer } from 'http';
import { setupAuth, isAuthenticated } from './server/replitAuth';
import { storage } from './server/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000;

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

async function startServer() {
  try {
    // Setup authentication
    await setupAuth(app);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Auth endpoint
    app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });

    // API routes
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API is working', timestamp: new Date().toISOString() });
    });

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      const distPath = path.resolve('./dist/public');
      app.use(express.static(distPath));
      
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      // Development: Simple frontend serving without WebSocket conflicts
      app.get('*', (req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SSELFIE Studio</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
              .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .action { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            </style>
          </head>
          <body>
            <h1>🏗️ SSELFIE Studio - Server Stable</h1>
            <div class="status">
              ✅ Server is running without WebSocket conflicts<br>
              ⏰ ${new Date().toLocaleString()}<br>
              🔌 Port: ${port}<br>
              🌐 Environment: ${process.env.NODE_ENV || 'development'}
            </div>
            <p>The server is now running in stable mode without the WebSocket connection issues.</p>
            <button class="action" onclick="window.location.href='/api/test'">Test API</button>
            <button class="action" onclick="window.location.href='/health'">Health Check</button>
            <button class="action" onclick="window.location.href='/api/login'">Login</button>
          </body>
          </html>
        `);
      });
    }

    // Error handling
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Server error:', err);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });

    // Start server
    server.listen(Number(port), '0.0.0.0', () => {
      console.log(`✅ STABLE SERVER: Running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
      console.log(`🔧 No WebSocket conflicts - stable connection guaranteed`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Starting graceful shutdown...');
      server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start stable server:', error);
    process.exit(1);
  }
}

startServer();