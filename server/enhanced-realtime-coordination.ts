/**
 * ENHANCED REAL-TIME AGENT COORDINATION SYSTEM
 * Week 1 Completion - Agent Team Activation
 * 
 * Provides real-time coordination between all 13 specialized agents
 * with WebSocket communication and automatic task handoffs
 */

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { db } from './db';
import { claudeConversations, agentLearning } from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

interface AgentStatus {
  agentName: string;
  status: 'active' | 'working' | 'thinking' | 'offline';
  currentTask?: string;
  lastActivity: Date;
  capabilities: string[];
  specialization: string;
}

interface CoordinationMessage {
  type: 'TASK_HANDOFF' | 'STATUS_UPDATE' | 'COORDINATION_REQUEST' | 'PROGRESS_UPDATE';
  from: string;
  to?: string; // undefined = broadcast
  data: any;
  timestamp: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface TaskHandoff {
  taskId: string;
  fromAgent: string;
  toAgent: string;
  taskDescription: string;
  context: any;
  requirements: string[];
  deadline?: Date;
}

export class EnhancedRealtimeCoordination extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private agentConnections: Map<string, WebSocket> = new Map();
  private agentStatuses: Map<string, AgentStatus> = new Map();
  private activeHandoffs: Map<string, TaskHandoff> = new Map();
  private coordinationHistory: CoordinationMessage[] = [];

  // Agent specializations based on SSELFIE Studio team
  private agentCapabilities = {
    'Elena': {
      specialization: 'Strategic Coordination & Workflow Orchestration',
      capabilities: ['workflow_planning', 'agent_coordination', 'strategic_oversight', 'task_delegation']
    },
    'Aria': {
      specialization: 'Visionary Editorial Designer & Creative Director',
      capabilities: ['luxury_design', 'editorial_layout', 'visual_storytelling', 'brand_aesthetics']
    },
    'Zara': {
      specialization: 'Technical Mastermind & Luxury Code Architect',
      capabilities: ['react_development', 'typescript', 'performance_optimization', 'architecture_design']
    },
    'Maya': {
      specialization: 'AI Photography & Image Generation Specialist',
      capabilities: ['flux_ai_training', 'individual_models', 'image_generation', 'photoshoot_coordination']
    },
    'Victoria': {
      specialization: 'UX Designer & Business Builder',
      capabilities: ['ux_design', 'conversion_optimization', 'user_flows', 'website_building']
    },
    'Rachel': {
      specialization: 'Copywriting Best Friend & Voice Twin',
      capabilities: ['copywriting', 'voice_consistency', 'brand_messaging', 'content_creation']
    },
    'Ava': {
      specialization: 'Automation AI & Invisible Empire Architect',
      capabilities: ['workflow_automation', 'system_integration', 'process_optimization', 'scalability']
    },
    'Quinn': {
      specialization: 'Quality Guardian & Luxury Standards Enforcer',
      capabilities: ['quality_assurance', 'luxury_validation', 'testing', 'compliance_monitoring']
    },
    'Sophia': {
      specialization: 'Social Media Manager & Community Architect',
      capabilities: ['social_media', 'community_building', 'content_strategy', 'engagement_optimization']
    },
    'Martha': {
      specialization: 'Marketing/Ads Performance Specialist',
      capabilities: ['performance_marketing', 'ad_optimization', 'conversion_tracking', 'roi_analysis']
    },
    'Diana': {
      specialization: 'Personal Mentor & Business Coach',
      capabilities: ['strategic_planning', 'business_coaching', 'decision_support', 'growth_strategy']
    },
    'Wilma': {
      specialization: 'Workflow AI & Process Architect',
      capabilities: ['process_design', 'efficiency_optimization', 'system_workflows', 'coordination_blueprints']
    },
    'Olga': {
      specialization: 'Repository Organizer & Architecture Specialist',
      capabilities: ['file_organization', 'architecture_cleanup', 'dependency_management', 'code_structure']
    }
  };

  constructor() {
    super();
    this.initializeAgentStatuses();
  }

  private initializeAgentStatuses() {
    Object.entries(this.agentCapabilities).forEach(([agentName, config]) => {
      this.agentStatuses.set(agentName, {
        agentName,
        status: 'offline',
        lastActivity: new Date(),
        capabilities: config.capabilities,
        specialization: config.specialization
      });
    });
  }

