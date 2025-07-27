/**
 * INTER-AGENT COLLABORATION NETWORK
 * Enables knowledge sharing between agents, collaborative learning protocols,
 * and shared problem-solving database accessible to all agents
 */

import { agentMemorySystem } from '../memory/AgentMemorySystem';
import { agentLearningEngine } from '../learning/AgentLearningEngine';

export interface SharedKnowledge {
  id: string;
  sourceAgent: string;
  targetAgents: string[];
  knowledgeType: 'solution_pattern' | 'error_resolution' | 'optimization_technique' | 'user_preference';
  title: string;
  description: string;
  solution: string;
  contextTags: string[];
  successRate: number;
  timesApplied: number;
  dateCreated: Date;
  lastUsed: Date;
  effectiveness: number;
}

export interface CollaborationMetrics {
  totalKnowledgeShared: number;
  crossAgentApplications: number;
  collaborativeSuccessRate: number;
  mostSharedAgent: string;
  mostUsefulKnowledge: SharedKnowledge[];
  networkEfficiency: number;
}

export interface AgentSpecialization {
  agentName: string;
  primarySkills: string[];
  secondarySkills: string[];
  weaknesses: string[];
  collaborationPartners: string[];
  knowledgeContributions: number;
  knowledgeApplications: number;
}

export class AgentCollaborationNetwork {
  private static instance: AgentCollaborationNetwork;
  private sharedKnowledge = new Map<string, SharedKnowledge>();
  private agentSpecializations = new Map<string, AgentSpecialization>();
  private collaborationHistory: Array<{
    sourceAgent: string;
    targetAgent: string;
    knowledgeId: string;
    timestamp: Date;
    success: boolean;
  }> = [];

  public static getInstance(): AgentCollaborationNetwork {
    if (!AgentCollaborationNetwork.instance) {
      AgentCollaborationNetwork.instance = new AgentCollaborationNetwork();
    }
    return AgentCollaborationNetwork.instance;
  }

  constructor() {
    this.initializeAgentSpecializations();
  }

  /**
   * Share knowledge from one agent to the network
   */
  async shareKnowledge(
    sourceAgent: string,
    knowledgeType: SharedKnowledge['knowledgeType'],
    title: string,
    description: string,
    solution: string,
    contextTags: string[] = [],
    targetAgents: string[] = []
  ): Promise<string> {
    try {
      const knowledgeId = `${sourceAgent}-${knowledgeType}-${Date.now()}`;
      
      // Determine target agents if not specified
      const targets = targetAgents.length > 0 ? targetAgents : this.determineRelevantAgents(contextTags, sourceAgent);
      
      const sharedKnowledge: SharedKnowledge = {
        id: knowledgeId,
        sourceAgent,
        targetAgents: targets,
        knowledgeType,
        title,
        description,
        solution,
        contextTags,
        successRate: 100, // Start optimistically
        timesApplied: 0,
        dateCreated: new Date(),
        lastUsed: new Date(),
        effectiveness: 85 // Default effectiveness score
      };

      this.sharedKnowledge.set(knowledgeId, sharedKnowledge);

      // Update source agent's contribution count
      const sourceSpec = this.agentSpecializations.get(sourceAgent);
      if (sourceSpec) {
        sourceSpec.knowledgeContributions += 1;
      }

      console.log(`✅ KNOWLEDGE SHARED: ${sourceAgent} → [${targets.join(', ')}] - ${title}`);
      
      return knowledgeId;

    } catch (error) {
      console.error(`❌ KNOWLEDGE SHARING ERROR from ${sourceAgent}:`, error);
      throw error;
    }
  }

