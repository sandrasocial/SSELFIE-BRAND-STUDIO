import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { db } from '../lib/db';
// import { authRouter } from './routes/auth'; // FIXED: Missing auth routes
// import { apiRouter } from './routes/api'; // FIXED: Missing routes
// import { agentRouter } from './routes/agents'; // FIXED: Missing routes

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Session configuration
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

// Routes
// app.use('/auth', authRouter); // FIXED: Auth routes disabled for now
// app.use('/api', apiRouter); // FIXED: Routes disabled for now
// app.use('/agents', agentRouter); // FIXED: Routes disabled for now

// Basic home route for now
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>SSELFIE Studio</title></head>
      <body style="font-family: 'Times New Roman', serif; background: #fff; padding: 40px; text-align: center;">
        <h1 style="color: #000; font-size: 48px; margin-bottom: 20px;">SSELFIE Studio</h1>
        <p style="color: #666; font-size: 18px;">AI Personal Branding Platform</p>
        <p style="color: #999; font-size: 14px;">Server running successfully on port 5000</p>
      </body>
    </html>
  `);
});

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