import { Router } from 'express';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';
import { ClaudeApiServiceClean } from '../services/claude-api-service-clean';
import { HybridAgentOrchestrator } from '../services/hybrid-intelligence/hybrid-agent-orchestrator';

// SINGLETON SERVICES: Prevent performance issues from repeated instantiation
let claudeServiceInstance: ClaudeApiServiceClean | null = null;
let hybridOrchestratorInstance: HybridAgentOrchestrator | null = null;
function getClaudeService(): ClaudeApiServiceClean {
  if (!claudeServiceInstance) {
    claudeServiceInstance = ClaudeApiServiceClean.getInstance();
  }
  return claudeServiceInstance;
}

function getHybridOrchestrator(): HybridAgentOrchestrator {
  if (!hybridOrchestratorInstance) {
    hybridOrchestratorInstance = HybridAgentOrchestrator.getInstance();
  }
  return hybridOrchestratorInstance;
}

const router = Router();

/**
 * CONVERSATION HISTORY ENDPOINT
 * Load conversation history for specific agent
 */
router.get('/conversation-history/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const user = req.user as any;
    const userId = user?.claims?.sub || '42585527'; // Sandra's actual user ID
    
    console.log(`📚 Loading conversation history for agent: ${agentId}, user: ${userId}`);
    
    // Get the most recent conversation for this agent
    const conversations = await db
      .select()
      .from(claudeConversations)
      .where(
        and(
          eq(claudeConversations.userId, userId),
          eq(claudeConversations.agentName, agentId)
        )
      )
      .orderBy(desc(claudeConversations.createdAt))
      .limit(1);

    if (conversations.length === 0) {
      return res.json({
        success: true,
        messages: [],
        conversationId: null
      });
    }

    const conversation = conversations[0];
    
    // Get all messages for this conversation
    const messages = await db
      .select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, conversation.conversationId))
      .orderBy(claudeMessages.timestamp);

    console.log(`📚 Found ${messages.length} messages in conversation ${conversation.conversationId}`);

    res.json({
      success: true,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      conversationId: conversation.conversationId
    });

  } catch (error) {
    console.error('Error loading conversation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load conversation history'
    });
  }
});

/**
 * UNIFIED ADMIN CONSULTING CHAT ENDPOINT
 * Direct agent communication for admin interface
 */
