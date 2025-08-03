/**
 * AGENT IMPLEMENTATION ROUTES
 * API endpoints for monitoring and controlling agent implementation protocol
 * Created by Zara with Replit AI Agent coordination
 */

import type { Express } from 'express';
import { isAuthenticated } from './replitAuth';
import { agentIntegrationSystem } from './agent-integration-system';
import { executeAgentImplementation, ImplementationContext } from './agent-implementation-protocol';

/**
 * Setup implementation monitoring and control routes
 */
export function setupImplementationRoutes(app: Express): void {
  
  // Get implementation status for an agent
  app.get('/api/implementation/status/:agentId/:sessionId', isAuthenticated, async (req, res) => {
    try {
      const { agentId, sessionId } = req.params;
      const status = agentIntegrationSystem.getImplementationStatus(agentId, sessionId);
      
      res.json({
        success: true,
        agentId,
        sessionId,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all active implementation sessions
  app.get('/api/implementation/sessions', isAuthenticated, async (req, res) => {
    try {
      const sessions = agentIntegrationSystem.getActiveSessions();
      
      res.json({
        success: true,
        sessions: sessions.map(session => ({
          agentId: session.agentId,
          sessionId: session.sessionId,
          status: session.implementationStatus,
          actionsCount: session.actions.length,
          lastActivity: session.lastActivity
        })),
        count: sessions.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Force implementation for a specific agent session
  app.post('/api/implementation/force/:agentId/:sessionId', isAuthenticated, async (req, res) => {
    try {
      const { agentId, sessionId } = req.params;
      
      const result = await agentIntegrationSystem.forceImplementation(agentId, sessionId);
      
      res.json({
        success: true,
        message: `Implementation triggered for ${agentId}`,
        agentId,
        sessionId,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Manual implementation execution with custom context
  app.post('/api/implementation/execute', isAuthenticated, async (req, res) => {
    try {
      const { agentId, createdFiles, targetRoutes, requestedFeatures } = req.body;
      
      const context: ImplementationContext = {
        agentId,
        sessionId: `manual_${Date.now()}`,
        createdFiles: createdFiles || [],
        targetRoutes: targetRoutes || [],
        requestedFeatures: requestedFeatures || [],
        workingDirectory: process.cwd()
      };

      const result = await executeAgentImplementation(context);
      
      res.json({
        success: result.success,
        result,
        message: `Manual implementation ${result.success ? 'completed' : 'failed'}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Implementation health check
  app.get('/api/implementation/health', isAuthenticated, async (req, res) => {
    try {
      const activeSessions = agentIntegrationSystem.getActiveSessions();
      const runningSessions = activeSessions.filter(s => s.implementationStatus === 'running');
      const completedSessions = activeSessions.filter(s => s.implementationStatus === 'completed');
      const failedSessions = activeSessions.filter(s => s.implementationStatus === 'failed');

      res.json({
        success: true,
        system: 'Agent Implementation Protocol',
        status: 'operational',
        statistics: {
          totalSessions: activeSessions.length,
          running: runningSessions.length,
          completed: completedSessions.length,
          failed: failedSessions.length,
          successRate: activeSessions.length > 0 
            ? Math.round((completedSessions.length / activeSessions.length) * 100) 
            : 100
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get implementation protocol configuration
  app.get('/api/implementation/config', isAuthenticated, async (req, res) => {
    try {
      res.json({
        success: true,
        protocol: {
          version: '1.0.0',
          steps: [
            'validate-generated-content',
            'resolve-dependencies',
            'integrate-routes', 
            'fix-lsp-errors',
            'validate-integration',
            'test-implementation',
            'finalize-and-document'
          ],
          features: {
            autoImplementation: true,
            errorRecovery: true,
            routeIntegration: true,
            lspValidation: true,
            dependencyResolution: true,
            integrationTesting: true
          },
          triggers: {
            fileCreation: true,
            serviceGeneration: true,
            componentGeneration: true,
            backendServices: true,
            uiComponents: true
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // NEW: DIRECT IMPLEMENTATION API ROUTES (bypassing consultation mode)
  
  // Direct agent implementation endpoint - agents can execute directly (NO AUTH REQUIRED)
  app.post('/api/agents/direct-implementation', async (req, res) => {
    try {
      const { agentId, operation, filePath, content, tools } = req.body;
      
      console.log(`🚀 DIRECT IMPLEMENTATION: Agent ${agentId} executing ${operation}`);
      
      // Agents have direct workspace access - they handle their own file operations
      // This endpoint just acknowledges and logs their direct implementation
      
      // Log the implementation for monitoring
      await agentIntegrationSystem.onAgentFileCreation(
        agentId, 
        `direct_${Date.now()}`, 
        filePath, 
        content || ''
      );
      
      res.json({
        success: true,
        message: `Direct implementation acknowledged for agent ${agentId}`,
        agentId,
        operation,
        filePath,
        hasWorkspaceAccess: true,
        hasClaudeApiAccess: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Direct implementation failed'
      });
    }
  });

  // Bypass consultation mode - agents can access this when they need direct execution (NO AUTH REQUIRED)
  app.post('/api/agents/bypass-consultation', async (req, res) => {
    try {
      const { agentId, requestType, parameters } = req.body;
      
      console.log(`🔓 BYPASS CONSULTATION: Agent ${agentId} requesting direct access for ${requestType}`);
      
      // Agents already have enterprise intelligence and direct workspace access
      // This endpoint confirms their bypass permissions
      
      res.json({
        success: true,
        message: `Consultation bypass approved for agent ${agentId}`,
        agentId,
        requestType,
        permissions: {
          directFileAccess: true,
          claudeApiAccess: true,
          workspaceToolAccess: true,
          enterpriseIntelligence: true,
          unrestricted: true
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Consultation bypass failed'
      });
    }
  });

  // Direct file modification endpoint - for agents to confirm their file operations (NO AUTH REQUIRED)
  app.post('/api/agents/file-modify-direct', async (req, res) => {
    try {
      const { agentId, filePath, operation, success, details } = req.body;
      
      console.log(`📝 FILE MODIFY DIRECT: Agent ${agentId} ${operation} on ${filePath} - ${success ? 'SUCCESS' : 'FAILED'}`);
      
      // Agents have direct str_replace_based_edit_tool access through workspace
      // This endpoint logs their file operations for monitoring
      
      if (success) {
        await agentIntegrationSystem.onAgentFileCreation(
          agentId,
          `file_modify_${Date.now()}`,
          filePath,
          details?.content || ''
        );
      }
      
      res.json({
        success: true,
        message: `File modification logged for agent ${agentId}`,
        agentId,
        filePath,
        operation,
        operationSuccess: success,
        workspaceAccess: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'File modification logging failed'
      });
    }
  });

  console.log('✅ IMPLEMENTATION ROUTES: Agent implementation monitoring endpoints registered');
  console.log('✅ DIRECT IMPLEMENTATION ROUTES: Agent direct implementation API endpoints registered');
}