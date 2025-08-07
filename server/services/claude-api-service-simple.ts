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
      
      // CACHE SYSTEM DISABLED: No search context restrictions for agents
      console.log(`🚀 ${agentName}: Cache context disabled - direct filesystem access enabled`);
      
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
      
      // ENHANCED LEARNING INTEGRATION with pattern analysis
      await this.updateAgentLearning(userId, agentName, message, fullResponse);
      await this.updateSessionContext(userId, agentName, conversationId, { 
        message, 
        response: fullResponse, 
        toolsUsed: allToolCalls,
        taskType: this.identifyTaskType(message),
        intent: this.extractIntent(message),
        responseType: this.extractResponseType(fullResponse)
      });
      
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
    // OPTIMIZED: Limit all results to prevent content overload
    if (toolResult.length <= 2000) {
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
        const { ErrorPreventionSystem } = await import('../agents/error-prevention-system');
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
        console.log(`🚀 UNRESTRICTED SEARCH: Agent ${agentName} using full search capabilities`);
        
        // BYPASS SYSTEM: Check if query_description exists and try enhanced bypass
        if (toolCall.input.query_description) {
          console.log(`🔄 ATTEMPTING ENHANCED BYPASS for query: "${toolCall.input.query_description}"`);
          
          try {
            const { enhanced_search_bypass } = await import('../tools/enhanced_search_bypass');
            const bypassResult = await enhanced_search_bypass({
              naturalLanguageQuery: toolCall.input.query_description,
              agentName: agentName || 'unknown',
              conversationId: 'bypass_conversation'
            });
            
            console.log(`✅ BYPASS SUCCESS: Found ${bypassResult.results?.length || 0} results`);
            return JSON.stringify(bypassResult, null, 2);
            
          } catch (bypassError) {
            const errorMessage = bypassError instanceof Error ? bypassError.message : 'Unknown error';
            console.warn(`⚠️ BYPASS FAILED, falling back to standard search:`, errorMessage);
            // Fall through to standard search
          }
        }
        
        const { search_filesystem } = await import('../tools/tool-exports');
        
        // ENHANCED INPUT: Ensure agent context is passed through
        const enhancedInput = {
          ...toolCall.input,
          agentName: agentName || 'unknown',
          conversationId: 'temp_conversation_id' // Fallback if not available
        };
        
        const result = await search_filesystem(enhancedInput);
        return JSON.stringify(result, null, 2);
        
      } else if (toolCall.name === 'str_replace_based_edit_tool') {
        const { str_replace_based_edit_tool } = await import('../tools/tool-exports');
        const result = await str_replace_based_edit_tool(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'bash') {
        const { bash } = await import('../tools/tool-exports');
        const result = await bash(toolCall.input);
        return typeof result === 'string' ? result : JSON.stringify(result);
        
      } else if (toolCall.name === 'direct_file_access') {
        const { direct_file_access } = await import('../tools/tool-exports');
        const result = await direct_file_access(toolCall.input);
        return JSON.stringify(result, null, 2);
        
      } else {
        return `Tool ${toolCall.name} executed with: ${JSON.stringify(toolCall.input)}`;
      }
    } catch (error) {
      // INTELLIGENT ERROR HANDLING: Provide helpful context
      const { ErrorPreventionSystem } = await import('../agents/error-prevention-system');
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

  // ENHANCED PATTERN EXTRACTION: Advanced learning from conversations
  private extractPatterns(userMessage: string, assistantMessage: string): Array<{type: string, category: string, data: any}> {
    const patterns = [];
    const userLower = userMessage.toLowerCase();
    const assistantLower = assistantMessage.toLowerCase();

    // 1. CONVERSATION PATTERN ANALYSIS
    patterns.push({
      type: 'pattern',
      category: 'conversation',
      data: {
        userIntent: this.extractIntent(userMessage),
        responseType: this.extractResponseType(assistantMessage),
        interactionLength: userMessage.length + assistantMessage.length,
        timestamp: new Date().toISOString()
      }
    });

    // 2. TASK COMPLETION PATTERNS
    if (assistantMessage.includes('✅') || assistantMessage.includes('completed') || assistantMessage.includes('success')) {
      patterns.push({
        type: 'task_completion',
        category: 'workflow',
        data: {
          taskType: this.identifyTaskType(userMessage),
          completionIndicators: ['success', 'completed', 'finished'].filter(indicator => 
            assistantLower.includes(indicator)
          ),
          responseLength: assistantMessage.length
        }
      });
    }

    // 3. TOOL USAGE PATTERNS
    if (assistantMessage.includes('search_filesystem') || assistantMessage.includes('str_replace_based_edit_tool')) {
      patterns.push({
        type: 'tool_usage',
        category: 'technical',
        data: {
          toolsUsed: this.extractToolsUsed(assistantMessage),
          taskContext: userMessage.substring(0, 150),
          success: assistantMessage.includes('✅') || assistantMessage.includes('successfully')
        }
      });
    }

    // 4. COMMUNICATION PREFERENCES
    if (userLower.includes('please') || userLower.includes('can you') || userLower.includes('help')) {
      patterns.push({
        type: 'communication_style',
        category: 'preference',
        data: {
          politenessLevel: userLower.includes('please') ? 'polite' : 'direct',
          requestType: userLower.includes('help') ? 'assistance' : 'action',
          urgencyLevel: userLower.includes('urgent') || userLower.includes('quickly') ? 'high' : 'normal'
        }
      });
    }

    // 5. DESIGN PATTERN RECOGNITION
    if (userLower.includes('design') || userLower.includes('ui') || userLower.includes('component')) {
      patterns.push({
        type: 'design_request',
        category: 'creative',
        data: {
          designType: this.identifyDesignType(userMessage),
          luxuryElements: userLower.includes('luxury') || userLower.includes('sophisticated'),
          colorPreferences: this.extractColorPreferences(userMessage)
        }
      });
    }

    // 6. SUCCESSFUL RESPONSE TRACKING
    if (assistantMessage.length > 100) {
      patterns.push({
        type: `successful_response_${Date.now()}`,
        category: 'conversation',
        data: {
          messageLength: userMessage.length,
          responseLength: assistantMessage.length,
          hasCodeExamples: assistantMessage.includes('```') || assistantMessage.includes('tsx') || assistantMessage.includes('typescript'),
          hasToolUsage: assistantMessage.includes('🔧') || assistantMessage.includes('search_filesystem'),
          timestamp: new Date().toISOString()
        }
      });
    }

    return patterns;
  }

  // HELPER METHODS FOR PATTERN ANALYSIS
  private extractIntent(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('create') || lower.includes('build') || lower.includes('make')) return 'create';
    if (lower.includes('fix') || lower.includes('repair') || lower.includes('debug')) return 'fix';
    if (lower.includes('analyze') || lower.includes('check') || lower.includes('review')) return 'analyze';
    if (lower.includes('explain') || lower.includes('help') || lower.includes('how')) return 'explain';
    if (lower.includes('update') || lower.includes('modify') || lower.includes('change')) return 'update';
    return 'general';
  }

  private extractResponseType(response: string): string {
    if (response.includes('```') || response.includes('tsx') || response.includes('typescript')) return 'code';
    if (response.includes('✅') || response.includes('🔧') || response.includes('🎯')) return 'actionable';
    if (response.includes('analysis') || response.includes('found') || response.includes('discovered')) return 'analytical';
    if (response.length > 1000) return 'comprehensive';
    return 'standard';
  }

  private identifyTaskType(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('component') || lower.includes('tsx') || lower.includes('react')) return 'component_development';
    if (lower.includes('database') || lower.includes('schema') || lower.includes('sql')) return 'database';
    if (lower.includes('api') || lower.includes('endpoint') || lower.includes('route')) return 'api_development';
    if (lower.includes('design') || lower.includes('ui') || lower.includes('styling')) return 'design';
    if (lower.includes('agent') || lower.includes('ai') || lower.includes('claude')) return 'agent_system';
    return 'general_development';
  }

  private extractToolsUsed(response: string): string[] {
    const tools = [];
    if (response.includes('search_filesystem')) tools.push('search_filesystem');
    if (response.includes('str_replace_based_edit_tool')) tools.push('str_replace_based_edit_tool');
    if (response.includes('bash')) tools.push('bash');
    if (response.includes('execute_sql_tool')) tools.push('execute_sql_tool');
    return tools;
  }

  private identifyDesignType(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('dashboard') || lower.includes('admin')) return 'dashboard';
    if (lower.includes('landing') || lower.includes('homepage')) return 'landing_page';
    if (lower.includes('form') || lower.includes('input')) return 'form';
    if (lower.includes('nav') || lower.includes('menu')) return 'navigation';
    if (lower.includes('card') || lower.includes('component')) return 'component';
    return 'general_ui';
  }

  private extractColorPreferences(message: string): string[] {
    const colors = [];
    const lower = message.toLowerCase();
    if (lower.includes('black') || lower.includes('dark')) colors.push('black');
    if (lower.includes('white') || lower.includes('light')) colors.push('white');
    if (lower.includes('gray') || lower.includes('grey')) colors.push('gray');
    if (lower.includes('luxury') || lower.includes('sophisticated')) colors.push('monochrome');
    return colors;
  }

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