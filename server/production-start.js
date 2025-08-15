// PRODUCTION SERVER STARTER - Clean deployment script
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

console.log('🚀 PRODUCTION SERVER: Starting SSELFIE Studio');
console.log(`📁 Project root: ${projectRoot}`);

const app = express();
const port = process.env.PORT || 3000;

// Essential middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    server: 'production',
    timestamp: Date.now() 
  });
});

// Serve static files from client/dist (where vite actually builds)
const distPath = path.join(projectRoot, 'client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`✅ Serving static files from: ${distPath}`);
} else {
  console.warn(`⚠️  Dist folder not found at: ${distPath}`);
  // Try alternate path
  const altDistPath = path.join(projectRoot, 'dist');
  if (fs.existsSync(altDistPath)) {
    app.use(express.static(altDistPath));
    console.log(`✅ Serving static files from alternate: ${altDistPath}`);
  }
}

// SPA fallback
app.get('*', (req, res) => {
  const clientDistPath = path.join(projectRoot, 'client/dist');
  const indexPath = path.join(clientDistPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Try alternate dist location
    const altIndexPath = path.join(projectRoot, 'dist/index.html');
    if (fs.existsSync(altIndexPath)) {
      res.sendFile(altIndexPath);
    } else {
      res.status(200).json({
        message: 'SSELFIE Studio Production Server',
        status: 'Running',
        note: 'Frontend build required',
        buildCommand: 'npm run build'
      });
    }
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ PRODUCTION SERVER running on port ${port}`);
  console.log(`🌐 Access: http://localhost:${port}`);
});

export default app;