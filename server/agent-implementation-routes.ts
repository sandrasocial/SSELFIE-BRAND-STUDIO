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

  console.log('✅ IMPLEMENTATION ROUTES: Agent implementation monitoring endpoints registered');
}