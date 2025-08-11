import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
// import { setupVite } from './vite';
import './routes'; // Import the main comprehensive routes file

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'development_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// The routes.ts file contains all the comprehensive routes and will be automatically loaded
// This includes all API endpoints, auth routes, file serving, etc.

// WebSocket handling
wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      // Handle different message types
      switch(data.type) {
        case 'AGENT_MESSAGE':
          // Handle agent messages
          break;
        case 'USER_MESSAGE':
          // Handle user messages
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  });
});

const port = process.env.PORT || 5000;

// Import and set up the working Vite development server
async function setupDevelopmentServer() {
  try {
    const { createServer } = await import('vite');
    
    // Create a minimal Vite config with proper host allowlist
    const vite = await createServer({
      root: path.resolve(process.cwd(), 'client'),
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        allowedHosts: 'all'
      },
      appType: 'custom'
    });
    
    app.use(vite.middlewares);
    
    // Catch-all handler for the frontend
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      try {
        const template = path.resolve(process.cwd(), 'client', 'index.html');
        let html = await import('fs').then(fs => fs.readFileSync(template, 'utf-8'));
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error('Vite SSR error:', e);
        next(e);
      }
    });
    
    console.log('✅ Vite development server initialized');
  } catch (error) {
    console.error('❌ Vite setup failed:', error);
    
    // Fallback: serve static files
    app.use('/assets', express.static(path.join(process.cwd(), 'attached_assets')));
    app.use(express.static(path.join(process.cwd(), 'client/public')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'client/index.html'));
    });
    
    console.log('⚠️ Using fallback static file serving');
  }
}

// Initialize development server and start listening only after setup completes
async function startServer() {
  await setupDevelopmentServer();
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 External access via port 80 (mapped from ${port})`);
    console.log(`🔗 Local access: http://localhost:${port}`);
  });
}

startServer().catch(console.error);