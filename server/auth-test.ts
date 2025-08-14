#!/usr/bin/env ts-node

// CRITICAL: Standalone authentication test server
// Purpose: Verify authentication system works independently of main server issues

import express from 'express';
import cors from 'cors';
import { storage } from './storage';

const app = express();
const port = 3001; // Use different port to avoid conflicts

// Basic middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'AUTH_TEST_OK', port });
});

// Critical auth user endpoint - standalone test
app.get('/api/auth/user', async (req: any, res) => {
  try {
    console.log('🔍 STANDALONE AUTH TEST - /api/auth/user called');
    console.log('🔍 Query parameters:', req.query);

    // PRIORITY: Development auth bypass for testing
    const bypass = req.query.dev_auth;
    if (bypass === 'sandra') {
      console.log('🛠️ Development auth bypass activated');
      
      let user = await storage.getUser('42585527'); // Sandra's ID from database
      if (!user) {
        console.log('🆕 Creating Sandra user record for development...');
        user = await storage.upsertUser({
          id: '42585527',
          email: 'ssa@ssasocial.com',
          firstName: 'Sandra',
          lastName: 'Sigurjonsdottir'
        });
      }
      
      console.log('✅ Development auth bypass successful:', user.email);
      return res.json({
        ...user,
        testMode: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('❌ User not authenticated');
    return res.status(401).json({ 
      error: "Not authenticated",
      testEndpoint: "/api/auth/user?dev_auth=sandra",
      service: "standalone-auth-test"
    });
  } catch (error) {
    console.error("Standalone auth test error:", error);
    res.status(500).json({ 
      error: "Failed to fetch user",
      details: error instanceof Error ? error.message : 'Unknown error',
      service: "standalone-auth-test"
    });
  }
});

// Start standalone authentication test server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🔒 STANDALONE AUTH TEST SERVER running on port ${port}`);
  console.log(`🔧 Test authentication: curl "http://localhost:${port}/api/auth/user?dev_auth=sandra"`);
});

// Keep alive
server.keepAliveTimeout = 60000;
server.headersTimeout = 60000;

console.log('🚀 Authentication test server initialized');