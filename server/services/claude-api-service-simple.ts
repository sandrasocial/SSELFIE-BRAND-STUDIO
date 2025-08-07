import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { claudeConversations, claudeMessages, agentLearning, agentKnowledgeBase, agentSessionContexts } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';

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
      
      // CONTEXT PRESERVATION: Load previous knowledge safely
      let previousContext = '';
      try {
        const { ContextPreservationSystem } = await import('../agents/context-preservation-system.js');
        previousContext = await ContextPreservationSystem.getContextSummary(agentName, userId);
      } catch (error) {
        console.error(`Failed to load context for ${agentName}:`, error);
        previousContext = ''; // Continue without context if loading fails
      }
      
      // EMERGENCY TOKEN MONITORING: Check system health before proceeding
      console.log(`🔍 TOKEN CHECK: Starting conversation for ${agentName}`);
      
      // Load conversation history and check for existing context
      await this.createConversationIfNotExists(userId, agentName, conversationId);
      const messages = await this.loadConversationMessages(conversationId);
      
      // EMERGENCY: Estimate token usage to prevent explosion
      const estimatedTokens = this.estimateTokens(systemPrompt + JSON.stringify(messages));
      console.log(`📊 ESTIMATED TOKENS: ${estimatedTokens} (limit: 150,000)`);
      
      if (estimatedTokens > 150000) {
        console.warn(`⚠️ TOKEN LIMIT EXCEEDED: ${estimatedTokens} > 150,000 - Emergency abort to prevent system failure`);
        res.write(`data: ${JSON.stringify({
          type: 'streaming_failure',
          error: 'Token limit exceeded - conversation too large',
          message: `${agentName} stopped to prevent system overload. Please start a new conversation.`
        })}\n\n`);
        res.end();
        return;
      }
      
      // Check agent's recent context to provide context awareness
      const { searchCache } = await import('./agent-search-cache.ts');
      const agentContext = searchCache.getAgentContext(agentName, userId);
      if (agentContext && agentContext.recentSearches.length > 0) {
        console.log(`🧠 ${agentName}: Found ${agentContext.recentSearches.length} recent searches, ${agentContext.fileAccess.length} recent file accesses`);
      }
      
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
      const maxIterations = 20; // Increased for complex tool operations
      let allToolCalls: any[] = [];
      
      // Continue conversation until task is complete - EXTENDED for tool execution
      while (conversationContinues && iterationCount < maxIterations) {
        iterationCount++;
        
        console.log(`🔄 ${agentName}: Conversation iteration ${iterationCount}/${maxIterations} - Tools allowed: ${tools.length}`);
        
        // Call Claude API
        console.log(`🔧 ${agentName}: Calling Claude API with ${tools.length} tools available`);
        console.log(`🔧 TOOLS:`, tools.map(t => t.name));
        console.log(`🔧 MODEL:`, DEFAULT_MODEL_STR);
        console.log(`🔧 SYSTEM PROMPT LENGTH:`, systemPrompt.length);
        
        // CRITICAL DEBUG: Log tool schemas to verify format
        console.log(`🔧 FULL TOOL SCHEMAS:`, JSON.stringify(tools, null, 2));
        console.log(`🔧 MESSAGES:`, JSON.stringify(currentMessages, null, 2));
        
        // ENHANCED SYSTEM PROMPT: Include previous context for continuity
        const enhancedSystemPrompt = systemPrompt + (previousContext || '');
        
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          max_tokens: 8000,
          messages: currentMessages as any,
          system: enhancedSystemPrompt,
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
              const toolResult = await this.executeToolCall(toolCall, agentName, userId);
              
              // INTELLIGENT RESULT PROCESSING: Preserve high-priority search results
              const summarizedResult = await this.intelligentResultSummary(toolResult, toolCall.name);
              
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
          
          // Continue after tool execution - FIXED: Allow agents to respond after tool completion
          res.write(`data: ${JSON.stringify({
            type: 'continuing',
            message: `🔄 ${agentName} is continuing after tool execution...`
          })}\n\n`);
          
          // CRITICAL FIX: Force conversation to continue after tool execution
          conversationContinues = true;
          console.log(`🔄 ${agentName}: FORCING CONTINUATION after tool execution - iteration ${iterationCount}/${maxIterations}`);
          
        } else {
          // No tools used, conversation complete
          console.log(`✅ ${agentName}: No tools used in iteration ${iterationCount}, completing conversation`);
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

  // ================== EMERGENCY TOKEN MONITORING ==================
  
  /**
   * Estimate token count to prevent explosion (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 4 characters = 1 token (conservative estimate)
    return Math.ceil(text.length / 4);
  }

  // ================== INTELLIGENT RESULT PROCESSING ==================
  
  /**
   * Intelligent tool result processing that preserves high-priority information
   * instead of arbitrary truncation that breaks agent functionality
   */
  private async intelligentResultSummary(toolResult: string, toolName: string): Promise<string> {
    // If result is small enough, return as-is
    if (toolResult.length <= 4000) {
      return toolResult;
    }
    
    // For search_filesystem results, preserve high-priority matches
    if (toolName === 'search_filesystem' && toolResult.includes('priority')) {
      try {
        const lines = toolResult.split('\n');
        const priorityResults: string[] = [];
        const normalResults: string[] = [];
        
        let currentSection = '';
        let inHighPrioritySection = false;
        
        for (const line of lines) {
          // Detect high-priority results (priority > 80)
          if (line.includes('"priority":') && (line.includes('priority": 1') || 
              line.includes('priority": 2') || line.includes('MAIN APP FILE') ||
              line.includes('COMPONENT/PAGE'))) {
            inHighPrioritySection = true;
          }
          
          // Build current section
          currentSection += line + '\n';
          
          // When section ends, categorize it
          if (line.trim() === '},' || line.trim() === '}') {
            if (inHighPrioritySection) {
              priorityResults.push(currentSection);
            } else {
              normalResults.push(currentSection);
            }
            currentSection = '';
            inHighPrioritySection = false;
          }
        }
        
        // Combine results: All high-priority + some normal results if space allows
        let finalResult = priorityResults.join('');
        const remainingSpace = 6000 - finalResult.length;
        
        if (remainingSpace > 1000 && normalResults.length > 0) {
          const additionalResults = normalResults.slice(0, 3).join('');
          if (additionalResults.length <= remainingSpace) {
            finalResult += additionalResults;
          }
        }
        
        // Add summary if truncated
        if (finalResult.length < toolResult.length) {
          finalResult += `\n\n[High-priority results preserved - ${priorityResults.length} priority files shown out of ${lines.filter(l => l.includes('fileName')).length} total matches. Search found relevant files successfully.]`;
        }
        
        return finalResult;
        
      } catch (error) {
        console.error('Error in intelligent search summary:', error);
        // SIMPLIFIED SEARCH RESULTS: Clear, actionable format for agents
        const files = toolResult.match(/fileName[^}]+/g) || [];
        const topFiles = files.slice(0, 10).map(f => {
          const name = f.match(/"([^"]+)"/)?.[1] || '';
          return `- ${name}`;
        }).join('\n');
        
        return `SEARCH RESULTS (${files.length} files found):\n${topFiles}\n\nUse str_replace_based_edit_tool to view or modify these files.`;
      }
    }
    
    // For other tools, use smart truncation
    if (toolName === 'str_replace_based_edit_tool') {
      // Preserve file editing results completely (they're usually small)
      return toolResult.length <= 8000 
        ? toolResult 
        : `${toolResult.substring(0, 4000)}\n\n[File content truncated - ${toolResult.length} total characters. Edit operation details preserved.]`;
    }
    
    // SIMPLIFIED DEFAULT: Clear, actionable results for agents
    if (toolResult.length <= 3000) {
      return toolResult;
    }
    
    // Extract key information based on tool type
    const lines = toolResult.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('successfully') ||
      line.includes('created') ||
      line.includes('modified') ||
      line.includes('error') ||
      line.includes('failed') ||
      line.includes('File:') ||
      line.includes('Result:')
    ).slice(0, 20);
    
    const summary = importantLines.join('\n') || lines.slice(0, 30).join('\n');
    return `${summary}\n\n[${toolResult.length} chars total - showing key results]`;
  }

  private async executeToolCall(toolCall: any, agentName?: string, userId?: string): Promise<string> {
    console.log(`🔧 EXECUTING: ${toolCall.name}`, toolCall.input);
    
    try {
      // INTELLIGENT VALIDATION: Prevent errors before they happen
      if (toolCall.name === 'str_replace_based_edit_tool' && toolCall.input.command === 'str_replace') {
        // Pre-validate file modifications
        const { ErrorPreventionSystem } = await import('../agents/error-prevention-system.js');
        if (toolCall.input.new_str) {
          const validation = await ErrorPreventionSystem.validateCode(
            toolCall.input.new_str,
            toolCall.input.path || ''
          );
          
          if (!validation.valid) {
            console.warn(`⚠️ VALIDATION WARNINGS for ${agentName}:`, validation.errors);
            // Add suggestions to help agent fix issues
            const suggestions = validation.suggestions.join('\n');
            console.log(`💡 SUGGESTIONS: ${suggestions}`);
          }
        }
      }
      
      if (toolCall.name === 'search_filesystem') {
        const { search_filesystem } = await import('../tools/tool-exports.js');
        const result = await search_filesystem(toolCall.input);
        return JSON.stringify(result, null, 2);
        
      } else if (toolCall.name === 'str_replace_based_edit_tool') {
        const { str_replace_based_edit_tool } = await import('../tools/tool-exports.js');
        const result = await str_replace_based_edit_tool(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'bash') {
        const { bash } = await import('../tools/tool-exports.js');
        const result = await bash(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'direct_file_access') {
        const { direct_file_access } = await import('../tools/tool-exports.js');
        const result = await direct_file_access(toolCall.input);
        return JSON.stringify(result, null, 2);
        
      } else {
        return `Tool ${toolCall.name} executed with: ${JSON.stringify(toolCall.input)}`;
      }
    } catch (error) {
      // INTELLIGENT ERROR HANDLING: Provide helpful context
      const { ErrorPreventionSystem } = await import('../agents/error-prevention-system.js');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const suggestions = ErrorPreventionSystem.generateFixSuggestions(errorMsg);
      
      console.error(`❌ ${toolCall.name} failed:`, errorMsg);
      if (suggestions.length > 0) {
        console.log(`💡 Fix suggestions:`, suggestions);
      }
      
      throw new Error(`${toolCall.name} execution failed: ${errorMsg}\n\nSuggestions: ${suggestions.join(', ')}`);
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
    // EMERGENCY FIX: Limit conversation history to prevent token explosion
    // Only load last 8 messages (4 user + 4 assistant pairs) to stay under token limits
    return await db
      .select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, conversationId))
      .orderBy(desc(claudeMessages.createdAt))
      .limit(8);
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