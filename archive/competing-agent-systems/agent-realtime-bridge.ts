/**
 * AGENT REALTIME BRIDGE
 * 
 * Connects fragmented client architecture to unified agent execution system.
 * Provides real-time communication pathways for dynamic agent interactions.
 */

import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

export interface RealtimeAgentMessage {
  type: 'component_update' | 'state_change' | 'file_modification' | 'database_operation';
  agentName: string;
  data: any;
  timestamp: Date;
  conversationId?: string;
}

export interface AgentSubscription {
  agentName: string;
  topics: string[];
  callback: (message: RealtimeAgentMessage) => void;
}

/**
 * REALTIME BRIDGE MANAGER
 * 
 * Manages real-time communication between agents and the application.
 * Fixes the disconnect between agents and live application state.
 */
export class AgentRealtimeBridge extends EventEmitter {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, AgentSubscription[]> = new Map();
  private messageQueue: RealtimeAgentMessage[] = [];
  private maxQueueSize = 1000;

  constructor() {
    super();
    this.setupMessageQueue();
  }

  /**
   * Connect agent to realtime bridge
   */
  connectAgent(agentName: string, ws: WebSocket) {
    this.connections.set(agentName, ws);
    
    console.log(`🔗 REALTIME BRIDGE: ${agentName} connected`);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as RealtimeAgentMessage;
        this.handleAgentMessage(agentName, message);
      } catch (error) {
        console.error(`❌ Invalid message from ${agentName}:`, error);
      }
    });

    ws.on('close', () => {
      console.log(`🔌 REALTIME BRIDGE: ${agentName} disconnected`);
      this.connections.delete(agentName);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for ${agentName}:`, error);
      this.connections.delete(agentName);
    });

    // Send queued messages for this agent
    this.sendQueuedMessages(agentName);
  }

  /**
   * Handle incoming messages from agents
   */
  private handleAgentMessage(agentName: string, message: RealtimeAgentMessage) {
    message.agentName = agentName;
    message.timestamp = new Date();

    console.log(`📨 BRIDGE MESSAGE [${agentName}]:`, message.type);

    // Add to message queue
    this.addToQueue(message);

    // Process message based on type
    switch (message.type) {
      case 'component_update':
        this.handleComponentUpdate(message);
        break;
        
      case 'state_change':
        this.handleStateChange(message);
        break;
        
      case 'file_modification':
        this.handleFileModification(message);
        break;
        
      case 'database_operation':
        this.handleDatabaseOperation(message);
        break;
        
      default:
        console.log(`❓ Unknown message type: ${message.type}`);
    }

    // Emit event for other parts of the system
    this.emit('agent_message', message);
    
    // Notify subscribers
    this.notifySubscribers(message);
  }

  /**
   * Handle component updates from agents
   */
  private async handleComponentUpdate(message: RealtimeAgentMessage) {
    const { component, updates } = message.data;
    
    console.log(`🎨 COMPONENT UPDATE [${message.agentName}]:`, component);
    
    // Broadcast to all connected clients
    this.broadcastToClients({
      type: 'component_updated',
      agentName: message.agentName,
      component,
      updates,
      timestamp: message.timestamp
    });

    // Store update for future agent connections
    this.storeUpdate(message);
  }

  /**
   * Handle application state changes
   */
  private async handleStateChange(message: RealtimeAgentMessage) {
    const { state, newValue } = message.data;
    
    console.log(`🔄 STATE CHANGE [${message.agentName}]:`, state);
    
    // Broadcast state change
    this.broadcastToClients({
      type: 'state_changed',
      agentName: message.agentName,
      state,
      newValue,
      timestamp: message.timestamp
    });

    // Emit for internal handling
    this.emit('state_change', { agentName: message.agentName, state, newValue });
  }

  /**
   * Handle file modifications
   */
  private async handleFileModification(message: RealtimeAgentMessage) {
    const { filePath, operation, content } = message.data;
    
    console.log(`📁 FILE MODIFICATION [${message.agentName}]:`, operation, filePath);
    
    // Notify development environment of file changes
    this.broadcastToClients({
      type: 'file_modified',
      agentName: message.agentName,
      filePath,
      operation,
      timestamp: message.timestamp
    });

    // Trigger hot reload if needed
    this.emit('file_modified', { agentName: message.agentName, filePath, operation });
  }

  /**
   * Handle database operations
   */
  private async handleDatabaseOperation(message: RealtimeAgentMessage) {
    const { table, operation, data } = message.data;
    
    console.log(`🗃️ DATABASE OPERATION [${message.agentName}]:`, operation, table);
    
    // Broadcast database changes
    this.broadcastToClients({
      type: 'database_updated',
      agentName: message.agentName,
      table,
      operation,
      timestamp: message.timestamp
    });

    // Emit for cache invalidation, etc.
    this.emit('database_operation', { agentName: message.agentName, table, operation, data });
  }

  /**
   * Subscribe to agent messages
   */
  subscribe(agentName: string, topics: string[], callback: (message: RealtimeAgentMessage) => void) {
    if (!this.subscriptions.has(agentName)) {
      this.subscriptions.set(agentName, []);
    }
    
    this.subscriptions.get(agentName)!.push({
      agentName,
      topics,
      callback
    });

    console.log(`📡 SUBSCRIPTION: ${agentName} subscribed to [${topics.join(', ')}]`);
  }

  /**
   * Unsubscribe from agent messages
   */
  unsubscribe(agentName: string, callback?: (message: RealtimeAgentMessage) => void) {
    const subs = this.subscriptions.get(agentName);
    if (subs) {
      if (callback) {
        const index = subs.findIndex(sub => sub.callback === callback);
        if (index !== -1) {
          subs.splice(index, 1);
        }
      } else {
        this.subscriptions.delete(agentName);
      }
    }
  }

  /**
   * Send message to specific agent
   */
  sendToAgent(agentName: string, message: any) {
    const connection = this.connections.get(agentName);
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(JSON.stringify(message));
        console.log(`📤 SENT TO AGENT [${agentName}]:`, message.type);
      } catch (error) {
        console.error(`❌ Failed to send to ${agentName}:`, error);
      }
    } else {
      console.log(`📭 QUEUING MESSAGE for ${agentName}:`, message.type);
      this.addToQueue({
        type: message.type,
        agentName,
        data: message,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast message to all connected agents
   */
  broadcastToAgents(message: any) {
    const activeConnections = Array.from(this.connections.entries())
      .filter(([_, ws]) => ws.readyState === WebSocket.OPEN);

    console.log(`📢 BROADCASTING to ${activeConnections.length} agents:`, message.type);

    for (const [agentName, ws] of activeConnections) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`❌ Broadcast failed to ${agentName}:`, error);
      }
    }
  }

  /**
   * Broadcast to frontend clients (different from agents)
   */
  private broadcastToClients(message: any) {
    // This would integrate with the main WebSocket system for frontend clients
    console.log(`📡 CLIENT BROADCAST:`, message.type);
    
    // Emit for other parts of the system to handle
    this.emit('client_broadcast', message);
  }

  /**
   * Setup message queue management
   */
  private setupMessageQueue() {
    // Clean old messages every minute
    setInterval(() => {
      const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes ago
      this.messageQueue = this.messageQueue.filter(msg => 
        msg.timestamp.getTime() > cutoff
      );
    }, 60000);
  }

  /**
   * Add message to queue
   */
  private addToQueue(message: RealtimeAgentMessage) {
    this.messageQueue.push(message);
    
    // Keep queue size manageable
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue = this.messageQueue.slice(-this.maxQueueSize);
    }
  }

  /**
   * Send queued messages to newly connected agent
   */
  private sendQueuedMessages(agentName: string) {
    const relevantMessages = this.messageQueue.filter(msg => 
      msg.agentName === agentName || !msg.agentName
    );

    if (relevantMessages.length > 0) {
      console.log(`📮 SENDING ${relevantMessages.length} queued messages to ${agentName}`);
      
      for (const message of relevantMessages) {
        this.sendToAgent(agentName, {
          type: 'queued_message',
          originalMessage: message
        });
      }
    }
  }

  /**
   * Notify subscribers of new messages
   */
  private notifySubscribers(message: RealtimeAgentMessage) {
    const agentSubs = this.subscriptions.get(message.agentName) || [];
    const globalSubs = this.subscriptions.get('*') || [];
    
    [...agentSubs, ...globalSubs].forEach(sub => {
      if (sub.topics.includes('*') || sub.topics.includes(message.type)) {
        try {
          sub.callback(message);
        } catch (error) {
          console.error(`❌ Subscription callback error:`, error);
        }
      }
    });
  }

  /**
   * Store update for persistence
   */
  private storeUpdate(message: RealtimeAgentMessage) {
    // This could store to database for persistence across restarts
    console.log(`💾 STORING UPDATE [${message.agentName}]:`, message.type);
  }

  /**
   * Get bridge status
   */
  getStatus() {
    return {
      connectedAgents: this.connections.size,
      agents: Array.from(this.connections.keys()),
      subscriptions: this.subscriptions.size,
      queuedMessages: this.messageQueue.length,
      recentActivity: this.messageQueue.slice(-10)
    };
  }

  /**
   * Get agent connection status
   */
  isAgentConnected(agentName: string): boolean {
    const connection = this.connections.get(agentName);
    return connection ? connection.readyState === WebSocket.OPEN : false;
  }

  /**
   * Force disconnect agent
   */
  disconnectAgent(agentName: string) {
    const connection = this.connections.get(agentName);
    if (connection) {
      connection.close();
      this.connections.delete(agentName);
      console.log(`🔌 FORCE DISCONNECT: ${agentName}`);
    }
  }
  /**
   * Initialize the realtime bridge with app context
   */
  async initialize(app?: any): Promise<void> {
    console.log('🔧 Initializing Agent Realtime Bridge...');
    
    // Initialize bridge capabilities
    this.setupMessageQueue();
    
    console.log('✅ Agent Realtime Bridge initialized successfully');
  }
}

// Export singleton instance
export const agentRealtimeBridge = new AgentRealtimeBridge();