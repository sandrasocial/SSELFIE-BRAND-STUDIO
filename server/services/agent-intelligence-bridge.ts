/**
 * Agent Intelligence Bridge Service
 * Connects historical agent learning data with current conversation system
 * Restores agent personalities, specialties, and code knowledge
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

interface AgentIntelligence {
  agentName: string;
  historicalConversations: number;
  learningEntries: number;
  personalitiesRestored: boolean;
  specialtiesRestored: boolean;
  codeKnowledgeRestored: boolean;
  intelligenceLevel: 'Expert' | 'Advanced' | 'Intermediate' | 'Learning';
}

export class AgentIntelligenceBridge {
  
  /**
   * Get restored intelligence data for an agent
   */
  async getAgentIntelligence(agentName: string): Promise<AgentIntelligence | null> {
    try {
      const result = await db.execute(sql`
        SELECT 
          agent_name as "agentName",
          historical_conversations as "historicalConversations",
          learning_entries as "learningEntries", 
          personalities_restored as "personalitiesRestored",
          specialties_restored as "specialtiesRestored",
          code_knowledge_restored as "codeKnowledgeRestored",
          CASE 
            WHEN learning_entries > 50 THEN 'Expert'
            WHEN learning_entries > 20 THEN 'Advanced'
            WHEN learning_entries > 5 THEN 'Intermediate'
            ELSE 'Learning'
          END as "intelligenceLevel"
        FROM agent_intelligence_restore 
        WHERE agent_name = ${agentName}
      `);
      
      return result.rows[0] as AgentIntelligence || null;
    } catch (error) {
      console.error('Error fetching agent intelligence:', error);
      return null;
    }
  }
  
  /**
   * Get agent learning patterns from historical data
   */
  async getAgentLearningPatterns(agentName: string) {
    try {
      const patterns = await db.execute(sql`
        SELECT 
          learning_type,
          category,
          COUNT(*) as frequency,
          MAX(last_seen) as last_activity
        FROM agent_learning 
        WHERE agent_name = ${agentName}
        GROUP BY learning_type, category
        ORDER BY frequency DESC, last_activity DESC
      `);
      
      return patterns.rows;
    } catch (error) {
      console.error('Error fetching learning patterns:', error);
      return [];
    }
  }
  
  /**
   * Inject intelligence context into Claude conversation
   */
  async enhanceConversationContext(agentName: string, currentContext: any) {
    const intelligence = await this.getAgentIntelligence(agentName);
    const patterns = await this.getAgentLearningPatterns(agentName);
    
    if (!intelligence) return currentContext;
    
    return {
      ...currentContext,
      agentIntelligence: {
        level: intelligence.intelligenceLevel,
        historical_conversations: intelligence.historicalConversations,
        learning_entries: intelligence.learningEntries,
        personalities_restored: intelligence.personalitiesRestored,
        specialties_restored: intelligence.specialtiesRestored,
        code_knowledge_restored: intelligence.codeKnowledgeRestored,
        learning_patterns: patterns,
        restoration_note: `Intelligence restored from ${intelligence.historicalConversations} historical conversations and ${intelligence.learningEntries} learning entries`
      }
    };
  }
  
  /**
   * Get all agents with their intelligence status
   */
  async getAllAgentsIntelligence() {
    try {
      const result = await db.execute(sql`
        SELECT 
          agent_name,
          historical_conversations,
          learning_entries,
          personalities_restored,
          specialties_restored, 
          code_knowledge_restored,
          migration_status,
          restored_at
        FROM agent_intelligence_restore
        ORDER BY learning_entries DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching all agents intelligence:', error);
      return [];
    }
  }
}

export const agentIntelligenceBridge = new AgentIntelligenceBridge();