router.post('/consulting-chat', async (req, res) => {
  try {
    console.log('🔄 PHASE 3.1 REDIRECT: Consulting agent -> Implementation-aware routing');

    // FIXED ADMIN ACCESS: Proper Sandra authentication with fallback
    const user = req.user as any;
    const isSessionAuthenticated = user?.claims?.email === 'ssa@ssasocial.com';
    const adminToken = req.body.adminToken || req.headers['x-admin-token'];
    const isTokenAuthenticated = adminToken === 'sandra-admin-2025';
    
    // Additional fallback for local development
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    const isLocalAdmin = isDevelopmentMode && (req.body.userId === 'admin-sandra' || req.ip === '127.0.0.1');
    
    console.log('🔐 Auth Debug:', { 
      hasUser: !!user,
      hasReqUser: !!req.user,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      sessionAuth: isSessionAuthenticated, 
      tokenAuth: !!isTokenAuthenticated,
      userEmail: user?.claims?.email,
      userData: user ? { id: user.claims?.sub, email: user.claims?.email } : null
    });
    
    if (!isSessionAuthenticated && !isTokenAuthenticated && !isLocalAdmin) {
      console.log('❌ Admin access denied');
      return res.status(401).json({
        success: false,
        message: 'Admin access required. Please authenticate as Sandra.',
        debug: {
          sessionAuth: isSessionAuthenticated,
          tokenAuth: isTokenAuthenticated,
          localAdmin: isLocalAdmin,
          developmentMode: isDevelopmentMode
        }
      });
    }
    
    console.log('✅ ADMIN ACCESS: Authenticated successfully');

    const { agentId, message } = req.body;

    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // PHASE 3.1: Add consulting flag and redirect to implementation-aware endpoint
    const enhancedRequest = {
      ...req.body,
      consultingMode: true,
      implementationDetectionRequired: true,
      adminToken: 'sandra-admin-2025', // Ensure admin access for redirect
      userId: req.user ? (req.user as any).id : 'admin-sandra'
    };

    console.log(`🔄 PHASE 3.1: Redirecting ${agentId} to implementation-aware routing`);

    // OPTIMIZED ENTERPRISE INTELLIGENCE: Use singleton instance to prevent performance issues
    console.log(`🧠 ENTERPRISE INTELLIGENCE: Routing ${agentId} through optimized intelligence system`);
    
    // Get agent configuration with enterprise capabilities
    const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent ${agentId} not found in consulting system`
      });
    }
    
    const userId = req.user ? (req.user as any).claims.sub : '42585527'; // Sandra's actual user ID
    const conversationId = req.body.conversationId || `admin_${agentId}_${Date.now()}`;
    
    // SPECIALIZED AGENT SYSTEM PROMPT: Full personality with role-specific capabilities
    const specializedSystemPrompt = `${agentConfig.systemPrompt}

**🎯 SPECIALIZED AGENT IDENTITY:**
- You are ${agentConfig.name}, ${agentConfig.role}
- Specialization: ${agentConfig.specialization || 'Enterprise consulting and implementation'}
- Voice: Professional, specialized, action-oriented
- Focus: Technical excellence and strategic implementation

**🚀 YOUR FULL TOOL ARSENAL:**
You have complete access to all Replit-level tools for comprehensive implementation.`;
    
    // COMPLETE ENTERPRISE TOOLS: Full 18+ tool arsenal with parallel execution capability
    const enterpriseTools = [
      // CORE DEVELOPMENT TOOLS
      {
        name: 'str_replace_based_edit_tool',
        description: 'Create, view, edit files with precision. Use for all file operations including code generation, content creation, and modifications.',
        input_schema: {
          type: 'object',
          properties: {
            command: { type: 'string', enum: ['view', 'create', 'str_replace', 'insert'] },
            path: { type: 'string' },
            file_text: { type: 'string' },
            old_str: { type: 'string' },
            new_str: { type: 'string' },
            insert_line: { type: 'integer' },
            insert_text: { type: 'string' },
            view_range: { type: 'array', items: { type: 'integer' } }
          },
          required: ['command', 'path']
        }
      },
      {
        name: 'search_filesystem',
        description: 'Intelligent file discovery and search with enterprise caching',
        input_schema: {
          type: 'object',
          properties: {
            query_description: { type: 'string' },
            code: { type: 'array', items: { type: 'string' } },
            class_names: { type: 'array', items: { type: 'string' } },
            function_names: { type: 'array', items: { type: 'string' } },
            search_paths: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      {
        name: 'bash',
        description: 'Command execution, testing, building, verification, and system operations',
        input_schema: {
          type: 'object',
          properties: {
            command: { type: 'string' },
            restart: { type: 'boolean' }
          }
        }
      },
      {
        name: 'get_latest_lsp_diagnostics',
        description: 'Error detection, code validation, and syntax checking',
        input_schema: {
          type: 'object',
          properties: {
            file_path: { type: 'string' }
          }
        }
      },
      {
        name: 'execute_sql_tool',
        description: 'Database operations, queries, and data manipulation',
        input_schema: {
          type: 'object',
          properties: {
            sql_query: { type: 'string' },
            environment: { type: 'string', enum: ['development'], default: 'development' }
          },
          required: ['sql_query']
        }
      },

      // RESEARCH & INTEGRATION TOOLS
      {
        name: 'web_search',
        description: 'Research, API documentation, latest information, and external data',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      },
      {
        name: 'web_fetch',
        description: 'Retrieve full content from URLs and web pages',
        input_schema: {
          type: 'object',
          properties: {
            url: { type: 'string' }
          },
          required: ['url']
        }
      },

      // ADVANCED IMPLEMENTATION TOOLS
      {
        name: 'agent_implementation_toolkit',
        description: 'Complex implementation orchestration and multi-step development workflows',
        input_schema: {
          type: 'object',
          properties: {
            operation: { type: 'string' },
            parameters: { type: 'object' },
            workflow_type: { type: 'string' }
          },
          required: ['operation']
        }
      },
      {
        name: 'comprehensive_agent_toolkit',
        description: 'Multi-agent coordination, collaboration, and enterprise automation',
        input_schema: {
          type: 'object',
          properties: {
            toolkit_operation: { type: 'string' },
            agent_coordination: { type: 'object' },
            automation_level: { type: 'string' }
          },
          required: ['toolkit_operation']
        }
      },
      {
        name: 'advanced_agent_capabilities',
        description: 'Enterprise-level autonomous operations and intelligent decision making',
        input_schema: {
          type: 'object',
          properties: {
            capability_type: { type: 'string' },
            execution_context: { type: 'object' },
            autonomy_level: { type: 'string' }
          },
          required: ['capability_type']
        }
      },

      // PACKAGE & DEPENDENCY MANAGEMENT
      {
        name: 'packager_tool',
        description: 'Install, manage, and update dependencies (npm, pip, system packages)',
        input_schema: {
          type: 'object',
          properties: {
            language_or_system: { type: 'string' },
            install_or_uninstall: { type: 'string', enum: ['install', 'uninstall'] },
            dependency_list: { type: 'array', items: { type: 'string' } }
          },
          required: ['language_or_system', 'install_or_uninstall']
        }
      },

      // WORKFLOW & COORDINATION TOOLS
      {
        name: 'report_progress',
        description: 'Document progress, coordinate workflows, and track task completion',
        input_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' }
          },
          required: ['summary']
        }
      },
      {
        name: 'mark_completed_and_get_feedback',
        description: 'Mark tasks complete, capture screenshots, and gather user feedback',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            workflow_name: { type: 'string' },
            website_route: { type: 'string' }
          },
          required: ['query', 'workflow_name']
        }
      },
      {
        name: 'restart_workflow',
        description: 'Restart or start workflows and manage running processes',
        input_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            workflow_timeout: { type: 'integer', default: 30 }
          },
          required: ['name']
        }
      },

      // SECURITY & DEPLOYMENT TOOLS
      {
        name: 'ask_secrets',
        description: 'Request API keys and secure credentials from users',
        input_schema: {
          type: 'object',
          properties: {
            secret_keys: { type: 'array', items: { type: 'string' } },
            user_message: { type: 'string' }
          },
          required: ['secret_keys', 'user_message']
        }
      },
      {
        name: 'check_secrets',
        description: 'Verify availability of API keys and environment variables',
        input_schema: {
          type: 'object',
          properties: {
            secret_keys: { type: 'array', items: { type: 'string' } }
          },
          required: ['secret_keys']
        }
      },
      {
        name: 'suggest_deploy',
        description: 'Indicate project readiness for deployment',
        input_schema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
    ];
    
    console.log(`🧠 ENTERPRISE: Initializing ${agentId} with full intelligence system`);
    console.log(`🔧 TOOLS: Agent has access to ${enterpriseTools.length} enterprise tools`);
    console.log(`🎯 AGENT CONFIG: ${agentConfig.name} - ${agentConfig.role}`);
    console.log(`📋 SPECIALIZATION: ${agentConfig.specialization}`);
    console.log(`⚡ TOOLS ALLOWED: ${agentConfig.allowedTools?.length || 0} configured tools`);
    console.log(`🚀 PARALLEL EXECUTION: Claude 4 parallel tool support enabled`);
    console.log(`💰 TOKEN OPTIMIZATION: Direct execution + efficient API usage active`);
    
    // TOKEN-EFFICIENT ROUTING: Check for direct tool execution first
    console.log(`💰 TOKEN OPTIMIZATION: Attempting direct execution for ${agentId}`);
    
    // 🎯 MESSAGE CLASSIFICATION: Separate conversations from tool operations
    const { MessageClassifier } = await import('../services/hybrid-intelligence/message-classifier');
    const messageClassifier = MessageClassifier.getInstance();
    const classification = messageClassifier.classifyMessage(message, agentId);
    
    console.log(`🔍 MESSAGE TYPE: ${classification.type} (${classification.confidence} confidence) - ${classification.reason}`);
    
    // CRITICAL FIX: Always force streaming for admin interface to get authentic agent personalities
    const forceStreaming = req.body.forceStreaming || req.headers['x-force-streaming'] === 'true';
    console.log(`🌊 FORCE STREAMING CHECK: ${forceStreaming} || admin interface always streams`);

    if (classification.forceClaudeAPI || forceStreaming || true) { // Always stream for admin interface
      // 🧠 AGENT CONVERSATION: Always use streaming for better UX
      console.log(`🧠 AGENT CONVERSATION: ${agentId} - Forcing streaming for authentic agent response`);
      
      // Skip JSON response and force streaming mode
      console.log(`🌊 FORCING STREAMING: ${agentId} will use streaming for authentic personality delivery`);
      
      // Continue to streaming section below
    } else {
      // 🔧 TOOL OPERATION: Use hybrid intelligence for zero-cost operations
      console.log(`🔧 TOOL OPERATION: ${agentId} using hybrid intelligence for tool execution`);
      
      const hybridOrchestrator = getHybridOrchestrator();
      const hybridRequest = {
        agentId,
        userId,
        message,
        conversationId,
        context: { specializedSystemPrompt }
      };

      const hybridResult = await hybridOrchestrator.processHybridRequest(hybridRequest);
      if (hybridResult.success) {
        console.log(`✅ HYBRID SUCCESS: ${hybridResult.processingType} - ${hybridResult.tokensUsed} tokens used, ${hybridResult.tokensSaved} saved`);
        return res.status(200).json({
          success: true,
          response: hybridResult.content,
          agentId,
          conversationId,
          processingType: hybridResult.processingType,
          tokensUsed: hybridResult.tokensUsed,
          tokensSaved: hybridResult.tokensSaved,
          processingTime: hybridResult.processingTime
        });
      }
    }
    
    // 🌊 FORCE STREAMING: All agent responses should use streaming for better UX
    console.log(`🌊 STREAMING MODE: ${agentId} - Forcing streaming for better user experience`);
    
    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    try {
      if (classification.forceClaudeAPI) {
        // 🧠 CLAUDE STREAMING: Full agent intelligence via proper service
        console.log(`🌊 CLAUDE STREAMING: ${agentId} with authentic personality and full tool access`);
        
        const claudeService = getClaudeService();
        
        // CRITICAL FIX: Ensure conversation exists before streaming to prevent foreign key errors
        console.log(`📝 Creating conversation ${conversationId} for user ${userId} if not exists`);
        await claudeService.createConversationIfNotExists(conversationId, userId, agentId);
        
        // Use the actual Claude service that has agent personalities
        const streamingResponse = await claudeService.sendStreamingMessage(
          userId,
          agentId,
          conversationId,
          message,
          specializedSystemPrompt,
          enterpriseTools,
          res
        );
        
        if (streamingResponse) {
          console.log(`✅ STREAMING SUCCESS: ${agentId} authentic streaming complete`);
          return; // Response already sent via streaming
        }
      } else {
        // 🔧 HYBRID STREAMING: Tool operations only
        console.log(`🔧 HYBRID STREAMING: ${agentId} with tool optimization`);
        
        const hybridOrchestrator = getHybridOrchestrator();
        const streamRequest = {
          agentId,
          userId,
          message,
          conversationId,
          context: { specializedSystemPrompt }
        };

        await hybridOrchestrator.processHybridStreaming(streamRequest, res);
      }
      res.end();
    } catch (error: any) {
      console.error(`❌ STREAMING ERROR: ${agentId}:`, error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Streaming failed',
        message: error.message
      })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }

  } catch (error: any) {
    console.error('❌ PHASE 3.1 CONSULTING REDIRECTION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Consulting agent redirection failed',
      error: error?.message || 'Unknown error'
    });
  }
});

/**
 * DIRECT CLAUDE STREAMING
 * Bypasses hybrid system for authentic agent conversations
 */
async function streamDirectClaudeResponse(
  res: any,
  message: string,
  systemPrompt: string,
  agentId: string,
  conversationId: string,
  userId: string
) {
  try {
    const anthropic = new (await import('@anthropic-ai/sdk')).default({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log(`🧠 DIRECT CLAUDE: ${agentId} with full tool access and context`);

    // Load conversation history for context
    const { ClaudeApiServiceClean } = await import('../services/claude-api-service-clean');
    const claudeService = ClaudeApiServiceClean.getInstance();
    const conversationHistory = await claudeService.loadConversationHistory(conversationId, userId, 10);

    // Enhanced system prompt with tool access for authentic agent experience
    const enhancedSystemPrompt = `${systemPrompt}

CONVERSATION CONTEXT: Maintain context from previous messages in this conversation.

TOOL ACCESS: You have full access to enterprise development tools. Use them actively to analyze, create, and modify code:
- search_filesystem: Find files and code in the repository
- str_replace_based_edit_tool: Create, view, and edit files
- bash: Execute system commands
- get_latest_lsp_diagnostics: Check for errors

HYBRID OPTIMIZATION: Tool executions are optimized for efficiency while preserving your full capabilities.`;

    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: enhancedSystemPrompt,
      messages: [
        ...conversationHistory,
        { role: "user", content: message }
      ],
      tools: [
        {
          name: 'search_filesystem',
          description: 'Search for files and code in the repository',
          input_schema: {
            type: 'object',
            properties: {
              query_description: { type: 'string' },
              search_paths: { type: 'array', items: { type: 'string' } },
              code: { type: 'array', items: { type: 'string' } },
              function_names: { type: 'array', items: { type: 'string' } },
              class_names: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        {
          name: 'str_replace_based_edit_tool',
          description: 'View, create, and edit files',
          input_schema: {
            type: 'object',
            properties: {
              command: { type: 'string', enum: ['view', 'create', 'str_replace', 'insert'] },
              path: { type: 'string' },
              file_text: { type: 'string' },
              old_str: { type: 'string' },
              new_str: { type: 'string' },
              insert_line: { type: 'integer' },
              insert_text: { type: 'string' },
              view_range: { type: 'array', items: { type: 'integer' } }
            },
            required: ['command', 'path']
          }
        },
        {
          name: 'bash',
          description: 'Execute bash commands',
          input_schema: {
            type: 'object',
            properties: {
              command: { type: 'string' }
            },
            required: ['command']
          }
        },
        {
          name: 'get_latest_lsp_diagnostics',
          description: 'Check for code errors and diagnostics',
          input_schema: {
            type: 'object',
            properties: {
              file_path: { type: 'string' }
            }
          }
        }
      ],
      stream: true,
    });

    let fullResponse = '';
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const textChunk = chunk.delta.text;
        fullResponse += textChunk;
        
        res.write(`data: ${JSON.stringify({
          type: 'content',
          content: textChunk
        })}\n\n`);
      } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
        // Handle tool execution during streaming
        const toolUse = chunk.content_block;
        console.log(`🔧 TOOL EXECUTION DURING STREAMING: ${toolUse.name}`);
        
        try {
          const { claudeHybridBridge } = await import('../services/claude-hybrid-bridge');
          const toolResult = await claudeHybridBridge.executeToolViaHybrid({
            toolName: toolUse.name,
            parameters: toolUse.input,
            agentId,
            userId,
            conversationId,
            context: { streaming: true }
          });

          // Stream tool execution result
          res.write(`data: ${JSON.stringify({
            type: 'tool_execution',
            toolName: toolUse.name,
            result: toolResult.result,
            tokensUsed: toolResult.tokensUsed,
            tokensSaved: toolResult.tokensSaved
          })}\n\n`);

          fullResponse += `\n[Tool executed: ${toolUse.name}]\n`;
        } catch (error) {
          console.error(`❌ Tool execution error:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown tool execution error';
          res.write(`data: ${JSON.stringify({
            type: 'tool_error',
            toolName: toolUse.name,
            error: errorMessage
          })}\n\n`);
        }
      }
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({
      type: 'completion',
      agentId,
      conversationId,
      fullResponse,
      success: true
    })}\n\n`);
    
    res.write(`data: [DONE]\n\n`);
  } catch (error) {
    console.error('Direct Claude streaming error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Streaming failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })}\n\n`);
    res.write(`data: [DONE]\n\n`);
  }
}