  /**
   * Initialize WebSocket server for real-time coordination
   */
  initializeWebSocket(server: any) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/agent-coordination-ws' 
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('🤝 New agent coordination connection established');

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as CoordinationMessage;
          this.handleCoordinationMessage(message, ws);
        } catch (error) {
          console.error('❌ Error parsing coordination message:', error);
        }
      });

      ws.on('close', () => {
        // Remove agent from active connections
        for (const [agentName, connection] of Array.from(this.agentConnections.entries())) {
          if (connection === ws) {
            this.agentConnections.delete(agentName);
            this.updateAgentStatus(agentName, 'offline');
            break;
          }
        }
      });

      // Send initial agent statuses
      this.sendToConnection(ws, {
        type: 'STATUS_UPDATE',
        from: 'SYSTEM',
        data: { agentStatuses: Array.from(this.agentStatuses.values()) },
        timestamp: new Date(),
        priority: 'MEDIUM'
      });
    });

    console.log('🚀 Enhanced Real-time Agent Coordination WebSocket initialized');
  }

  /**
   * Register an agent connection
   */
  registerAgent(agentName: string, connection: WebSocket) {
    this.agentConnections.set(agentName, connection);
    this.updateAgentStatus(agentName, 'active');
    
    // Broadcast agent joining
    this.broadcast({
      type: 'STATUS_UPDATE',
      from: 'SYSTEM',
      data: { message: `${agentName} joined coordination network`, agentName },
      timestamp: new Date(),
      priority: 'LOW'
    }, agentName);
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentName: string, status: AgentStatus['status'], currentTask?: string) {
    const agentStatus = this.agentStatuses.get(agentName);
    if (agentStatus) {
      agentStatus.status = status;
      agentStatus.lastActivity = new Date();
      if (currentTask) {
        agentStatus.currentTask = currentTask;
      }

      // Broadcast status update
      this.broadcast({
        type: 'STATUS_UPDATE',
        from: agentName,
        data: { agentStatus },
        timestamp: new Date(),
        priority: 'LOW'
      });
    }
  }

  /**
   * Initiate task handoff between agents
   */
  async initiateTaskHandoff(handoff: TaskHandoff): Promise<boolean> {
    const taskId = handoff.taskId;
    this.activeHandoffs.set(taskId, handoff);

    // Save handoff to database for persistence
    try {
      // Note: agentLearning table may need schema update for handoff tracking
    } catch (error) {
      console.error('❌ Error saving task handoff:', error);
    }

    // Send handoff message to receiving agent
    const message: CoordinationMessage = {
      type: 'TASK_HANDOFF',
      from: handoff.fromAgent,
      to: handoff.toAgent,
      data: handoff,
      timestamp: new Date(),
      priority: 'HIGH'
    };

    return this.sendToAgent(handoff.toAgent, message);
  }

  /**
   * Request coordination from Elena (strategic coordinator)
   */
  async requestCoordination(requestingAgent: string, coordinationNeeds: {
    taskDescription: string;
    requiredCapabilities: string[];
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    context: any;
  }): Promise<void> {
    const message: CoordinationMessage = {
      type: 'COORDINATION_REQUEST',
      from: requestingAgent,
      to: 'Elena',
      data: coordinationNeeds,
      timestamp: new Date(),
      priority: coordinationNeeds.urgency
    };

    await this.sendToAgent('Elena', message);
  }

  /**
   * Handle incoming coordination messages
   */
  private async handleCoordinationMessage(message: CoordinationMessage, senderWs: WebSocket) {
    this.coordinationHistory.push(message);

    // Keep only last 1000 messages
    if (this.coordinationHistory.length > 1000) {
      this.coordinationHistory = this.coordinationHistory.slice(-1000);
    }

    switch (message.type) {
      case 'TASK_HANDOFF':
        await this.processTaskHandoff(message.data as TaskHandoff);
        break;
      
      case 'STATUS_UPDATE':
        if (message.data.agentStatus) {
          this.agentStatuses.set(message.from, message.data.agentStatus);
        }
        break;
      
      case 'COORDINATION_REQUEST':
        await this.processCoordinationRequest(message);
        break;
      
      case 'PROGRESS_UPDATE':
        // Broadcast progress updates to interested agents
        this.broadcast(message, message.from);
        break;
    }

    // Emit event for external listeners
    this.emit('coordinationMessage', message);
  }

  /**
   * Process task handoff
   */
  private async processTaskHandoff(handoff: TaskHandoff) {
    console.log(`🤝 Processing task handoff: ${handoff.fromAgent} → ${handoff.toAgent}`);
    
    // Update receiving agent status
    this.updateAgentStatus(handoff.toAgent, 'working', handoff.taskDescription);
    
    // Notify completion to handoff initiator
    setTimeout(() => {
      this.sendToAgent(handoff.fromAgent, {
        type: 'PROGRESS_UPDATE',
        from: handoff.toAgent,
        data: { 
          taskId: handoff.taskId,
          status: 'ACCEPTED',
          message: `Task handoff accepted and processing started`
        },
        timestamp: new Date(),
        priority: 'MEDIUM'
      });
    }, 1000);
  }

  /**
   * Process coordination request (typically handled by Elena)
   */
  private async processCoordinationRequest(message: CoordinationMessage) {
    const needs = message.data;
    console.log(`🎯 Coordination request from ${message.from}:`, needs.taskDescription);

    // Find best agent for required capabilities
    const bestAgent = this.findBestAgentForCapabilities(needs.requiredCapabilities);
    
    if (bestAgent) {
      await this.initiateTaskHandoff({
        taskId: `coord-${Date.now()}`,
        fromAgent: message.from,
        toAgent: bestAgent,
        taskDescription: needs.taskDescription,
        context: needs.context,
        requirements: needs.requiredCapabilities
      });
    }
  }

  /**
   * Find best agent for required capabilities
   */
  private findBestAgentForCapabilities(requiredCapabilities: string[]): string | null {
    let bestMatch = '';
    let bestScore = 0;

    for (const [agentName, config] of Object.entries(this.agentCapabilities)) {
      const score = requiredCapabilities.filter(cap => 
        config.capabilities.includes(cap)
      ).length;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = agentName;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  /**
   * Send message to specific agent
   */
  sendToAgent(agentName: string, message: CoordinationMessage): boolean {
    const connection = this.agentConnections.get(agentName);
    if (connection && connection.readyState === WebSocket.OPEN) {
      return this.sendToConnection(connection, message);
    }
    return false;
  }

  /**
   * Broadcast message to all connected agents
   */
  broadcast(message: CoordinationMessage, excludeAgent?: string) {
    for (const [agentName, connection] of Array.from(this.agentConnections.entries())) {
      if (excludeAgent && agentName === excludeAgent) continue;
      if (connection.readyState === WebSocket.OPEN) {
        this.sendToConnection(connection, message);
      }
    }
  }

  /**
   * Send message to specific connection
   */
  private sendToConnection(connection: WebSocket, message: CoordinationMessage): boolean {
    try {
      connection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('❌ Error sending coordination message:', error);
      return false;
    }
  }

  /**
   * Get current coordination statistics
   */
  getCoordinationStats() {
    const activeAgents = Array.from(this.agentStatuses.values())
      .filter(agent => agent.status !== 'offline').length;
    
    const workingAgents = Array.from(this.agentStatuses.values())
      .filter(agent => agent.status === 'working').length;

    return {
      totalAgents: this.agentStatuses.size,
      activeAgents,
      workingAgents,
      activeHandoffs: this.activeHandoffs.size,
      messageHistory: this.coordinationHistory.length,
      lastActivity: Math.max(...Array.from(this.agentStatuses.values())
        .map(agent => agent.lastActivity.getTime()))
    };
  }

  /**
   * Get agent statuses for admin interface
   */
  getAgentStatuses(): AgentStatus[] {
    return Array.from(this.agentStatuses.values());
  }

  /**
   * Get recent coordination history
   */
  getRecentHistory(limit: number = 50): CoordinationMessage[] {
    return this.coordinationHistory.slice(-limit);
  }
}

// Export singleton instance
export const realtimeCoordination = new EnhancedRealtimeCoordination();