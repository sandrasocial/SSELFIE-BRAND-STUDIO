// SSELFIE STUDIO - INTELLIGENT AGENT ROUTING SYSTEM
// Prevents agent conflicts and optimizes task distribution

import { CONSULTING_AGENT_PERSONALITIES } from './agent-personalities-consulting';
import { FileIntegrationEnforcer } from './tools/file-integration-enforcer';

export interface AgentRequest {
  requestType: string;
  description: string;
  filePath?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedComplexity: number; // 1-10 scale
}

export interface AgentCapability {
  agentId: string;
  name: string;
  role: string;
  specialties: string[];
  currentLoad: number;
  maxConcurrentTasks: number;
  successRate: number;
  averageCompletionTime: number; // in minutes
  lastActive: Date;
}

export interface RoutingDecision {
  primaryAgent: string;
  supportingAgents: string[];
  reasoning: string;
  estimatedTime: number;
  conflictRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  integrationRequirements: string[];
}

export class IntelligentAgentRouter {
  
  private static agentCapabilities: Map<string, AgentCapability> = new Map([
    ['elena', {
      agentId: 'elena',
      name: 'Elena',
      role: 'Strategic Coordinator',
      specialties: ['coordination', 'workflows', 'planning', 'multi-agent'],
      currentLoad: 0,
      maxConcurrentTasks: 5,
      successRate: 95,
      averageCompletionTime: 15,
      lastActive: new Date()
    }],
    ['aria', {
      agentId: 'aria',
      name: 'Aria',
      role: 'Visual Design Expert',
      specialties: ['design', 'ui', 'components', 'styling', 'luxury'],
      currentLoad: 0,
      maxConcurrentTasks: 3,
      successRate: 98,
      averageCompletionTime: 25,
      lastActive: new Date()
    }],
    ['zara', {
      agentId: 'zara',
      name: 'Zara',
      role: 'Technical Architect',
      specialties: ['technical', 'backend', 'architecture', 'performance', 'debugging'],
      currentLoad: 0,
      maxConcurrentTasks: 4,
      successRate: 97,
      averageCompletionTime: 20,
      lastActive: new Date()
    }],
    ['maya', {
      agentId: 'maya',
      name: 'Maya',
      role: 'AI Photography Expert',
      specialties: ['ai-generation', 'photography', 'creative', 'user-experience'],
      currentLoad: 0,
      maxConcurrentTasks: 2,
      successRate: 94,
      averageCompletionTime: 30,
      lastActive: new Date()
    }],
    ['victoria', {
      agentId: 'victoria',
      name: 'Victoria',
      role: 'UX Specialist',
      specialties: ['ux', 'user-interface', 'conversion', 'usability'],
      currentLoad: 0,
      maxConcurrentTasks: 3,
      successRate: 96,
      averageCompletionTime: 22,
      lastActive: new Date()
    }],
    ['rachel', {
      agentId: 'rachel',
      name: 'Rachel',
      role: 'Voice Specialist',
      specialties: ['copywriting', 'voice', 'messaging', 'content'],
      currentLoad: 0,
      maxConcurrentTasks: 4,
      successRate: 99,
      averageCompletionTime: 18,
      lastActive: new Date()
    }],
    ['ava', {
      agentId: 'ava',
      name: 'Ava',
      role: 'Automation Specialist',
      specialties: ['automation', 'workflows', 'integration', 'apis'],
      currentLoad: 0,
      maxConcurrentTasks: 3,
      successRate: 95,
      averageCompletionTime: 35,
      lastActive: new Date()
    }],
    ['quinn', {
      agentId: 'quinn',
      name: 'Quinn',
      role: 'Quality Assurance',
      specialties: ['qa', 'testing', 'validation', 'luxury-standards'],
      currentLoad: 0,
      maxConcurrentTasks: 4,
      successRate: 99,
      averageCompletionTime: 20,
      lastActive: new Date()
    }]
  ]);

