// server/routes/streaming-admin-routes.ts - Fixed streaming admin routes
import type { Express, Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export interface StreamingAdminRoutesConfig {
  enabled: boolean;
  timestamp: string;
}

export interface AgentStreamingMessage {
  agentId: string;
  message: string;
  conversationId?: string;
  type: 'user' | 'agent';
  timestamp: number;
}

class StreamingAgentManager {
  private connections = new Map<string, WebSocket>();
  
  addConnection(agentId: string, ws: WebSocket) {
    this.connections.set(agentId, ws);
    console.log(`🔌 Agent ${agentId} connected via WebSocket`);
  }
  
  removeConnection(agentId: string) {
    this.connections.delete(agentId);
    console.log(`🔌 Agent ${agentId} disconnected`);
  }
  
  broadcastToAgent(agentId: string, message: AgentStreamingMessage) {
    const ws = this.connections.get(agentId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

const streamingManager = new StreamingAgentManager();

export function registerStreamingAdminRoutes(app: Express, httpServer: Server) {
  // Use the unified WebSocket system to prevent conflicts - delegating to unified-agent-system.ts
  console.log('✅ STREAMING ADMIN ROUTES: Using unified WebSocket system to prevent conflicts');
  
  // REST endpoint for agent streaming status
  app.get('/api/admin/streaming/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      connectedAgents: Array.from(streamingManager['connections'].keys()),
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('✅ STREAMING ADMIN ROUTES: WebSocket and REST endpoints registered');
}

export const streamingAdminRoutesService = {
  initialize: (): StreamingAdminRoutesConfig => ({
    enabled: true,
    timestamp: new Date().toISOString()
  }),
  
  broadcastMessage: (agentId: string, message: AgentStreamingMessage) => {
    streamingManager.broadcastToAgent(agentId, message);
  }
};
