const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));
app.use('/src', express.static(path.join(__dirname, '../client/src')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const htmlPath = path.join(__dirname, '../client/index.html');
app.get('*', (req, res) => {
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('App not found at: ' + htmlPath);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio running on port ${port}`);
  console.log(`📱 Access your app: http://localhost:${port}`);
});