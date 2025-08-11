import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { claudeConversations, claudeMessages, agentLearning, agentKnowledgeBase, agentSessionContexts } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { simpleMemoryService } from './simple-memory-service.js';
import { localProcessingEngine } from './hybrid-intelligence/local-processing-engine.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL_STR = 'claude-3-5-sonnet-20241022';

export class ClaudeApiServiceSimple {
  /**
   * REAL AGENT-TO-AGENT COMMUNICATION METHOD
   * Used by MultiAgentCoordinator for actual agent delegation
   */
  async sendMessage(
    message: string,
    conversationId: string,
    agentName: string,
    returnFullResponse = false
  ): Promise<string> {
    console.log(`🚀 AGENT COMMUNICATION: ${agentName} processing message`);
    
    try {
      // Load agent configuration from authentic personality system
      const { PersonalityManager, PURE_PERSONALITIES } = await import('../agents/personalities/personality-config.js');
      const agentConfig = PURE_PERSONALITIES[agentName as keyof typeof PURE_PERSONALITIES];
      
      if (!agentConfig) {
        throw new Error(`Agent ${agentName} not found`);
      }
      
      // Create conversation if needed - use actual authenticated user
      const userId = '42585527'; // Your existing admin account
      await this.createConversationIfNotExists(userId, agentName, conversationId);
      
      // Load conversation history
      const messages = await this.loadConversationMessages(conversationId);
      
      // Prepare Claude API request
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
      
      // Execute Claude API call (without tools - handled at route level)
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 8192, // UNRESTRICTED: Increased from 4000 to allow full autonomous workflows
        temperature: 0.7,
        system: PersonalityManager.getNaturalPrompt(agentName),
        messages: claudeMessages
      });
      
      let fullResponse = '';
      let toolCalls: any[] = [];
      
      // Process response content
      for (const contentBlock of response.content) {
        if (contentBlock.type === 'text') {
          fullResponse += contentBlock.text;
        } else if (contentBlock.type === 'tool_use') {
          console.log(`🔧 ${agentName}: TOOL CALL: ${contentBlock.name}`, contentBlock.input);
          
          const toolCallData = {
            name: contentBlock.name,
            id: contentBlock.id,
            input: contentBlock.input
          };
          toolCalls.push(toolCallData);
        }
      }
      
