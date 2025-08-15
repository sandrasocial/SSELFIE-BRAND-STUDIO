const session = require('express-session');

// Simple authentication bridge for SSELFIE Studio
function setupSimpleAuth(app) {
  console.log('🔐 Setting up simplified authentication...');
  
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'sselfie-studio-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  }));

  // Mock authentication routes for development
  app.get('/api/auth/replit', (req, res) => {
    // Simulate successful auth
    req.session.user = {
      id: 'dev-user-123',
      username: 'developer',
      name: 'Development User',
      email: 'dev@sselfie.ai',
      role: 'admin'
    };
    res.redirect('/dashboard');
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.session && req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Could not log out' });
      } else {
        res.json({ message: 'Logged out successfully' });
      }
    });
  });

  app.get('/api/login', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>SSELFIE Studio - Login</title>
          <style>
            body { font-family: 'Times New Roman', serif; text-align: center; padding: 50px; background: #f8f8f8; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #1a1a1a; margin-bottom: 20px; }
            .btn { background: #1a1a1a; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; }
            .btn:hover { background: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>SSELFIE Studio</h1>
            <p>Connect with Replit to access your personal branding platform</p>
            <a href="/api/auth/replit" class="btn">Login with Replit</a>
          </div>
        </body>
      </html>
    `);
  });

  console.log('✅ Simple authentication system ready');
}

module.exports = { setupSimpleAuth };