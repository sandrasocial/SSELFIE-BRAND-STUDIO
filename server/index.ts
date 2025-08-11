import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { db } from '../lib/db';
import './routes'; // Import the main comprehensive routes file

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Session configuration with database storage
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool: db.pool,
  }),
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
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});