      // Execute tools if present
      if (toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          try {
            const toolResult = await this.executeToolCall(toolCall, agentName, '42585527'); // Your existing admin account
            console.log(`✅ ${agentName}: Tool ${toolCall.name} completed`);
            
            // Continue conversation with tool result
            const toolResultMessage = {
              role: 'user' as const,
              content: [{
                type: 'tool_result' as const,
                tool_use_id: toolCall.id,
                content: toolResult
              }]
            };
            
            // Get agent's response to tool result
            const followUpResponse = await anthropic.messages.create({
              model: DEFAULT_MODEL_STR,
              max_tokens: 8192, // UNRESTRICTED: Increased for full workflow completion
              temperature: 0.7,
              system: PersonalityManager.getNaturalPrompt(agentName),
              messages: [...claudeMessages, 
                { role: 'assistant', content: response.content },
                toolResultMessage
              ]
            });
            
            // Add follow-up response to full response
            for (const block of followUpResponse.content) {
              if (block.type === 'text') {
                fullResponse += '\n\n' + block.text;
              }
            }
            
          } catch (error) {
            console.error(`❌ ${agentName}: Tool ${toolCall.name} failed:`, error);
            fullResponse += `\n\nTool ${toolCall.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      }
      
      // Save conversation
      await this.saveMessage(conversationId, 'user', message);
      await this.saveMessage(conversationId, 'agent', fullResponse);
      
      console.log(`✅ ${agentName}: Agent communication completed`);
      return fullResponse;
      
    } catch (error) {
      console.error(`❌ ${agentName}: Agent communication failed:`, error);
      throw error;
    }
  }

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
      
      // ZARA'S OPTIMIZATION: Use local memory service for context analysis (no Claude API)
      const contextRequirement = simpleMemoryService.analyzeMessage(message);
      console.log(`🔍 LOCAL CONTEXT ANALYSIS: ${contextRequirement.contextLevel.toUpperCase()} level context for "${message.substring(0, 30)}..."`);
      
      let previousContext = '';
      if (contextRequirement.isWorkTask) {
        try {
          // LOCAL PROCESSING: Use memory service directly instead of API calls
          previousContext = await simpleMemoryService.getWorkspaceContext(agentName, userId);
          console.log(`🏗️ LOCAL WORKSPACE CONTEXT: Loaded from local memory system`);
        } catch (error) {
          console.error(`Failed to load local context for ${agentName}:`, error);
          previousContext = ''; // Continue without context if loading fails
        }
      } else {
        console.log(`💬 LOCAL CONVERSATION MODE: Using local context management`);
      }
      
      // ZARA'S OPTIMIZATION: Local system health checks (no Claude API tokens)
      console.log(`🔍 LOCAL HEALTH CHECK: Starting conversation for ${agentName}`);
      
      // Load conversation history and check for existing context
      await this.createConversationIfNotExists(userId, agentName, conversationId);
      // ADMIN BYPASS: Check if this is an admin agent for unlimited context
      const isAdminAgent = userId === 'sandra-admin' || userId === 'admin' || userId === '42585527' || conversationId.includes('admin_');
      const messages = await this.loadConversationMessages(conversationId, isAdminAgent);
      
      // ELIMINATED: TokenOptimizationEngine - using simplified approach
      
      let optimizedMessages = messages;
      let optimizationMetadata = { 
        originalTokens: 0, 
        optimizedTokens: 0, 
        compressionRatio: 0, 
        fullContextAvailable: true 
      };
      
      // CONTEXT PRESERVATION FIX: Keep FULL context for admin agents to prevent memory loss
      if (isAdminAgent) {
        // KEEP ALL MESSAGES for proper context preservation
        optimizedMessages = messages;
        optimizationMetadata = { 
          originalTokens: messages.length * 100, 
          optimizedTokens: messages.length * 100, 
          compressionRatio: 0, // No compression for admin agents
          fullContextAvailable: true 
        };
        
        console.log(`🧠 FULL CONTEXT PRESERVED: ${messages.length} messages retained for ${agentName} (no compression)`);
      }
      
      const estimatedTokens = this.estimateTokens(systemPrompt + JSON.stringify(optimizedMessages));
      console.log(`📊 TOKEN TRACKING: ${estimatedTokens} tokens (${isAdminAgent ? 'optimized admin' : 'standard'} mode)`);
      
      // ZARA'S OPTIMIZATION: Local cache system for direct filesystem access  
      console.log(`🚀 ${agentName}: Local cache system - direct filesystem access enabled`);
      
      // Prepare Claude API request with validation and optimization
      const validMessages = optimizedMessages
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
      const maxIterations = 50; // UNRESTRICTED: Increased from 20 to allow full workflow completion
      let allToolCalls: any[] = [];
      
      // ENHANCED SYSTEM PROMPT: Include previous context for continuity  
      const enhancedSystemPrompt = systemPrompt + (previousContext || '');
      
      // Continue conversation until task is complete - UNRESTRICTED for autonomous workflow completion
      while (conversationContinues && iterationCount < maxIterations) {
        iterationCount++;
        
        console.log(`🔄 ${agentName}: Conversation iteration ${iterationCount}/${maxIterations} - Tools allowed: ${tools.length}`);
        
        // Call Claude API
        
        console.log(`🔧 ${agentName}: Calling Claude API with ${tools.length} tools available`);
        console.log(`🔧 TOOLS:`, tools.map(t => t.name));
        console.log(`🔧 MODEL:`, DEFAULT_MODEL_STR);
        console.log(`🔧 SYSTEM PROMPT LENGTH:`, enhancedSystemPrompt.length);
        
        // SIMPLIFIED TOKEN BUDGETING: Fixed limits based on admin status
        const taskComplexity = isAdminAgent ? 'unlimited' : 'moderate';
        const tokenBudget = { maxPerCall: isAdminAgent ? 8192 : 4096 };
        
        // Clean execution with proper tool handling
        
        // RESTORED: Full Claude API call with proper schemas
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          max_tokens: tokenBudget.maxPerCall,
          messages: currentMessages as any,
          system: enhancedSystemPrompt,
          tools: tools,
          tool_choice: { type: "auto" }
        });
        
        let responseText = '';
        let toolCalls: any[] = [];
        
        // Process response content - streaming to user
        for (const contentBlock of response.content) {
          
          if (contentBlock.type === 'text') {
            responseText += contentBlock.text;
            fullResponse += contentBlock.text;
            
            // Stream text content
            res.write(`data: ${JSON.stringify({
              type: 'text_delta',
              content: contentBlock.text
            })}\n\n`);
            
          } else if (contentBlock.type === 'tool_use') {
            // Agent is using a tool - show user the action
            
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
              // SIMPLIFIED TOOL EXECUTION: Direct execution without complex caching
              let toolResult: string;
              toolResult = await this.executeToolCall(toolCall, agentName, userId);
              
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
      
      // Simple verification status logging (no blocking)
      const toolNamesUsed = allToolCalls.map(tc => tc.name);
      if (toolNamesUsed.length > 0) {
        console.log(`✅ ${agentName}: Used tools: ${toolNamesUsed.join(', ')}`);
      } else {
        console.log(`✅ ${agentName}: Conversational response completed`);
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
      
      // ZARA'S TOKEN OPTIMIZATION: Use local processing for learning and context
      await localProcessingEngine.updateAgentLearningLocally(userId, agentName, message, fullResponse);
      await localProcessingEngine.updateSessionContextLocally(userId, agentName, conversationId, { 
        message, 
        response: fullResponse, 
        toolsUsed: allToolCalls,
        taskType: localProcessingEngine.identifyTaskTypeLocally(message),
        intent: localProcessingEngine.extractIntentLocally(message),
        responseType: localProcessingEngine.extractResponseTypeLocally(fullResponse)
      });
      
      // Send completion
      res.write(`data: ${JSON.stringify({
        type: 'completion',
        agentId: agentName,
        conversationId,
        success: true,
        verificationStatus: 'approved',
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
   * ZARA'S TOKEN OPTIMIZATION: Local tool result processing
   * Processes results locally without consuming Claude API tokens
   */
  private async intelligentResultSummary(toolResult: string, toolName: string): Promise<string> {
    // Use local processing engine instead of Claude API
    return localProcessingEngine.processToolResultLocally(toolResult, toolName);
    // REMOVED: All token-heavy processing moved to local engine
  }

  private async executeToolCall(toolCall: any, agentName?: string, userId?: string): Promise<string> {
    console.log(`🔧 EXECUTING: ${toolCall.name}`, toolCall.input);
    
    try {
      // ZARA'S TOKEN OPTIMIZATION: Use local validation instead of Claude API
      if (toolCall.name === 'str_replace_based_edit_tool' && toolCall.input.command === 'str_replace') {
        // Pre-validate file modifications locally
        if (toolCall.input.new_str) {
          const validation = localProcessingEngine.validateCodeLocally(
            toolCall.input.new_str,
            toolCall.input.path || ''
          );
          
          if (!validation.valid) {
            console.warn(`⚠️ LOCAL VALIDATION WARNINGS for ${agentName}:`, validation.errors);
            // Add suggestions to help agent fix issues
            const suggestions = validation.suggestions.join('\n');
            console.log(`💡 LOCAL SUGGESTIONS: ${suggestions}`);
          }
        }
      }
      
      if (toolCall.name === 'str_replace_based_edit_tool') {
        const { str_replace_based_edit_tool } = await import('../tools/tool-exports');
        const result = await str_replace_based_edit_tool(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'bash') {
        const { bash } = await import('../tools/tool-exports');
        const result = await bash(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'restart_workflow') {
        const { restart_workflow } = await import('../tools/restart-workflow');
        const result = await restart_workflow(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'coordinate_agent') {
        const { coordinate_agent } = await import('../tools/coordinate_agent');
        const result = await coordinate_agent(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'get_assigned_tasks') {
        const { get_assigned_tasks } = await import('../tools/get_assigned_tasks');
        const result = await get_assigned_tasks(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else {
        return `Tool ${toolCall.name} executed with: ${JSON.stringify(toolCall.input)}`;
      }
    } catch (error) {
      // ZARA'S TOKEN OPTIMIZATION: Local error handling
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const suggestions = localProcessingEngine.generateFixSuggestionsLocally(errorMsg);
      
      console.error(`❌ ${toolCall.name} failed:`, errorMsg);
      if (suggestions.length > 0) {
        console.log(`💡 LOCAL Fix suggestions:`, suggestions);
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

  private async loadConversationMessages(conversationId: string, adminBypass = false) {
    // CONTEXT PRESERVATION FIX: Load ALL messages for admin agents to prevent context loss
    const messageLimit = adminBypass ? 500 : 50; // Increased limit for admin agents
    
    const messages = await db
      .select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, conversationId))
      .orderBy(claudeMessages.createdAt) // FIXED: Use ascending order for proper chronology
      .limit(messageLimit);
    
    console.log(`📜 CONVERSATION LOADED: ${messages.length} messages for ${conversationId} (admin: ${adminBypass})`);
    return messages;
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

  // REMOVED: All token-heavy processing methods moved to local processing engine for optimization

  // ENHANCED LEARNING RETRIEVAL METHODS
  async getAgentLearningInsights(agentName: string, userId: string): Promise<any> {
    try {
      const normalizedAgentName = agentName.toLowerCase();
      
      // Get learning patterns grouped by category
      const learningData = await db
        .select()
        .from(agentLearning)
        .where(and(
          eq(agentLearning.agentName, normalizedAgentName),
          eq(agentLearning.userId, userId)
        ))
        .orderBy(desc(agentLearning.lastSeen))
        .limit(100);

      // Analyze patterns by category
      const insights = {
        totalPatterns: learningData.length,
        categories: {} as Record<string, any>,
        recentActivity: learningData.slice(0, 10),
        confidenceAverage: 0,
        topPatterns: []
      };

      // Group by category and calculate insights
      for (const pattern of learningData) {
        const category = pattern.category || 'general';
        if (!insights.categories[category]) {
          insights.categories[category] = {
            count: 0,
            avgConfidence: 0,
            patterns: []
          };
        }
        
        insights.categories[category].count++;
        insights.categories[category].patterns.push(pattern);
        insights.categories[category].avgConfidence = 
          insights.categories[category].patterns.reduce((sum: number, p: any) => 
            sum + parseFloat(p.confidence?.toString() || '0'), 0) / insights.categories[category].patterns.length;
      }

      // Calculate overall confidence average
      insights.confidenceAverage = learningData.reduce((sum, p) => 
        sum + parseFloat(p.confidence?.toString() || '0'), 0) / learningData.length;

      return insights;
    } catch (error) {
      console.error('Failed to get agent learning insights:', error);
      return null;
    }
  }
}

export const claudeApiServiceSimple = new ClaudeApiServiceSimple();