import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupRollbackRoutes } from './routes/rollback.js';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// UNIFIED AGENT SYSTEM IMPORT (Single source of truth)
import { unifiedAgentSystem } from './unified-agent-system';

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('🚀 Starting route registration...');
  
  // Basic middleware and authentication setup
  const server = createServer(app);
  
  // Setup authentication
  await setupAuth(app);
  
  // Setup rollback routes
  setupRollbackRoutes(app);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // UNIFIED AGENT SYSTEM - Single integration layer
  console.log('🎯 UNIFIED AGENT SYSTEM: Initializing single integration layer...');
  await unifiedAgentSystem.initialize(app, server);
  console.log('✅ UNIFIED AGENT SYSTEM: Single integration layer operational');
  
  // Add essential API routes
  const { claudeApiService } = await import('./services/claude-api-service');
  
  // Claude API route for frontend compatibility (bypass auth for now)
  app.post('/api/claude/send-message', async (req, res) => {
    try {
      const { agentName, message, conversationId, fileEditMode } = req.body;
      
      // Use existing admin user ID 
      const userId = '42585527';
      
      const response = await claudeApiService.sendMessage(
        userId,
        agentName,
        conversationId,
        message,
        undefined, // systemPrompt
        undefined, // tools
        fileEditMode
      );
      
      res.json({ success: true, response });
    } catch (error) {
      console.error('Claude API error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // User info endpoint
  app.get('/api/user/info', (req, res) => {
    if (req.isAuthenticated?.()) {
      res.json({
        user: req.user,
        isAuthenticated: true
      });
    } else {
      res.json({
        user: null,
        isAuthenticated: false
      });
    }
  });
  
  return server;
}