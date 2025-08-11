import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { db } from './db';
import { registerRoutes } from './routes';
import { setupVite } from './vite';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Session configuration - using memory store for now to avoid db.pool issue
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

// Initialize server with async setup
async function startServer() {
  try {
    // Setup Vite development server for frontend transpilation
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Setting up Vite development server...');
      await setupVite(app, server);
      console.log('✅ Vite development server ready');
    }

    // Register all the comprehensive routes
    console.log('🔧 Registering comprehensive routes...');
    await registerRoutes(app);
    console.log('✅ All routes registered successfully');
    
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Server initialization failed:', err);
    // Start basic server even if setup fails
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port} (with initialization errors)`);
    });
  }
}

startServer();