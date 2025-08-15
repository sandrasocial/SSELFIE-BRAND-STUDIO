const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy all requests to Vite dev server
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // Enable websocket proxy for HMR
}));

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy server running on port ${PORT}, forwarding to Vite on 5173`);
});