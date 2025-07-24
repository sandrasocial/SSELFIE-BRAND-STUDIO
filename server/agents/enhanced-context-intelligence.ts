/**
 * ENHANCED CONTEXT INTELLIGENCE SYSTEM
 * Integrates Predictive Intelligence with existing Context Intelligence for Replit AI-level proactivity
 */

import { PredictiveIntelligenceSystem } from './predictive-intelligence-system';
import { CodebaseUnderstandingIntelligence } from './codebase-understanding-intelligence';
import { ContextIntelligenceSystem } from './context-intelligence-system';
import { ErrorDetectionIntelligence } from './error-detection-intelligence';

interface EnhancedContextData {
  // Original context intelligence
  conversationHistory: any[];
  projectContext: any;
  contextualizedMessage: string;
  
  // New predictive intelligence  
  predictiveInsights: any[];
  anticipatedNextSteps: string[];
  proactiveActions: string[];
  agentRecommendations: string[];
  workflowSuggestions: string[];
  
  // Codebase understanding intelligence
  codebaseContext: string;
}

export class EnhancedContextIntelligenceSystem {
  /**
   * ENHANCED CONTEXT PROCESSING - Combines existing context with predictive intelligence
   */
  static async processEnhancedContext(
    userId: string, 
    message: string, 
    agentId: string,
    conversationHistory: any[] = []
  ): Promise<EnhancedContextData> {
    console.log(`🧠➡️🔮 ENHANCED CONTEXT: Processing context + predictions for ${agentId}`);
    
    try {
      // 1. Get existing context intelligence
      const contextData = await ContextIntelligenceSystem.contextualizeMessage(
        userId, 
        agentId, 
        message
      );
      
      // 2. Generate predictive insights  
      const predictiveInsights = await PredictiveIntelligenceSystem.generatePredictiveInsights(
        userId, 
        message, 
        agentId
      );
      
      // 3. Get codebase understanding context
      const codebaseContext = await CodebaseUnderstandingIntelligence.getAgentContext(message);
      
      // 4. Extract actionable insights
      const anticipatedNextSteps = predictiveInsights
        .filter(insight => insight.type === 'NEXT_TASK')
        .map(insight => insight.suggestion);
        
      const proactiveActions = predictiveInsights
        .filter(insight => insight.type === 'PROACTIVE_ACTION')  
        .map(insight => insight.suggestion);
        
      const agentRecommendations = predictiveInsights
        .filter(insight => insight.type === 'AGENT_RECOMMENDATION')
        .map(insight => `Consider ${insight.agentId}: ${insight.suggestion}`);
        
      const workflowSuggestions = predictiveInsights
        .filter(insight => insight.type === 'WORKFLOW_SUGGESTION')
        .map(insight => insight.suggestion);

      // 5. Enhance contextual message with predictive intelligence
      let enhancedMessage = contextData.contextualizedMessage;
      
      if (predictiveInsights.length > 0) {
        const topInsight = predictiveInsights[0]; // Highest confidence
        
        if (topInsight.confidence > 0.75) {
          enhancedMessage += `\n\n**PREDICTIVE CONTEXT**: Based on your patterns, you'll likely want to ${topInsight.suggestion} next. ${topInsight.reasoning}`;
        }
        
        if (agentRecommendations.length > 0 && topInsight.type === 'AGENT_RECOMMENDATION') {
          enhancedMessage += `\n\n**AGENT SUGGESTION**: ${agentRecommendations[0]}`;
        }
      }
      
      // Add codebase context for technical queries
      if (message.toLowerCase().includes('code') || message.toLowerCase().includes('file') || 
          message.toLowerCase().includes('architecture') || message.toLowerCase().includes('feature')) {
        enhancedMessage += `\n\n**CODEBASE CONTEXT**: ${codebaseContext}`;
      }
      
      console.log(`🔮 PREDICTIVE INSIGHTS: Generated ${predictiveInsights.length} insights`);
      console.log(`🎯 TOP PREDICTION: ${predictiveInsights[0]?.suggestion || 'None'} (${Math.round((predictiveInsights[0]?.confidence || 0) * 100)}% confidence)`);
      
      return {
        // Original context intelligence
        conversationHistory: contextData.conversationHistory,
        projectContext: contextData.projectContext, 
        contextualizedMessage: enhancedMessage,
        
        // New predictive intelligence
        predictiveInsights,
        anticipatedNextSteps,
        proactiveActions,
        agentRecommendations,
        workflowSuggestions,
        
        // Codebase understanding intelligence
        codebaseContext
      };
      
    } catch (error) {
      console.error('❌ Enhanced context processing failed:', error);
      
      // Fallback to basic context intelligence
      const basicContext = await ContextIntelligenceSystem.contextualizeMessage(
        userId, 
        agentId, 
        message
      );
      
      return {
        ...basicContext,
        predictiveInsights: [],
        anticipatedNextSteps: [],
        proactiveActions: [],
        agentRecommendations: [],
        workflowSuggestions: [],
        codebaseContext: 'Codebase analysis temporarily unavailable'
      };
    }
  }

