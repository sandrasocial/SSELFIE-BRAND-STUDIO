import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { db } from './db';
import { registerRoutes } from './routes';

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

// Register all the comprehensive routes from routes.ts and start server
console.log('🔧 Registering comprehensive routes...');
registerRoutes(app).then(() => {
  console.log('✅ All routes registered successfully');
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}).catch(err => {
  console.error('❌ Route registration failed:', err);
  // Start basic server even if routes fail
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port} (with route registration errors)`);
  });
});