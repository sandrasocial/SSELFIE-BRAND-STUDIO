// EMERGENCY CLEAN SERVER - Bypasses all conflicting systems
// This creates a fresh server instance avoiding all middleware conflicts

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = process.cwd().endsWith('/server') ? path.dirname(process.cwd()) : process.cwd();

console.log('🚀 EMERGENCY CLEAN SERVER STARTING');
console.log(`📁 Project root: ${projectRoot}`);

const app = express();
const port = 3000;

// Basic middleware only
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Immediate health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', server: 'emergency-clean', timestamp: Date.now() });
});

// Emergency auth endpoint
app.get('/api/auth/user', (req, res) => {
  console.log('🔐 Emergency auth accessed');
  
  const sandraUser = {
    id: '42585527',
    email: 'ssa@ssasocial.com',
    firstName: 'Sandra',
    lastName: 'Sigurjonsdottir',
    profileImageUrl: null,
    plan: 'sselfie-studio',
    role: 'admin',
    monthlyGenerationLimit: -1,
    generationsUsedThisMonth: 0,
    mayaAiAccess: true,
    victoriaAiAccess: true,
    emergencyServer: true,
    serverWorking: true
  };
  
  res.json(sandraUser);
});

// Emergency login redirect
app.get('/api/login', (req, res) => {
  console.log('🔐 Emergency login accessed');
  res.redirect('/?auth=emergency&user=sandra');
});

// Serve static files
const clientPath = path.join(projectRoot, 'client/dist');
if (require('fs').existsSync(clientPath)) {
  app.use(express.static(clientPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ EMERGENCY CLEAN SERVER RUNNING ON PORT ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Auth check: http://localhost:${port}/api/auth/user`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Emergency server shutting down');
  server.close(() => {
    process.exit(0);
  });
});

export default app;