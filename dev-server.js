// Simple development server to get Stack Auth working
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

// Enable CORS for all origins (for development)
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-stack-access-token']
}));

app.use(express.json());

// Try to proxy API requests to Vercel dev server first
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  secure: false,
  onError: (err, req, res) => {
    console.log('Proxy error, falling back to mock responses:', err.message);
    // Fallback: return mock responses
    if (req.path === '/api/health') {
      res.json({
        status: 'healthy',
        service: 'SSELFIE Studio Dev Server (Fallback)',
        timestamp: new Date().toISOString()
      });
    } else if (req.path === '/api/me') {
      res.json({
        user: null,
        authenticated: false
      });
    } else {
      res.status(404).json({ 
        error: 'API endpoint not available',
        path: req.path 
      });
    }
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`🔗 Frontend at http://localhost:5173`);
  console.log(`✅ CORS enabled for all origins`);
  console.log(`🔄 API requests proxied to Vercel dev server (port 3001)`);
});