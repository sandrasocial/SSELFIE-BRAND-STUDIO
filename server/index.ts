import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = Number(process.env.PORT) || 5000;

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'SSELFIE Studio (Fixed)'
  });
});

// Serve React app
const htmlPath = path.join(__dirname, '../client/index.html');
app.get('*', (req, res) => {
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('App not found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio fixed and running on port ${port}`);
  console.log(`🌐 Access: http://localhost:${port}`);
});