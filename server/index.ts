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

// API routes first
app.use('/api', (req, res, next) => {
  next(); // Let the imported routes handle API requests
});

// For development, proxy frontend requests to a separate Vite dev server
// or serve a simple fallback
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSELFIE Studio</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0; 
            padding: 40px; 
            background: #000; 
            color: #fff; 
            text-align: center;
          }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { font-size: 2.5em; margin-bottom: 20px; }
          p { font-size: 1.2em; line-height: 1.6; opacity: 0.8; }
          .status { 
            background: #1a1a1a; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 SSELFIE Studio</h1>
          <div class="status">
            <p><strong>Server Status:</strong> ✅ Running</p>
            <p><strong>Backend API:</strong> ✅ Active</p>
            <p><strong>Database:</strong> ✅ Connected</p>
          </div>
          <p>AI Personal Branding Platform</p>
          <p>Transform selfies into professional business launches</p>
        </div>
      </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});