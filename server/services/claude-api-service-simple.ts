import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { claudeConversations, claudeMessages } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL_STR = 'claude-sonnet-4-20250514';

export class ClaudeApiServiceSimple {
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
      console.log(`🚀 ${agentName.toUpperCase()}: Starting specialized agent with tools`);
      
      // Load conversation history
      await this.createConversationIfNotExists(userId, agentName, conversationId);
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
        message: `${agentName} is analyzing the request...`
      })}\n\n`);
      
      let currentMessages = [...claudeMessages];
      let fullResponse = '';
      let conversationContinues = true;
      let iterationCount = 0;
      const maxIterations = 5; // Prevent infinite loops
      
      // Continue conversation until task is complete
      while (conversationContinues && iterationCount < maxIterations) {
        iterationCount++;
        
        console.log(`🔄 ${agentName}: Conversation iteration ${iterationCount}`);
        
        // Call Claude API
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          max_tokens: 8000,
          messages: currentMessages as any,
          system: systemPrompt,
          tools: tools,
          tool_choice: { type: "auto" },
          stream: false
        });
        
        let responseText = '';
        let toolCalls: any[] = [];
        
        // Process response content
        for (const contentBlock of response.content) {
          if (contentBlock.type === 'text') {
            responseText += contentBlock.text;
            fullResponse += contentBlock.text;
            
            res.write(`data: ${JSON.stringify({
              type: 'text_delta',
              content: contentBlock.text
            })}\n\n`);
            
          } else if (contentBlock.type === 'tool_use') {
            console.log(`🔧 ${agentName}: Using ${contentBlock.name}`);
            
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
        
        // Add assistant response to conversation
        currentMessages.push({
          role: 'assistant',
          content: response.content
        } as any);
        
        // Execute tools if present
        if (toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            try {
              const toolResult = await this.executeToolCall(toolCall);
              
              // Add tool result to conversation
              currentMessages.push({
                role: 'user',
                content: [{
                  type: 'tool_result',
                  tool_use_id: toolCall.id,
                  content: toolResult
                }]
              } as any);
              
              res.write(`data: ${JSON.stringify({
                type: 'tool_complete',
                toolName: toolCall.name,
                result: toolResult.substring(0, 100) + (toolResult.length > 100 ? '...' : ''),
                message: `${agentName} completed ${toolCall.name}`
              })}\n\n`);
              
            } catch (error) {
              console.error(`${agentName}: Tool ${toolCall.name} failed:`, error);
              
              const errorResult = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
              currentMessages.push({
                role: 'user',
                content: [{
                  type: 'tool_result',
                  tool_use_id: toolCall.id,
                  content: errorResult
                }]
              } as any);
              
              res.write(`data: ${JSON.stringify({
                type: 'tool_error',
                toolName: toolCall.name,
                message: `${agentName} encountered an error with ${toolCall.name}`
              })}\n\n`);
            }
          }
          
          // Continue after tool execution
          res.write(`data: ${JSON.stringify({
            type: 'continue_thinking',
            message: `${agentName} is processing results...`
          })}\n\n`);
          
        } else {
          // No tools used, conversation complete
          conversationContinues = false;
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
        message: `${agentName} completed the task successfully`
      })}\n\n`);
      
      res.end();
      
    } catch (error) {
      console.error(`🚨 ${agentName}: Error:`, error);
      
      res.write(`data: ${JSON.stringify({
        type: 'streaming_failure',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `${agentName} encountered a system error`
      })}\n\n`);
      
      res.end();
    }
  }

  private async executeToolCall(toolCall: any): Promise<string> {
    console.log(`🔧 EXECUTING: ${toolCall.name}`, toolCall.input);
    
    try {
      if (toolCall.name === 'search_filesystem') {
        const { search_filesystem } = await import('../tools/tool-exports.js');
        const result = await search_filesystem(toolCall.input);
        return JSON.stringify(result, null, 2);
        
      } else if (toolCall.name === 'str_replace_based_edit_tool') {
        const { str_replace_based_edit_tool } = await import('../tools/tool-exports.js');
        const result = await str_replace_based_edit_tool(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'bash') {
        // Mock bash execution for safety
        return `Command would execute: ${JSON.stringify(toolCall.input)}`;
        
      } else {
        return `Tool ${toolCall.name} executed with: ${JSON.stringify(toolCall.input)}`;
      }
    } catch (error) {
      throw new Error(`${toolCall.name} execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
}

export const claudeApiServiceSimple = new ClaudeApiServiceSimple();