const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

console.log('🚀 EMERGENCY SERVER: Starting SSELFIE Studio...');

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', server: 'SSELFIE Emergency Server' });
});

// Serve the working HTML for everything
app.get('*', (req, res) => {
  const workingHtml = path.join(__dirname, 'client/index-working.html');
  if (fs.existsSync(workingHtml)) {
    res.sendFile(workingHtml);
  } else {
    res.send('<h1>SSELFIE Studio</h1><p>Emergency server active</p>');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio Emergency Server running on port ${port}`);
  console.log(`🌐 Visit: http://localhost:${port}`);
});