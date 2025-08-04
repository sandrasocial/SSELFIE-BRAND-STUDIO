import Anthropic from '@anthropic-ai/sdk';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import agentPersonalities from '../agent-personalities-consulting';
// Simplified imports for token optimization system

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL_STR = 'claude-3-5-sonnet-20241022';

/**
 * CLAUDE API SERVICE - TOKEN OPTIMIZED VERSION
 * Restored intelligent token scaling and streamlined architecture
 */
export class ClaudeApiServiceWorking {
  // Simplified service for token optimization focus

  /**
   * INTELLIGENT TOKEN OPTIMIZATION
   * Scale token usage based on task complexity to prevent excessive costs
   */
  private getOptimalTokenLimit(userMessage: string, agentName: string): number {
    const complexityIndicators = [
      'entire codebase', 'fix all', 'complete system', 'comprehensive',
      'multiple files', 'full implementation', 'end-to-end', 'build entire',
      'create complete', 'full website', 'entire application', 'complex system',
      'large scale', 'multi-agent', 'collaboration', 'fix everything'
    ];
    
    const hasHighComplexity = complexityIndicators.some(indicator => 
      userMessage.toLowerCase().includes(indicator)
    );
    
    // Scale tokens based on complexity - prevent excessive usage
    if (hasHighComplexity) {
      console.log(`🧠 COMPLEX TASK DETECTED: Scaling to 32k tokens for comprehensive work`);
      return 32000; // Full scaling for complex tasks only when needed
    }
    
    // Standard complexity detection
    const standardComplexityIndicators = [
      'analyze', 'implement', 'create', 'build', 'fix', 'update', 'modify',
      'generate', 'write', 'develop', 'configure', 'setup', 'install'
    ];
    
    const hasStandardComplexity = standardComplexityIndicators.some(indicator =>
      userMessage.toLowerCase().includes(indicator)
    );
    
    if (hasStandardComplexity) {
      console.log(`🧠 STANDARD TASK DETECTED: Using 8k tokens for ${agentName}`);
      return 8000; // Standard task complexity
    }
    
    console.log(`🧠 SIMPLE TASK DETECTED: Using 4k tokens for ${agentName}`);
    return 4000; // Simple conversations and basic questions
  }

  /**
   * STREAMING MESSAGE HANDLER WITH TOKEN OPTIMIZATION
   */
  async sendStreamingMessage(
    userId: string,
    agentName: string,
    conversationId: string,
    message: string,
    systemPrompt: string,
    tools: any[],
    res: any
  ): Promise<void> {
    try {
      // Load conversation history
      const conversation = await this.createConversationIfNotExists(userId, agentName, conversationId);
      const messages = await this.loadConversationMessages(conversationId);
      
      // INTELLIGENT TOKEN OPTIMIZATION: Scale tokens based on task complexity
      const optimalTokens = this.getOptimalTokenLimit(message, agentName);
      
      // Prepare Claude API request with streaming enabled
      const claudeMessages = [
        ...messages.map((msg: any) => ({
          role: msg.role === 'agent' ? 'assistant' : msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      console.log(`🌊 STREAMING: Starting Claude API stream for ${agentName} with ${optimalTokens} tokens`);
      
      // Send to Claude API with optimized token usage
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: optimalTokens,
        messages: claudeMessages as any,
        system: systemPrompt,
        tools: tools,
        stream: false
      });

      let fullResponse = '';
      
      // Process Claude response
      if (response.content && Array.isArray(response.content)) {
        for (const block of response.content) {
          if (block.type === 'text') {
            fullResponse += block.text;
            res.write(`data: ${JSON.stringify({
              type: 'text_delta',
              content: block.text
            })}\n\n`);
          } else if (block.type === 'tool_use') {
            // Handle tool execution here
            console.log(`🔧 Tool execution: ${block.name}`);
            res.write(`data: ${JSON.stringify({
              type: 'tool_start',
              toolName: block.name
            })}\n\n`);
          }
        }
      }
      
      // Save conversation to database
      await this.saveMessage(conversationId, 'user', message);
      await this.saveMessage(conversationId, 'assistant', fullResponse);
      
      console.log(`✅ STREAMING: Completed for ${agentName} (${fullResponse.length} chars) with ${optimalTokens} tokens`);
      
    } catch (error) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({
        type: 'stream_error',
        message: 'Streaming failed'
      })}\n\n`);
    }
  }

  /**
   * CONVERSATION MANAGEMENT
   */
  private async createConversationIfNotExists(userId: string, agentName: string, conversationId: string) {
    try {
      // Check if conversation exists by conversationId field (not the id primary key)
      const existing = await db
        .select()
        .from(claudeConversations)
        .where(eq(claudeConversations.conversationId, conversationId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(claudeConversations).values({
          userId: userId,
          agentName: agentName,
          conversationId: conversationId, // Use the conversationId field
          title: `${agentName} conversation`,
          status: 'active',
          lastMessageAt: new Date(),
          messageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return conversationId; // Return original conversationId
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  private async loadConversationMessages(conversationId: string) {
    try {
      const messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, conversationId))
        .orderBy(desc(claudeMessages.timestamp))
        .limit(10);

      return messages.reverse();
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  private async saveMessage(conversationId: string, role: string, content: string) {
    try {
      await db.insert(claudeMessages).values({
        conversationId,
        role,
        content,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }
}

export const claudeApiServiceWorking = new ClaudeApiServiceWorking();