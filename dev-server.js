// Simple development server to get Stack Auth working
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Essential endpoints for Stack Auth
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SSELFIE Studio Dev Server',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/me', (req, res) => {
  // Mock user endpoint for Stack Auth
  res.json({
    user: null, // No user initially
    authenticated: false
  });
});

// Stack Auth endpoints
app.all('/api/auth/*', (req, res) => {
  // Proxy to Stack Auth or return 404
  res.status(404).json({ error: 'Stack Auth endpoint not implemented' });
});

// Catch-all for other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not implemented in dev server',
    path: req.path 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`🔗 Frontend at http://localhost:5173`);
  console.log(`✅ CORS enabled for frontend`);
});