/**
 * UNIFIED ADMIN CONVERSATION HISTORY ENDPOINTS
 * Migrated from admin-conversation-routes.ts to prevent conflicts
 */

// Load conversation history for specific agent (legacy endpoint compatibility)
router.post('/agent-conversation-history/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { adminToken } = req.body;
    
    // Admin authentication
    const user = req.user as any;
    const isSessionAuthenticated = user?.claims?.email === 'ssa@ssasocial.com';
    const isTokenAuthenticated = adminToken === 'sandra-admin-2025';
    
    if (!isSessionAuthenticated && !isTokenAuthenticated) {
      console.log('❌ Admin auth failed:', { 
        sessionAuth: isSessionAuthenticated, 
        tokenAuth: isTokenAuthenticated,
        userEmail: user?.claims?.email 
      });
      return res.status(401).json({ error: 'Admin access required' });
    }

    const userId = user?.claims?.sub || '42585527';
    console.log(`📚 Loading conversation history for agent: ${agentId} (user: ${userId})`);

    // Get conversation history using claudeConversations/claudeMessages tables
    const conversations = await db
      .select()
      .from(claudeConversations)
      .where(
        and(
          eq(claudeConversations.userId, userId),
          eq(claudeConversations.agentName, agentId)
        )
      )
      .orderBy(desc(claudeConversations.createdAt))
      .limit(10);

    // Get messages for all conversations
    const allMessages = [];
    for (const conversation of conversations) {
      const messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, conversation.conversationId))
        .orderBy(claudeMessages.timestamp);
      
      allMessages.push(...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        conversationId: conversation.conversationId
      })));
    }
        
    console.log(`✅ Found ${allMessages.length} messages for ${agentId} (user: ${userId})`);

    res.json({
      success: true,
      agentId,
      conversations: allMessages.reverse(), // Show newest first
      count: allMessages.length
    });

  } catch (error) {
    console.error("Failed to load conversation history:", error);
    res.status(500).json({ error: "Failed to load conversation history" });
  }
});