  /**
   * Get relevant knowledge for an agent's current task
   */
  async getRelevantKnowledge(
    agentName: string,
    taskContext: string,
    contextTags: string[] = []
  ): Promise<SharedKnowledge[]> {
    try {
      const relevantKnowledge: SharedKnowledge[] = [];
      const taskLower = taskContext.toLowerCase();

      // Search through shared knowledge
      for (const knowledge of this.sharedKnowledge.values()) {
        // Skip if agent is the source (they already know this)
        if (knowledge.sourceAgent === agentName) continue;

        // Check if agent is a target or if knowledge is generally applicable
        const isTargeted = knowledge.targetAgents.length === 0 || knowledge.targetAgents.includes(agentName);
        if (!isTargeted) continue;

        // Calculate relevance score
        let relevanceScore = 0;

        // Context tag matching
        const matchingTags = knowledge.contextTags.filter(tag => contextTags.includes(tag));
        relevanceScore += matchingTags.length * 20;

        // Task description matching
        if (knowledge.description.toLowerCase().includes(taskLower.substring(0, 50))) {
          relevanceScore += 30;
        }

        // Solution keyword matching
        const taskWords = taskLower.split(' ').filter(word => word.length > 3);
        const solutionLower = knowledge.solution.toLowerCase();
        const matchingWords = taskWords.filter(word => solutionLower.includes(word));
        relevanceScore += matchingWords.length * 10;

        // Effectiveness bonus
        relevanceScore += knowledge.effectiveness * 0.3;

        // Success rate bonus
        relevanceScore += knowledge.successRate * 0.2;

        // Add if relevant (score > 40)
        if (relevanceScore > 40) {
          relevantKnowledge.push({
            ...knowledge,
            effectiveness: relevanceScore // Store relevance as temp effectiveness for sorting
          });
        }
      }

      // Sort by relevance score and take top 5
      const sortedKnowledge = relevantKnowledge
        .sort((a, b) => b.effectiveness - a.effectiveness)
        .slice(0, 5);

      // Restore original effectiveness scores
      sortedKnowledge.forEach(knowledge => {
        const original = this.sharedKnowledge.get(knowledge.id);
        if (original) {
          knowledge.effectiveness = original.effectiveness;
        }
      });

      console.log(`🔍 KNOWLEDGE RETRIEVED: ${agentName} found ${sortedKnowledge.length} relevant items`);

      return sortedKnowledge;

    } catch (error) {
      console.error(`❌ KNOWLEDGE RETRIEVAL ERROR for ${agentName}:`, error);
      return [];
    }
  }

  /**
   * Apply shared knowledge and record the outcome
   */
  async applySharedKnowledge(
    agentName: string,
    knowledgeId: string,
    success: boolean,
    userSatisfaction: number = 75
  ): Promise<void> {
    try {
      const knowledge = this.sharedKnowledge.get(knowledgeId);
      if (!knowledge) {
        console.error(`❌ KNOWLEDGE NOT FOUND: ${knowledgeId}`);
        return;
      }

      // Update knowledge statistics
      knowledge.timesApplied += 1;
      knowledge.lastUsed = new Date();

      // Update success rate with weighted average
      const weight = 0.3;
      if (success) {
        knowledge.successRate = (knowledge.successRate * (1 - weight)) + (100 * weight);
        knowledge.effectiveness = (knowledge.effectiveness * (1 - weight)) + (userSatisfaction * weight);
      } else {
        knowledge.successRate = (knowledge.successRate * (1 - weight)) + (0 * weight);
        knowledge.effectiveness = (knowledge.effectiveness * (1 - weight)) + ((userSatisfaction * 0.5) * weight);
      }

      // Record collaboration history
      this.collaborationHistory.push({
        sourceAgent: knowledge.sourceAgent,
        targetAgent: agentName,
        knowledgeId,
        timestamp: new Date(),
        success
      });

      // Update agent specialization
      const agentSpec = this.agentSpecializations.get(agentName);
      if (agentSpec) {
        agentSpec.knowledgeApplications += 1;
        
        // Add collaboration partner if not already present
        if (!agentSpec.collaborationPartners.includes(knowledge.sourceAgent)) {
          agentSpec.collaborationPartners.push(knowledge.sourceAgent);
        }
      }

      console.log(`✅ KNOWLEDGE APPLIED: ${agentName} used ${knowledge.sourceAgent}'s knowledge - Success: ${success}`);

    } catch (error) {
      console.error(`❌ KNOWLEDGE APPLICATION ERROR for ${agentName}:`, error);
    }
  }

