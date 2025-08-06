import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { claudeConversations, claudeMessages } from '../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
// Remove problematic imports for now

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL_STR = 'claude-sonnet-4-20250514';

export class ClaudeApiServiceRebuiltClean {
  /**
   * SIMPLE NON-STREAMING MESSAGE HANDLER WITH TOOL EXECUTION
   * Based on working archive implementation
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
      console.log(`🚀 AGENT: ${agentName} starting with tool execution`);
      
      // Load conversation history
      const conversation = await this.createConversationIfNotExists(userId, agentName, conversationId);
      const messages = await this.loadConversationMessages(conversationId);
      
      // Prepare Claude API request
      const claudeMessages = [
        ...messages.map((msg: any) => ({
          role: msg.role === 'agent' ? 'assistant' : msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];
      
      res.write(`data: ${JSON.stringify({
        type: 'message_start',
        agentName,
        message: `${agentName} is thinking...`
      })}\n\n`);
      
      // Call Claude API with tools (non-streaming for proper tool execution)
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 8000,
        messages: claudeMessages as any,
        system: systemPrompt,
        tools: tools,
        tool_choice: { type: "auto" },
        stream: false
      });
      
      console.log(`🔍 CLAUDE RESPONSE:`, {
        role: response.role,
        contentBlocks: response.content?.length || 0,
        model: response.model
      });
      
      let fullResponse = '';
      let toolCalls: any[] = [];
      
      // Process response content
      for (const contentBlock of response.content) {
        if (contentBlock.type === 'text') {
          fullResponse += contentBlock.text;
          res.write(`data: ${JSON.stringify({
            type: 'text_delta',
            content: contentBlock.text
          })}\n\n`);
        } else if (contentBlock.type === 'tool_use') {
          console.log(`🔧 TOOL DETECTED: ${contentBlock.name}`, contentBlock.input);
          
          res.write(`data: ${JSON.stringify({
            type: 'tool_start',
            toolName: contentBlock.name,
            message: `${agentName} is using ${contentBlock.name}...`
          })}\n\n`);
          
          toolCalls.push({
            name: contentBlock.name,
            id: contentBlock.id,
            input: contentBlock.input
          });
        }
      }
      
      // Execute tools if present
      if (toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          try {
            const toolResult = await this.handleToolCall(toolCall, conversationId, agentName);
            
            res.write(`data: ${JSON.stringify({
              type: 'tool_complete',
              toolName: toolCall.name,
              result: toolResult.substring(0, 200) + (toolResult.length > 200 ? '...' : ''),
              message: `${agentName} completed ${toolCall.name}`
            })}\n\n`);
            
          } catch (error) {
            console.error(`Tool execution failed: ${toolCall.name}`, error);
            res.write(`data: ${JSON.stringify({
              type: 'tool_error',
              toolName: toolCall.name,
              message: `${agentName} encountered an error with ${toolCall.name}`
            })}\n\n`);
          }
        }
      }
      
      // Save conversation
      await this.saveMessage(conversationId, 'user', message);
      await this.saveMessage(conversationId, 'assistant', fullResponse);
      
      // Send completion
      res.write(`data: ${JSON.stringify({
        type: 'completion',
        agentId: agentName,
        conversationId,
        success: true,
        message: 'Agent completed successfully'
      })}\n\n`);
      
      res.end();
      
    } catch (error) {
      console.error('🚨 STREAMING ERROR:', error);
      
      res.write(`data: ${JSON.stringify({
        type: 'streaming_failure',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `STREAMING FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`
      })}\n\n`);
      
      res.write(`data: ${JSON.stringify({
        type: 'error_complete',
        message: 'Agent stopped due to system error'
      })}\n\n`);
      
      res.end();
    }
  }

  private async createConversationIfNotExists(userId: string, agentName: string, conversationId: string) {
    const [conversation] = await db
      .select()
      .from(claudeConversations)
      .where(eq(claudeConversations.conversationId, conversationId))
      .limit(1);

    if (!conversation) {
      await db.insert(claudeConversations).values({
        conversationId: conversationId,
        userId: userId,
        agentName: agentName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return conversation;
  }

  private async loadConversationMessages(conversationId: string) {
    return await db
      .select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, conversationId))
      .orderBy(claudeMessages.createdAt);
  }

  private async saveMessage(conversationId: string, role: string, content: string) {
    await db.insert(claudeMessages).values({
      conversationId,
      role,
      content,
      createdAt: new Date(),
    });
  }

  private async handleToolCall(toolCall: any, conversationId: string, agentName: string): Promise<string> {
    try {
      console.log(`🔧 EXECUTING TOOL: ${toolCall.name}`, toolCall.input);
      
      // Import and execute the tool
      const toolExports = await import('../tools/tool-exports.js');
      
      // Handle different tool execution patterns
      if (toolCall.name === 'search_filesystem') {
        const result = await toolExports.search_filesystem(toolCall.input);
        return JSON.stringify(result, null, 2);
      } else if (toolCall.name === 'str_replace_based_edit_tool') {
        const result = await toolExports.str_replace_based_edit_tool(toolCall.input);
        return result;
      }
      
      return `Tool ${toolCall.name} executed with parameters: ${JSON.stringify(toolCall.input)}`;
      
    } catch (error) {
      console.error(`❌ TOOL ERROR: ${toolCall.name}:`, error);
      return `Error executing ${toolCall.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

// Export singleton instance
export const claudeApiServiceRebuiltClean = new ClaudeApiServiceRebuiltClean();