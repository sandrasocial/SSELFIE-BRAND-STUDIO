/**
 * UNIFIED AGENT SYSTEM - THE SINGLE SOURCE OF TRUTH
 * 
 * This is the ONE AND ONLY agent integration system.
 * All other agent integration files are DEACTIVATED to prevent decision paralysis.
 * 
 * Replaces 58+ competing systems with one clean integration.
 */

import type { Express } from 'express';
import { WebSocketServer } from 'ws';
import type { Server } from 'http';
import { db } from './db';
import { storage } from './storage';

export interface AgentRequest {
  agentId: string;
  message: string;
  conversationId: string;
  enforceTools: boolean;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  toolsUsed: string[];
  error?: string;
}

/**
 * THE SINGLE UNIFIED AGENT SYSTEM
 * All agent communication flows through this one system
 */
export class UnifiedAgentSystem {
  private static instance: UnifiedAgentSystem;
  private wss: WebSocketServer | null = null;
  private activeSessions = new Map<string, any>();

  private constructor() {}

  static getInstance(): UnifiedAgentSystem {
    if (!UnifiedAgentSystem.instance) {
      UnifiedAgentSystem.instance = new UnifiedAgentSystem();
    }
    return UnifiedAgentSystem.instance;
  }

  /**
   * Initialize the SINGLE agent integration system
   */
  async initialize(app: Express, httpServer: Server) {
    console.log('🎯 UNIFIED AGENT SYSTEM: Initializing single integration layer...');

    // Setup WebSocket for agent communication
    this.setupWebSocket(httpServer);
    
    // Register the ONLY agent API endpoints
    this.registerAgentEndpoints(app);

    console.log('✅ UNIFIED AGENT SYSTEM: Single integration layer operational');
  }

  /**
   * Setup WebSocket for real-time agent communication
   */
  private setupWebSocket(httpServer: Server) {
    this.wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/ws',
      clientTracking: true 
    });

    this.wss.on('connection', (ws, req) => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.activeSessions.set(sessionId, { ws, connected: new Date() });

      console.log(`🔗 AGENT: Session ${sessionId} connected`);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleAgentMessage(sessionId, message, ws);
        } catch (error) {
          console.error('❌ Agent WebSocket error:', error);
          ws.send(JSON.stringify({ 
            error: 'Message processing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });

      ws.on('close', () => {
        console.log(`🔌 AGENT: Session ${sessionId} disconnected`);
        this.activeSessions.delete(sessionId);
      });

      // Send ready signal
      ws.send(JSON.stringify({
        type: 'agent_system_ready',
        sessionId,
        architecture: 'express_react_vite_unified',
        capabilities: ['file_modification', 'database_access', 'real_time_updates']
      }));
    });

    console.log('🚀 WEBSOCKET: Real-time agent communication active');
  }

  /**
   * Register the ONLY agent API endpoints
   */
  private registerAgentEndpoints(app: Express) {
    // Agent execution endpoint - THE SINGLE ENTRY POINT
    app.post('/api/agents/execute', async (req, res) => {
      try {
        const { agentId, message, conversationId, enforceTools = false } = req.body;
        
        const result = await this.executeAgent({
          agentId,
          message,
          conversationId,
          enforceTools
        });

        res.json(result);
      } catch (error) {
        console.error('❌ Agent execution error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Agent status endpoint
    app.get('/api/agents/status', (req, res) => {
      res.json({
        success: true,
        system: 'unified_agent_system',
        active_sessions: this.activeSessions.size,
        websocket_clients: this.wss?.clients.size || 0,
        competing_systems_deactivated: true,
        single_integration_layer: true
      });
    });

    console.log('🎯 API ENDPOINTS: Single agent execution endpoint registered');
  }

  /**
   * Execute agent request through the SINGLE system
   */
  async executeAgent(request: AgentRequest): Promise<AgentResponse> {
    console.log(`🤖 EXECUTING: ${request.agentId} through unified system`);

    try {
      // Import Claude API service for actual agent execution
      const { ClaudeApiService } = await import('./services/claude-api-service');
      
      // Execute through the unified Claude API
      const response = await ClaudeApiService.sendMessage(
        request.agentId,
        request.message,
        request.conversationId,
        { enforceTools: request.enforceTools }
      );

      // Broadcast to WebSocket clients
      this.broadcastToClients({
        type: 'agent_execution_complete',
        agentId: request.agentId,
        success: true,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        response: response.content,
        toolsUsed: response.toolsUsed || [],
      };

    } catch (error) {
      console.error(`❌ Agent ${request.agentId} execution failed:`, error);
      
      return {
        success: false,
        response: '',
        toolsUsed: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle WebSocket agent messages
   */
  private async handleAgentMessage(sessionId: string, message: any, ws: any) {
    console.log(`📨 AGENT MESSAGE: ${message.type} from session ${sessionId}`);

    switch (message.type) {
      case 'execute_agent':
        const result = await this.executeAgent(message.request);
        ws.send(JSON.stringify({
          type: 'execution_result',
          result
        }));
        break;

      case 'get_status':
        ws.send(JSON.stringify({
          type: 'status_response',
          status: this.getSystemStatus()
        }));
        break;

      default:
        console.log(`🔍 Unknown message type: ${message.type}`);
    }
  }

  /**
   * Broadcast message to all connected WebSocket clients
   */
  private broadcastToClients(message: any) {
    if (this.wss) {
      this.wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      system: 'unified_agent_system',
      active: true,
      sessions: this.activeSessions.size,
      websocket_clients: this.wss?.clients.size || 0,
      competing_systems: 'deactivated',
      decision_paralysis: 'resolved'
    };
  }
}

// Export singleton instance
export const unifiedAgentSystem = UnifiedAgentSystem.getInstance();