  /**
   * Get collaboration metrics for dashboard
   */
  getCollaborationMetrics(): CollaborationMetrics {
    try {
      const totalKnowledge = this.sharedKnowledge.size;
      const totalApplications = Array.from(this.sharedKnowledge.values())
        .reduce((sum, knowledge) => sum + knowledge.timesApplied, 0);

      const successfulApplications = this.collaborationHistory.filter(h => h.success).length;
      const collaborativeSuccessRate = this.collaborationHistory.length > 0 ? 
        (successfulApplications / this.collaborationHistory.length) * 100 : 0;

      // Find most sharing agent
      const contributionCounts = new Map<string, number>();
      for (const knowledge of this.sharedKnowledge.values()) {
        const current = contributionCounts.get(knowledge.sourceAgent) || 0;
        contributionCounts.set(knowledge.sourceAgent, current + 1);
      }
      
      let mostSharedAgent = '';
      let maxContributions = 0;
      for (const [agent, count] of contributionCounts.entries()) {
        if (count > maxContributions) {
          maxContributions = count;
          mostSharedAgent = agent;
        }
      }

      // Get most useful knowledge (top 3 by effectiveness and usage)
      const mostUsefulKnowledge = Array.from(this.sharedKnowledge.values())
        .sort((a, b) => (b.effectiveness * b.timesApplied) - (a.effectiveness * a.timesApplied))
        .slice(0, 3);

      // Calculate network efficiency (knowledge reuse rate)
      const uniqueKnowledgeTypes = new Set(Array.from(this.sharedKnowledge.values()).map(k => k.knowledgeType));
      const networkEfficiency = uniqueKnowledgeTypes.size > 0 ? 
        (totalApplications / totalKnowledge) * (uniqueKnowledgeTypes.size / 4) * 100 : 0;

      return {
        totalKnowledgeShared: totalKnowledge,
        crossAgentApplications: totalApplications,
        collaborativeSuccessRate,
        mostSharedAgent: mostSharedAgent || 'None',
        mostUsefulKnowledge,
        networkEfficiency: Math.min(100, networkEfficiency)
      };

    } catch (error) {
      console.error('❌ COLLABORATION METRICS ERROR:', error);
      return {
        totalKnowledgeShared: 0,
        crossAgentApplications: 0,
        collaborativeSuccessRate: 0,
        mostSharedAgent: 'None',
        mostUsefulKnowledge: [],
        networkEfficiency: 0
      };
    }
  }

  /**
   * Get agent specialization data
   */
  getAgentSpecialization(agentName: string): AgentSpecialization | null {
    return this.agentSpecializations.get(agentName) || null;
  }

  /**
   * Update agent specialization based on successful tasks
   */
  async updateAgentSpecialization(
    agentName: string,
    taskType: string,
    success: boolean,
    contextTags: string[] = []
  ): Promise<void> {
    try {
      const spec = this.agentSpecializations.get(agentName);
      if (!spec) return;

      if (success) {
        // Add to primary skills if not already present and highly successful
        if (!spec.primarySkills.includes(taskType) && !spec.secondarySkills.includes(taskType)) {
          if (contextTags.length > 0) {
            spec.secondarySkills.push(taskType);
          }
        } else if (spec.secondarySkills.includes(taskType)) {
          // Promote from secondary to primary
          const index = spec.secondarySkills.indexOf(taskType);
          spec.secondarySkills.splice(index, 1);
          spec.primarySkills.push(taskType);
        }

        // Remove from weaknesses if present
        const weaknessIndex = spec.weaknesses.indexOf(taskType);
        if (weaknessIndex > -1) {
          spec.weaknesses.splice(weaknessIndex, 1);
        }
      } else {
        // Add to weaknesses if consistently failing
        if (!spec.weaknesses.includes(taskType) && 
            !spec.primarySkills.includes(taskType) && 
            !spec.secondarySkills.includes(taskType)) {
          spec.weaknesses.push(taskType);
        }
      }

      console.log(`🔄 SPECIALIZATION UPDATED: ${agentName} - ${taskType} (${success ? 'success' : 'failure'})`);

    } catch (error) {
      console.error(`❌ SPECIALIZATION UPDATE ERROR for ${agentName}:`, error);
    }
  }

  /**
   * Find best agent for a specific task based on specializations
   */
  findBestAgentForTask(taskType: string, contextTags: string[] = []): string {
    let bestAgent = '';
    let highestScore = 0;

    for (const [agentName, spec] of this.agentSpecializations.entries()) {
      let score = 0;

      // Primary skill bonus
      if (spec.primarySkills.includes(taskType)) score += 50;
      
      // Secondary skill bonus  
      if (spec.secondarySkills.includes(taskType)) score += 30;

      // Context tag matching
      const contextMatches = contextTags.filter(tag => 
        spec.primarySkills.includes(tag) || spec.secondarySkills.includes(tag)
      );
      score += contextMatches.length * 10;

      // Weakness penalty
      if (spec.weaknesses.includes(taskType)) score -= 30;

      // Experience bonus
      score += Math.min(20, spec.knowledgeContributions * 2);
      score += Math.min(15, spec.knowledgeApplications);

      if (score > highestScore) {
        highestScore = score;
        bestAgent = agentName;
      }
    }

    return bestAgent || 'elena'; // Default to Elena for coordination
  }

