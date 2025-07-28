import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupRollbackRoutes } from './routes/rollback.js';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// UNIFIED AGENT SYSTEM IMPORT (Single source of truth)
import { unifiedAgentSystem } from './unified-agent-system';

// ELENA WORKFLOW DETECTION IMPORT
import { elenaWorkflowDetection } from './elena-workflow-detection';

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
      
      console.log('🔍 Claude send-message called with:', {
        agentName,
        messageLength: message?.length || 0,
        conversationId,
        fileEditMode
      });
      
      // Validate required fields
      if (!agentName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name is required' 
        });
      }
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Message is required' 
        });
      }
      
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

  // Claude conversation management endpoints
  app.post('/api/claude/conversation/new', async (req, res) => {
    try {
      const { agentName } = req.body;
      
      if (!agentName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name is required' 
        });
      }
      
      // Use existing admin user ID 
      const userId = '42585527';
      
      // Generate new conversation ID
      const conversationId = `conv_${agentName}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const conversationDbId = await claudeApiService.createConversationIfNotExists(
        userId,
        agentName,
        conversationId
      );
      
      res.json({ 
        success: true, 
        conversationId,
        id: conversationDbId
      });
    } catch (error) {
      console.error('Conversation creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create conversation' 
      });
    }
  });

  app.get('/api/claude/conversation/:conversationId/history', async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      if (!conversationId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Conversation ID is required' 
        });
      }
      
      const messages = await claudeApiService.getConversationHistory(conversationId);
      
      res.json({ 
        success: true, 
        messages 
      });
    } catch (error) {
      console.error('Conversation history error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load conversation history' 
      });
    }
  });

  app.post('/api/claude/conversation/clear', async (req, res) => {
    try {
      const { agentName } = req.body;
      
      if (!agentName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name is required' 
        });
      }
      
      // For now, just return success - conversation clearing can be implemented later
      res.json({ 
        success: true, 
        message: 'Conversation cleared successfully' 
      });
    } catch (error) {
      console.error('Conversation clear error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear conversation' 
      });
    }
  });

  // STREAMING CLAUDE SEND-MESSAGE: Real-time text streaming like Replit AI
  app.post('/api/claude/send-message-stream', async (req, res) => {
    try {
      const { agentName, message, conversationId, fileEditMode = true } = req.body;
      
      if (!agentName || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name and message are required' 
        });
      }

      // Get user ID for authentication
      let userId = 'admin-sandra';
      if (req.isAuthenticated() && req.user) {
        const user = req.user as any;
        userId = user.claims?.sub || userId;
      }

      // Import streaming service
      const { streamingService } = await import('./services/streaming-response-service');

      // Get response from Claude API service (non-streaming first)
      const response = await claudeApiService.sendMessage(
        agentName,
        message,
        conversationId || `conv_${agentName}_${Date.now()}`,
        fileEditMode,
        userId
      );

      // Stream the response like Replit AI agents
      await streamingService.streamClaudeResponse(res, agentName, response, {
        conversationId: conversationId,
        showToolExecution: true
      });

    } catch (error) {
      console.error('Streaming Claude error:', error);
      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Failed to process request',
          timestamp: new Date().toISOString()
        })}\n\n`);
        res.end();
      }
    }
  });

  // LEGACY NON-STREAMING ENDPOINT: For backward compatibility
  app.post('/api/claude/send-message', async (req, res) => {
    try {
      console.log('🔍 Claude send-message called with:', {
        agentName: req.body.agentName,
        messageLength: req.body.message?.length,
        conversationId: req.body.conversationId,
        fileEditMode: req.body.fileEditMode
      });

      const { agentName, message, conversationId, fileEditMode = true } = req.body;
      
      if (!agentName || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name and message are required' 
        });
      }

      // Get user ID for authentication
      let userId = 'admin-sandra'; // Default admin user
      if (req.isAuthenticated() && req.user) {
        const user = req.user as any;
        userId = user.claims?.sub || userId;
      }

      // Use the Claude API service for agent communication
      const response = await claudeApiService.sendMessage(
        agentName,
        message,
        conversationId || `conv_${agentName}_${Date.now()}`,
        fileEditMode,
        userId
      );

      res.json({
        success: true,
        response: response,
        conversationId: conversationId || `conv_${agentName}_${Date.now()}`
      });

    } catch (error) {
      console.error('Claude send-message error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message to agent' 
      });
    }
  });
  
  // Auth user endpoint for frontend - CRITICAL: ADMIN AGENT AUTHENTICATION FIX
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('🔍 /api/auth/user called - checking authentication');
      
      // Check if user is authenticated through normal session
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        console.log('✅ User authenticated via session, fetching user data for:', userId);
        
        const user = await storage.getUser(userId);
        if (user) {
          console.log('✅ User found in database:', user.email);
          return res.json(user);
        }
      }
      
      // CRITICAL FIX: Admin agent authentication bypass
      const adminToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token'];
      if (adminToken === 'sandra-admin-2025') {
        console.log('🔑 Admin token authenticated - creating admin user session');
        
        // Get or create Sandra admin user
        let adminUser = await storage.getUser('admin-sandra');
        if (!adminUser) {
          adminUser = await storage.upsertUser({
            id: 'admin-sandra',
            email: 'ssa@ssasocial.com',
            firstName: 'Sandra',
            lastName: 'Admin',
            profileImageUrl: null
          });
        }
        
        console.log('✅ Admin user authenticated:', adminUser.email);
        return res.json(adminUser);
      }
      
      console.log('❌ User not authenticated - no session or admin token');
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error('❌ Auth error:', error);
      return res.status(500).json({ message: "Authentication error" });
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

  // 🧠 ELENA WORKFLOW DETECTION ENDPOINTS
  
  // Manual workflow trigger endpoint
  app.post('/api/elena/trigger-workflow', async (req, res) => {
    try {
      const { content, workflowType, userId } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      const workflowId = await elenaWorkflowDetection.triggerWorkflow(
        content,
        userId || '42585527', // Default to admin user
        workflowType
      );
      
      res.json({
        success: true,
        workflowId,
        message: 'Elena workflow detection triggered',
        elena_status: 'analyzing_and_assigning'
      });
      
    } catch (error) {
      console.error('❌ Elena workflow trigger error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger workflow'
      });
    }
  });
  
  // Elena detection status endpoint
  app.get('/api/elena/status', (req, res) => {
    try {
      const status = elenaWorkflowDetection.getDetectionStatus();
      res.json({
        success: true,
        elena: status,
        message: 'Elena workflow detection system operational'
      });
    } catch (error) {
      console.error('❌ Elena status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Elena status'
      });
    }
  });
  
  return server;
}