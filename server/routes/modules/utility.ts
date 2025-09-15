/**
 * Utility Routes Module
 * Low-risk routes for health checks and basic functionality
 */

import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// Health check endpoints
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SSELFIE Studio',
    timestamp: new Date().toISOString(),
  });
});

router.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.status(200).send('SSELFIE Studio API');
});

// Training zip download
router.get("/training-zip/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'training-zips', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  
  fileStream.on('error', (error) => {
    console.error('Error streaming file:', error);
    res.status(500).json({ error: 'Error streaming file' });
  });
});

export default router;
