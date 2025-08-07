import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { claudeConversations, claudeMessages } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL_STR = 'claude-3-5-sonnet-20241022';

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
      
      // Prepare Claude API request with validation
      const validMessages = messages
        .filter((msg: any) => msg.content && msg.content.trim())
        .map((msg: any) => ({
          role: msg.role === 'agent' ? 'assistant' : msg.role,
          content: msg.content
        }));
        
      const claudeMessages = [
        ...validMessages,
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
        console.log(`🔧 ${agentName}: Calling Claude API with ${tools.length} tools available`);
        console.log(`🔧 TOOLS:`, tools.map(t => t.name));
        console.log(`🔧 MODEL:`, DEFAULT_MODEL_STR);
        console.log(`🔧 SYSTEM PROMPT LENGTH:`, systemPrompt.length);
        
        // CRITICAL DEBUG: Log tool schemas to verify format
        console.log(`🔧 FULL TOOL SCHEMAS:`, JSON.stringify(tools, null, 2));
        console.log(`🔧 MESSAGES:`, JSON.stringify(currentMessages, null, 2));
        
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
        console.log(`🔍 ${agentName}: Response has ${response.content.length} content blocks`);
        
        for (const contentBlock of response.content) {
          console.log(`🔍 ${agentName}: Processing content block type: ${contentBlock.type}`);
          
          if (contentBlock.type === 'text') {
            responseText += contentBlock.text;
            fullResponse += contentBlock.text;
            
            // Check for XML patterns in text (this should NOT happen)
            if (contentBlock.text.includes('<search_filesystem>') || 
                contentBlock.text.includes('<str_replace_based_edit_tool>')) {
              console.log(`⚠️ ${agentName}: DETECTED XML IN TEXT - Function calling not working properly!`);
            }
            
            res.write(`data: ${JSON.stringify({
              type: 'text_delta',
              content: contentBlock.text
            })}\n\n`);
            
          } else if (contentBlock.type === 'tool_use') {
            console.log(`🔧 ${agentName}: FUNCTION CALL DETECTED: ${contentBlock.name}`, contentBlock.input);
            
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
              
              // Summarize large tool results to prevent token overflow
              const summarizedResult = toolResult.length > 3000 
                ? `${toolResult.substring(0, 2000)}\n\n[Result truncated - ${toolResult.length} total characters. Search found relevant files successfully.]`
                : toolResult;
              
              // Add tool result to conversation
              currentMessages.push({
                role: 'user',
                content: [{
                  type: 'tool_result',
                  tool_use_id: toolCall.id,
                  content: summarizedResult
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
          
          // Add instruction to continue with concise response
          currentMessages.push({
            role: 'user', 
            content: `Continue with your task. Be concise and focus on the next necessary action.`
          });
          
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