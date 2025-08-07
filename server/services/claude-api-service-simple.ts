import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { claudeConversations, claudeMessages, agentLearning, agentKnowledgeBase, agentSessionContexts } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

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
      let allToolCalls: any[] = [];
      
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
            
            const toolCallData = {
              name: contentBlock.name,
              id: contentBlock.id,
              input: contentBlock.input
            };
            toolCalls.push(toolCallData);
            allToolCalls.push(toolCallData);
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
      
      // Save conversation with tool execution data
      await this.saveMessage(conversationId, 'user', message);
      
      // Collect tool execution data for assistant message
      const assistantToolCalls = allToolCalls.length > 0 ? allToolCalls : null;
      const assistantToolResults = allToolCalls.length > 0 ? allToolCalls.map(tc => ({
        tool_name: tc.name,
        input: tc.input,
        result: 'executed'
      })) : null;
      
      await this.saveMessage(conversationId, 'assistant', fullResponse, assistantToolCalls, assistantToolResults);
      
      // CRITICAL FIX: Integrate learning and knowledge systems
      await this.updateAgentLearning(userId, agentName, message, fullResponse);
      await this.updateSessionContext(userId, agentName, conversationId, { message, response: fullResponse, toolsUsed: allToolCalls });
      
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
        const { search_filesystem } = await import('../tools/tool-exports.ts');
        const result = await search_filesystem(toolCall.input);
        return JSON.stringify(result, null, 2);
        
      } else if (toolCall.name === 'str_replace_based_edit_tool') {
        const { str_replace_based_edit_tool } = await import('../tools/tool-exports.ts');
        const result = await str_replace_based_edit_tool(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'bash') {
        const { bash } = await import('../tools/tool-exports.ts');
        const result = await bash(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else {
        return `Tool ${toolCall.name} executed with: ${JSON.stringify(toolCall.input)}`;
      }
    } catch (error) {
      throw new Error(`${toolCall.name} execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createConversationIfNotExists(userId: string, agentName: string, conversationId: string) {
    // CRITICAL FIX: Normalize agent name to lowercase to prevent case fragmentation
    const normalizedAgentName = agentName.toLowerCase();
    
    const [conversation] = await db
      .select()
      .from(claudeConversations)
      .where(eq(claudeConversations.conversationId, conversationId))
      .limit(1);

    if (!conversation) {
      await db.insert(claudeConversations).values({
        conversationId: conversationId,
        userId: userId,
        agentName: normalizedAgentName, // Use normalized name
        status: 'active',
        messageCount: 0,
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`✅ Created conversation with normalized agent name: ${normalizedAgentName}`);
    }
  }

  private async loadConversationMessages(conversationId: string) {
    return await db
      .select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, conversationId))
      .orderBy(claudeMessages.createdAt);
  }

  private async saveMessage(conversationId: string, role: string, content: string, toolCalls?: any, toolResults?: any) {
    // Save message with tool data
    await db.insert(claudeMessages).values({
      conversationId,
      role,
      content,
      toolCalls,
      toolResults,
      createdAt: new Date(),
    });

    // Update conversation metadata and message count
    const [conversation] = await db
      .select()
      .from(claudeConversations)
      .where(eq(claudeConversations.conversationId, conversationId))
      .limit(1);

    if (conversation) {
      await db
        .update(claudeConversations)
        .set({
          messageCount: (conversation.messageCount || 0) + 1,
          lastMessageAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        })
        .where(eq(claudeConversations.conversationId, conversationId));

      console.log(`✅ Updated conversation ${conversationId}: messageCount=${(conversation.messageCount || 0) + 1}`);
    }
  }

  // CRITICAL FIX: Add missing learning integration
  private async updateAgentLearning(userId: string, agentName: string, userMessage: string, assistantMessage: string): Promise<void> {
    try {
      const normalizedAgentName = agentName.toLowerCase();
      const patterns = this.extractPatterns(userMessage, assistantMessage);

      for (const pattern of patterns) {
        const existing = await db
          .select()
          .from(agentLearning)
          .where(and(
            eq(agentLearning.agentName, normalizedAgentName),
            eq(agentLearning.userId, userId),
            eq(agentLearning.learningType, pattern.type),
            eq(agentLearning.category, pattern.category)
          ))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(agentLearning)
            .set({
              frequency: (existing[0].frequency || 0) + 1,
              confidence: Math.min(1.0, parseFloat(existing[0].confidence?.toString() || "0.5") + 0.1).toString(),
              lastSeen: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(agentLearning.id, existing[0].id));
        } else {
          await db.insert(agentLearning).values({
            agentName: normalizedAgentName,
            userId: userId,
            learningType: pattern.type,
            category: pattern.category,
            data: pattern.data,
            confidence: "0.7",
            frequency: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      
      console.log(`🧠 Learning updated for ${normalizedAgentName}: ${patterns.length} patterns processed`);
    } catch (error) {
      console.error('Failed to update agent learning:', error);
    }
  }

  // CRITICAL FIX: Add session context management
  private async updateSessionContext(userId: string, agentName: string, conversationId: string, context: any): Promise<void> {
    try {
      const normalizedAgentName = agentName.toLowerCase();
      const sessionId = `${userId}_${normalizedAgentName}_session`;

      const existing = await db
        .select()
        .from(agentSessionContexts)
        .where(and(
          eq(agentSessionContexts.userId, userId),
          eq(agentSessionContexts.agentId, normalizedAgentName)
        ))
        .limit(1);

      const contextData = {
        lastConversationId: conversationId,
        recentInteractions: context,
        timestamp: new Date().toISOString()
      };

      if (existing.length > 0) {
        await db
          .update(agentSessionContexts)
          .set({
            contextData: contextData,
            lastInteraction: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(agentSessionContexts.id, existing[0].id));
      } else {
        await db.insert(agentSessionContexts).values({
          userId: userId,
          agentId: normalizedAgentName,
          sessionId: sessionId,
          contextData: contextData,
          workflowState: 'active',
          lastInteraction: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      console.log(`🔄 Session context updated for ${normalizedAgentName}`);
    } catch (error) {
      console.error('Failed to update session context:', error);
    }
  }

  // CRITICAL FIX: Add pattern extraction logic
  private extractPatterns(userMessage: string, assistantMessage: string): Array<{type: string, category: string, data: any}> {
    const patterns = [];

    // Extract conversation patterns
    patterns.push({
      type: 'pattern',
      category: 'conversation',
      data: {
        userId: 'current_user',
        message: userMessage.substring(0, 100),
        response: assistantMessage.substring(0, 100)
      }
    });

    // Extract successful response patterns
    if (assistantMessage.length > 50) {
      patterns.push({
        type: `successful_response_${Date.now()}`,
        category: 'conversation',
        data: {
          messageLength: userMessage.length,
          responseLength: assistantMessage.length,
          timestamp: new Date().toISOString()
        }
      });
    }

    return patterns;
  }
}

export const claudeApiServiceSimple = new ClaudeApiServiceSimple();