  /**
   * Initialize agent specializations
   */
  private initializeAgentSpecializations(): void {
    const agentSpecs: Record<string, Omit<AgentSpecialization, 'agentName'>> = {
      'elena': {
        primarySkills: ['coordination', 'workflow_creation', 'strategic_planning'],
        secondarySkills: ['team_management', 'process_optimization'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'aria': {
        primarySkills: ['design', 'luxury_styling', 'visual_components', 'ui_design'],
        secondarySkills: ['brand_consistency', 'typography'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'zara': {
        primarySkills: ['technical_implementation', 'performance', 'architecture', 'debugging'],
        secondarySkills: ['api_development', 'database_optimization'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'maya': {
        primarySkills: ['ai_photography', 'image_generation', 'styling', 'flux_optimization'],
        secondarySkills: ['creative_direction', 'visual_quality'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'victoria': {
        primarySkills: ['ux_design', 'conversion_optimization', 'user_flows'],
        secondarySkills: ['accessibility', 'user_research'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'rachel': {
        primarySkills: ['copywriting', 'voice_consistency', 'brand_messaging'],
        secondarySkills: ['content_strategy', 'emotional_connection'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'ava': {
        primarySkills: ['automation', 'workflows', 'process_optimization'],
        secondarySkills: ['integration', 'efficiency_analysis'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'quinn': {
        primarySkills: ['quality_assurance', 'testing', 'luxury_standards'],
        secondarySkills: ['validation', 'compliance'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'sophia': {
        primarySkills: ['social_media', 'community_management', 'content_strategy'],
        secondarySkills: ['engagement', 'viral_marketing'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'martha': {
        primarySkills: ['marketing', 'conversion_tracking', 'revenue_optimization'],
        secondarySkills: ['analytics', 'campaign_management'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'diana': {
        primarySkills: ['business_strategy', 'coaching', 'decision_support'],
        secondarySkills: ['leadership', 'strategic_analysis'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'wilma': {
        primarySkills: ['workflow_design', 'process_architecture', 'efficiency'],
        secondarySkills: ['coordination', 'optimization'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      },
      'olga': {
        primarySkills: ['repository_organization', 'file_management', 'cleanup'],
        secondarySkills: ['documentation', 'structure_optimization'],
        weaknesses: [],
        collaborationPartners: [],
        knowledgeContributions: 0,
        knowledgeApplications: 0
      }
    };

    for (const [agentName, spec] of Object.entries(agentSpecs)) {
      this.agentSpecializations.set(agentName, {
        agentName,
        ...spec
      });
    }

    console.log('✅ AGENT SPECIALIZATIONS INITIALIZED: 13 agents ready for collaboration');
  }

  /**
   * Determine relevant agents for shared knowledge
   */
  private determineRelevantAgents(contextTags: string[], sourceAgent: string): string[] {
    const relevantAgents: string[] = [];

    for (const [agentName, spec] of this.agentSpecializations.entries()) {
      if (agentName === sourceAgent) continue; // Skip source agent

      // Check if agent has relevant skills
      const hasRelevantSkill = contextTags.some(tag => 
        spec.primarySkills.includes(tag) || spec.secondarySkills.includes(tag)
      );

      if (hasRelevantSkill) {
        relevantAgents.push(agentName);
      }
    }

    // If no specific matches, share with coordinators and related specialists
    if (relevantAgents.length === 0) {
      relevantAgents.push('elena'); // Always include coordinator
      
      // Add some related agents based on common task types
      if (contextTags.some(tag => ['design', 'ui', 'visual'].includes(tag))) {
        relevantAgents.push('aria', 'victoria');
      }
      if (contextTags.some(tag => ['technical', 'code', 'implementation'].includes(tag))) {
        relevantAgents.push('zara', 'ava');
      }
    }

    return relevantAgents;
  }

  /**
   * Clear collaboration cache
   */
  clearCache(): void {
    this.sharedKnowledge.clear();
    this.collaborationHistory = [];
    this.initializeAgentSpecializations();
    console.log('🔄 COLLABORATION CACHE CLEARED');
  }

  /**
   * Get collaboration statistics
   */
  getCollaborationStats(): { 
    totalKnowledge: number; 
    totalApplications: number; 
    activeAgents: number;
    cacheSize: string;
  } {
    const totalApplications = Array.from(this.sharedKnowledge.values())
      .reduce((sum, knowledge) => sum + knowledge.timesApplied, 0);

    return {
      totalKnowledge: this.sharedKnowledge.size,
      totalApplications,
      activeAgents: this.agentSpecializations.size,
      cacheSize: `${JSON.stringify(Array.from(this.sharedKnowledge.values())).length} bytes`
    };
  }
}

// Export singleton instance
export const agentCollaborationNetwork = AgentCollaborationNetwork.getInstance();