// Clear conversation history for specific agent
router.post('/agent-conversation-clear/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Admin authentication
    const user = req.user as any;
    const isSessionAuthenticated = user?.claims?.email === 'ssa@ssasocial.com';
    const adminToken = req.body.adminToken || req.headers['x-admin-token'];
    const isTokenAuthenticated = adminToken === 'sandra-admin-2025';
    
    if (!isSessionAuthenticated && !isTokenAuthenticated) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const userId = user?.claims?.sub || '42585527';
    console.log(`🗑️ Clearing conversation history for agent: ${agentId} (user: ${userId})`);

    // Delete conversations and messages for this agent
    const conversationsToDelete = await db
      .select({ conversationId: claudeConversations.conversationId })
      .from(claudeConversations)
      .where(
        and(
          eq(claudeConversations.userId, userId),
          eq(claudeConversations.agentName, agentId)
        )
      );

    // Delete messages first (foreign key constraint)
    for (const conv of conversationsToDelete) {
      await db
        .delete(claudeMessages)
        .where(eq(claudeMessages.conversationId, conv.conversationId));
    }

    // Delete conversations
    await db
      .delete(claudeConversations)
      .where(
        and(
          eq(claudeConversations.userId, userId),
          eq(claudeConversations.agentName, agentId)
        )
      );
        
    console.log(`✅ Cleared ${conversationsToDelete.length} conversations for ${agentId}`);

    res.json({
      success: true,
      agentId,
      cleared: conversationsToDelete.length,
      message: `Conversation history cleared for ${agentId}`
    });

  } catch (error) {
    console.error("Failed to clear conversation history:", error);
    res.status(500).json({ error: "Failed to clear conversation history" });
  }
});

export default router;