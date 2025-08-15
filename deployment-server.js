const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve static files from Vite dev server
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // WebSocket support for HMR
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio Deployment Server: http://localhost:${PORT}`);
  console.log(`📡 Proxying to Vite dev server on port 5173`);
  console.log(`✅ Ready for deployment testing`);
});

module.exports = app;