  static routeRequest(request: AgentRequest): RoutingDecision {
    console.log(`🧠 INTELLIGENT ROUTING: Analyzing request - ${request.description}`);
    
    const { requestType, description, filePath, urgency, estimatedComplexity } = request;
    
    // Step 1: Check file integration requirements
    const integrationCheck = this.checkIntegrationRequirements(request);
    
    // Step 2: Analyze request to determine optimal agent
    const suitabilityScores = this.calculateAgentSuitability(request);
    
    // Step 3: Consider current load and availability
    const availabilityScores = this.calculateAvailabilityScores();
    
    // Step 4: Combine scores and select optimal agent
    const finalScores = this.combineScores(suitabilityScores, availabilityScores, urgency);
    
    // Step 5: Select primary and supporting agents
    const sortedAgents = Array.from(finalScores.entries())
      .sort(([,a], [,b]) => b - a);
    
    const primaryAgent = sortedAgents[0][0];
    const supportingAgents = sortedAgents
      .slice(1, 3)
      .filter(([,score]) => score > 0.3)
      .map(([agentId]) => agentId);
    
    // Step 6: Calculate conflict risk
    const conflictRisk = this.assessConflictRisk(request, primaryAgent);
    
    // Step 7: Generate routing decision
    const decision: RoutingDecision = {
      primaryAgent,
      supportingAgents,
      reasoning: this.generateRoutingReasoning(request, primaryAgent, suitabilityScores),
      estimatedTime: this.estimateCompletionTime(request, primaryAgent),
      conflictRisk,
      integrationRequirements: integrationCheck.instructions
    };
    
    console.log(`🎯 ROUTING DECISION: Primary=${primaryAgent}, Supporting=[${supportingAgents.join(', ')}], Risk=${conflictRisk}`);
    
    return decision;
  }
  
  private static checkIntegrationRequirements(request: AgentRequest): {
    allowed: boolean;
    instructions: string[];
  } {
    if (request.filePath) {
      const enforcement = FileIntegrationEnforcer.enforceIntegrationProtocol({
        agentId: 'router',
        message: request.description,
        requestType: request.requestType,
        filePath: request.filePath
      });
      
      return {
        allowed: enforcement.allowed,
        instructions: enforcement.instructions
      };
    }
    
    return {
      allowed: true,
      instructions: ['Standard integration protocol applies']
    };
  }
  
  private static calculateAgentSuitability(request: AgentRequest): Map<string, number> {
    const scores = new Map<string, number>();
    const description = request.description.toLowerCase();
    
    // Analyze keywords to determine best agent match
    const keywordAnalysis = {
      'design': ['aria', 'victoria'],
      'ui': ['aria', 'victoria'],
      'component': ['aria', 'zara'],
      'styling': ['aria'],
      'technical': ['zara'],
      'backend': ['zara', 'ava'],
      'api': ['zara', 'ava'],
      'performance': ['zara'],
      'architecture': ['zara'],
      'ai': ['maya'],
      'generation': ['maya'],
      'photography': ['maya'],
      'ux': ['victoria'],
      'user': ['victoria', 'maya'],
      'conversion': ['victoria'],
      'copy': ['rachel'],
      'content': ['rachel'],
      'voice': ['rachel'],
      'messaging': ['rachel'],
      'automation': ['ava'],
      'workflow': ['ava', 'elena'],
      'integration': ['ava', 'zara'],
      'coordinate': ['elena'],
      'planning': ['elena'],
      'strategy': ['elena'],
      'qa': ['quinn'],
      'testing': ['quinn'],
      'quality': ['quinn'],
      'validation': ['quinn']
    };
    
    // Initialize all agents with base score
    for (const [agentId] of this.agentCapabilities) {
      scores.set(agentId, 0.1);
    }
    
    // Score based on keyword matches
    Object.entries(keywordAnalysis).forEach(([keyword, agents]) => {
      if (description.includes(keyword)) {
        agents.forEach(agentId => {
          const currentScore = scores.get(agentId) || 0;
          scores.set(agentId, currentScore + 0.2);
        });
      }
    });
    
    // Boost scores based on complexity and request type
    if (request.estimatedComplexity > 7) {
      // Complex tasks favor technical specialists
      scores.set('zara', (scores.get('zara') || 0) + 0.3);
      scores.set('elena', (scores.get('elena') || 0) + 0.2);
    }
    
    if (request.urgency === 'CRITICAL') {
      // Critical tasks favor reliable agents
      scores.set('rachel', (scores.get('rachel') || 0) + 0.1);
      scores.set('quinn', (scores.get('quinn') || 0) + 0.1);
    }
    
    return scores;
  }
  
