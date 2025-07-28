// SSELFIE STUDIO - STREAMLINED INTELLIGENT AGENT ROUTING
// Optimized for sub-100ms performance with simplified expertise-based routing

import { CONSULTING_AGENT_PERSONALITIES } from './agent-personalities-consulting';

export interface AgentRequest {
  requestType: string;
  description: string;
  filePath?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedComplexity: number;
}

export interface RoutingDecision {
  primaryAgent: string;
  reasoning: string;
  estimatedTime: number;
  confidence: number;
}

export class IntelligentAgentRouter {

  // Streamlined expertise domains for fast matching
  private static readonly EXPERTISE_KEYWORDS = {
    'elena': ['coordinate', 'workflow', 'strategy', 'plan', 'multi-agent', 'orchestrate'],
    'aria': ['design', 'ui', 'component', 'styling', 'luxury', 'visual', 'editorial'],
    'zara': ['technical', 'backend', 'architecture', 'performance', 'debugging', 'api'],
    'maya': ['ai', 'generation', 'photography', 'creative', 'flux', 'model'],
    'victoria': ['ux', 'user', 'conversion', 'usability', 'interface'],
    'rachel': ['copy', 'content', 'voice', 'messaging', 'brand'],
    'ava': ['automation', 'workflow', 'integration', 'process'],
    'quinn': ['qa', 'testing', 'quality', 'validation', 'standards'],
    'sophia': ['social', 'media', 'community', 'engagement', 'growth'],
    'martha': ['marketing', 'conversion', 'revenue', 'business'],
    'diana': ['strategy', 'decision', 'planning', 'analysis'],
    'wilma': ['workflow', 'process', 'organization', 'efficiency'],
    'olga': ['organization', 'files', 'structure', 'cleanup']
  };

  static routeRequest(request: AgentRequest): RoutingDecision {
    const startTime = Date.now();

    const description = request.description.toLowerCase();
    const scores = new Map<string, number>();

    // Fast keyword matching - O(n) complexity
    for (const [agentId, keywords] of Object.entries(this.EXPERTISE_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          score += 1;
        }
      }

      // Boost for complexity and urgency
      if (request.estimatedComplexity > 7 && ['zara', 'elena'].includes(agentId)) {
        score += 2;
      }
      if (request.urgency === 'CRITICAL' && ['rachel', 'quinn'].includes(agentId)) {
        score += 1;
      }

      scores.set(agentId, score);
    }

    // Find best match
    const sortedAgents = Array.from(scores.entries())
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);

    const primaryAgent = sortedAgents.length > 0 ? sortedAgents[0][0] : 'elena';
    const confidence = sortedAgents.length > 0 ? Math.min(95, sortedAgents[0][1] * 20) : 50;

    const routingTime = Date.now() - startTime;
    console.log(`🎯 FAST ROUTING: ${primaryAgent} selected in ${routingTime}ms (confidence: ${confidence}%)`);

    return {
      primaryAgent,
      reasoning: `Selected ${primaryAgent} based on expertise matching (${confidence}% confidence)`,
      estimatedTime: this.getEstimatedTime(primaryAgent, request.estimatedComplexity),
      confidence
    };
  }

  private static getEstimatedTime(agentId: string, complexity: number): number {
    const baseTimes = {
      'elena': 15, 'aria': 25, 'zara': 20, 'maya': 30, 'victoria': 22,
      'rachel': 18, 'ava': 35, 'quinn': 20, 'sophia': 25, 'martha': 28,
      'diana': 22, 'wilma': 30, 'olga': 25
    };

    const baseTime = baseTimes[agentId as keyof typeof baseTimes] || 25;
    return Math.round(baseTime * (1 + (complexity - 5) * 0.1));
  }
}