  /**
   * GENERATE PROACTIVE AGENT RESPONSE - Makes agents suggest next steps like Replit AI
   */
  static generateProactiveResponse(enhancedContext: EnhancedContextData, agentId: string): string {
    const { predictiveInsights, anticipatedNextSteps, proactiveActions } = enhancedContext;
    
    if (predictiveInsights.length === 0) {
      return ''; // No proactive suggestions
    }
    
    const topInsight = predictiveInsights[0];
    let proactiveResponse = '';
    
    if (topInsight.confidence > 0.80) {
      // High confidence - suggest proactively
      proactiveResponse += `\n\n💡 **I anticipate you'll want to ${topInsight.suggestion}** - shall I prepare that for you?`;
      
      if (topInsight.estimatedTime) {
        proactiveResponse += ` (Estimated time: ${topInsight.estimatedTime})`;
      }
    } else if (topInsight.confidence > 0.65) {
      // Medium confidence - offer suggestion
      proactiveResponse += `\n\n💭 Based on your typical workflow, you might want to consider: ${topInsight.suggestion}`;
    }
    
    // Add proactive actions if available
    if (proactiveActions.length > 0 && topInsight.type === 'PROACTIVE_ACTION') {
      proactiveResponse += `\n\n🚀 **Proactive suggestion**: I can ${proactiveActions[0]} to help prevent issues. Would you like me to do that?`;
    }
    
    return proactiveResponse;
  }

  /**
   * AGENT HANDOFF INTELLIGENCE - Smart agent recommendations
   */
  static generateHandoffSuggestion(enhancedContext: EnhancedContextData, currentAgentId: string): string | null {
    const agentRecommendation = enhancedContext.predictiveInsights.find(
      insight => insight.type === 'AGENT_RECOMMENDATION' && insight.confidence > 0.75
    );
    
    if (agentRecommendation && agentRecommendation.agentId !== currentAgentId) {
      return `\n\n🔄 **Agent handoff suggestion**: ${agentRecommendation.suggestion} - would you like me to coordinate with ${agentRecommendation.agentId}?`;
    }
    
    return null;
  }

  /**
   * WORKFLOW COORDINATION INTELLIGENCE - Elena's enhanced capabilities
   */
  static generateWorkflowSuggestion(enhancedContext: EnhancedContextData): string | null {
    const workflowSuggestion = enhancedContext.predictiveInsights.find(
      insight => insight.type === 'WORKFLOW_SUGGESTION' && insight.confidence > 0.70
    );
    
    if (workflowSuggestion) {
      return `\n\n🎯 **Workflow suggestion**: ${workflowSuggestion.suggestion} - I can coordinate this complex task across multiple agents for optimal results.`;
    }
    
    return null;
  }
}