  private static calculateAvailabilityScores(): Map<string, number> {
    const scores = new Map<string, number>();
    
    this.agentCapabilities.forEach((capability, agentId) => {
      const loadPercentage = capability.currentLoad / capability.maxConcurrentTasks;
      const availabilityScore = Math.max(0, 1 - loadPercentage);
      
      // Factor in success rate
      const reliabilityBonus = capability.successRate / 100 * 0.2;
      
      scores.set(agentId, availabilityScore + reliabilityBonus);
    });
    
    return scores;
  }
  
  private static combineScores(
    suitability: Map<string, number>,
    availability: Map<string, number>,
    urgency: string
  ): Map<string, number> {
    const combined = new Map<string, number>();
    
    const urgencyWeight = urgency === 'CRITICAL' ? 0.8 : urgency === 'HIGH' ? 0.7 : 0.6;
    const availabilityWeight = 1 - urgencyWeight;
    
    this.agentCapabilities.forEach((_, agentId) => {
      const suitScore = suitability.get(agentId) || 0;
      const availScore = availability.get(agentId) || 0;
      
      const finalScore = (suitScore * urgencyWeight) + (availScore * availabilityWeight);
      combined.set(agentId, finalScore);
    });
    
    return combined;
  }
  
  private static assessConflictRisk(request: AgentRequest, primaryAgent: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Check for file modification conflicts
    if (request.filePath && request.filePath.includes('admin-dashboard')) {
      return 'MEDIUM'; // Admin dashboard modifications need coordination
    }
    
    if (request.estimatedComplexity > 8) {
      return 'HIGH'; // Complex tasks have higher conflict risk
    }
    
    if (request.urgency === 'CRITICAL') {
      return 'HIGH'; // Critical tasks need careful coordination
    }
    
    return 'LOW';
  }
  
  private static generateRoutingReasoning(
    request: AgentRequest,
    primaryAgent: string,
    suitabilityScores: Map<string, number>
  ): string {
    const capability = this.agentCapabilities.get(primaryAgent);
    const score = suitabilityScores.get(primaryAgent) || 0;
    
    if (!capability) return 'Unknown agent selected';
    
    return `Selected ${capability.name} (${capability.role}) with suitability score ${score.toFixed(2)}. ` +
           `Specialties: ${capability.specialties.join(', ')}. ` +
           `Current load: ${capability.currentLoad}/${capability.maxConcurrentTasks}. ` +
           `Success rate: ${capability.successRate}%.`;
  }
  
  private static estimateCompletionTime(request: AgentRequest, primaryAgent: string): number {
    const capability = this.agentCapabilities.get(primaryAgent);
    if (!capability) return 30;
    
    const baseTime = capability.averageCompletionTime;
    const complexityMultiplier = 1 + (request.estimatedComplexity - 5) * 0.1;
    
    return Math.round(baseTime * complexityMultiplier);
  }
  
  // Agent management methods
  static updateAgentLoad(agentId: string, newLoad: number): void {
    const capability = this.agentCapabilities.get(agentId);
    if (capability) {
      capability.currentLoad = newLoad;
      capability.lastActive = new Date();
    }
  }
  
  static updateAgentMetrics(agentId: string, completionTime: number, success: boolean): void {
    const capability = this.agentCapabilities.get(agentId);
    if (capability) {
      // Update success rate (simple moving average)
      const newSuccessRate = success ? 
        Math.min(100, capability.successRate + 1) : 
        Math.max(0, capability.successRate - 2);
      
      capability.successRate = newSuccessRate;
      capability.averageCompletionTime = Math.round(
        (capability.averageCompletionTime + completionTime) / 2
      );
      capability.lastActive = new Date();
    }
  }
  
  static getAgentStatuses(): AgentCapability[] {
    return Array.from(this.agentCapabilities.values());
  }
  
  static getRoutingMetrics(): {
    totalRequests: number;
    averageResponseTime: number;
    conflictResolutions: number;
    loadBalanceEfficiency: number;
  } {
    const agents = Array.from(this.agentCapabilities.values());
    const averageLoad = agents.reduce((sum, agent) => 
      sum + (agent.currentLoad / agent.maxConcurrentTasks), 0) / agents.length;
    
    return {
      totalRequests: 0, // Would track in real implementation
      averageResponseTime: 0, // Would track in real implementation
      conflictResolutions: 0, // Would track in real implementation
      loadBalanceEfficiency: Math.round((1 - averageLoad) * 100)
    };
  }
}