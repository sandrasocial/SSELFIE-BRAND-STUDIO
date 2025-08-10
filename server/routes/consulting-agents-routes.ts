import { Router, Request } from 'express';
import { isAuthenticated } from '../replitAuth';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';
// REMOVED: ClaudeApiServiceSimple import - using singleton instead

// Type definitions for admin requests
interface AdminRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email: string;
      first_name: string;
      last_name: string;
    }
  };
  isAdminBypass?: boolean; // Enhanced memory bypass flag
}

// Type definition for consulting chat request body
interface ConsultingChatBody {
  agentId: string;
  message: string;
  conversationId?: string;
  adminToken?: string;
}

// UNIFIED SERVICE: Use singleton from claude-api-service-simple.ts (eliminates service multiplication)
import { claudeApiServiceSimple } from '../services/claude-api-service-simple';
// REMOVED: DirectWorkspaceAccess - unified native tool architecture
// ELIMINATED: autonomousNavigation - part of competing memory systems
import { SSELFIE_ARCHITECTURE, AGENT_TOOL_INTELLIGENCE, FileAnalysis } from '../agents/capabilities/intelligence/architectural-knowledge-base';
// SIMPLIFIED MEMORY SYSTEM: Replaced 4 competing systems with one clean interface
import { simpleMemoryService } from '../services/simple-memory-service';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
// COORDINATION TOOLS: Import actual tool functions
import { restart_workflow } from '../tools/restart-workflow';
import { str_replace_based_edit_tool } from '../tools/str_replace_based_edit_tool';
import { bash } from '../tools/bash';
import { get_latest_lsp_diagnostics } from '../tools/get_latest_lsp_diagnostics';
// ZARA'S CONTEXT LOSS FIX: Import workflow state management
import { ConversationManager } from '../agents/core/conversation/ConversationManager';

function getClaudeService() {
  return claudeApiServiceSimple;
}

// REMOVED: DirectWorkspaceAccess - agents now use native bash + str_replace tools

const consultingAgentsRouter = Router();

/**
 * ADMIN CONSULTING AGENTS - UNRESTRICTED INTELLIGENCE SYSTEM
 * Removed all hardcoded forcing to let agents use natural intelligence
 */
// STREAMLINED: Simple admin auth for consulting agents
const adminAuth = (req: AdminRequest, res: any, next: any) => {
  const adminToken = req.headers.authorization || 
                    (req.body && req.body.adminToken) || 
                    req.query.adminToken;
  
  if (adminToken === 'Bearer sandra-admin-2025' || adminToken === 'sandra-admin-2025') {
    req.user = {
      claims: {
        sub: '42585527',
        email: 'ssa@ssasocial.com',
        first_name: 'Sandra',
        last_name: 'Sigurjonsdottir'
      }
    };
    req.isAdminBypass = true;
    return next();
  }
  
  return isAuthenticated(req, res, next);
};

// STREAMLINED: Fast personality-first handler
export async function handleAdminConsultingChat(req: AdminRequest, res: any) {
  try {
    console.log(`🚀 STREAMLINED CONSULTING: Fast personality-first response`);

    const { agentId, message } = req.body;
    
    // MINIMAL VALIDATION: Essential checks only
    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // Get agent configuration
    const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent "${agentId}" not found`,
        availableAgents: Object.keys(CONSULTING_AGENT_PERSONALITIES)
      });
    }

    const userId = req.user?.claims?.sub || 'sandra-admin-test';
    console.log(`🚀 ${agentConfig.name.toUpperCase()}: Streamlined processing`);

    // STREAMLINED: Simplified conversation management  
    const normalizedAgentId = agentId.toLowerCase();
    const baseConversationId = `admin_${normalizedAgentId}_${userId}`;
    
    let conversationHistory: Array<{role: string; content: string}> = [];
    
    // FAST DATABASE: Quick conversation loading
    try {
      const existingConversation = await db
        .select()
        .from(claudeConversations)
        .where(eq(claudeConversations.conversationId, baseConversationId))
        .limit(1);
      
      if (existingConversation.length > 0) {
        const messages = await db
          .select()
          .from(claudeMessages)
          .where(eq(claudeMessages.conversationId, baseConversationId))
          .orderBy(desc(claudeMessages.timestamp))
          .limit(20); // Reduced for speed
        
        conversationHistory = messages.reverse().map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      }
    } catch (dbError) {
      console.error(`Database error:`, dbError);
    }

    const claudeService = getClaudeService();
    
    // STREAMLINED: Essential tools only
    const availableTools = [
      str_replace_based_edit_tool,
      bash,
      restart_workflow
    ];

    // STREAMING RESPONSE: Set up streaming headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send agent start event
    res.write(`data: ${JSON.stringify({
      type: 'agent_start',
      message: `${agentConfig.name} is processing your request...`
    })}\n\n`);

    try {
      // Use simple non-streaming method but format for streaming frontend
      const response = await claudeService.sendMessage(
        message,
        baseConversationId,
        normalizedAgentId,
        true // returnFullResponse = true
      );

      // Send the response as streaming text delta
      if (response && response.trim()) {
        res.write(`data: ${JSON.stringify({
          type: 'text_delta',
          content: response.trim()
        })}\n\n`);
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'completion'
      })}\n\n`);

      // ASYNC SAVE: Don't block response
      setImmediate(async () => {
        try {
          const existingConversation = await db
            .select()
            .from(claudeConversations)
            .where(eq(claudeConversations.conversationId, baseConversationId))
            .limit(1);
          
          if (existingConversation.length === 0) {
            await db.insert(claudeConversations).values({
              conversationId: baseConversationId,
              agentId: normalizedAgentId,
              userId: userId,
              metadata: { adminConsulting: true }
            });
          }
          
          // Save user message
          await db.insert(claudeMessages).values({
            conversationId: baseConversationId,
            role: 'user',
            content: message,
            timestamp: new Date()
          });
          
          // Save assistant response (only if not empty)
          if (response && response.trim()) {
            await db.insert(claudeMessages).values({
              conversationId: baseConversationId,
              role: 'assistant',
              content: response.trim(),
              timestamp: new Date()
            });
          }
        } catch (saveError) {
          console.error(`Async save error:`, saveError);
        }
      });

    } catch (streamError) {
      // Send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: streamError instanceof Error ? streamError.message : 'Agent communication failed'
      })}\n\n`);
    }

    // Close the stream
    res.end();

  } catch (error) {
    console.error(`❌ Consulting error:`, error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

consultingAgentsRouter.post('/admin/consulting-chat', adminAuth, async (req: AdminRequest, res: any) => {
  return handleAdminConsultingChat(req, res);
});

// REMOVED: Duplicate streaming handler - use single streamlined version above

// Legacy route handler (keeping for compatibility)
consultingAgentsRouter.post('/admin/legacy-chat', adminAuth, async (req: AdminRequest, res: any) => {
  try {
    console.log(`🎯 ADMIN CONSULTING: Starting unrestricted agent system`);

    const { agentId, message } = req.body;

    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // Get agent configuration - NO HARDCODED TEMPLATES
    const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent ${agentId} not found in consulting system`
      });
    }
    
    const userId = req.user ? (req.user as any).claims.sub : '42585527';
    const conversationId = req.body.conversationId || `admin_${agentId}_${userId}`;
    const isAdminBypass = (req as AdminRequest).isAdminBypass || false;
    
    console.log(`🧠 MEMORY INTEGRATION: Admin bypass ${isAdminBypass ? 'ENABLED' : 'disabled'} for ${agentId}`);
    
    // SIMPLIFIED CONTEXT DETECTION: Analyze if this needs full context or just conversation
    const contextRequirement = simpleMemoryService.analyzeMessage(message);
    console.log(`🧠 CONTEXT ANALYSIS: ${contextRequirement.contextLevel} (work: ${contextRequirement.isWorkTask}, continuation: ${contextRequirement.isContinuation})`);
    
    // SIMPLIFIED MEMORY SYSTEM INTEGRATION 
    let agentMemoryProfile = null;
    let contextualMemories = '';
    let agentContext = null;
    let contextSummary = '';
    
    try {
      // Always load/create agent memory profile
      agentMemoryProfile = await simpleMemoryService.getAgentMemoryProfile(agentId, userId, isAdminBypass);
      
      // Memory profile is always created by simpleMemoryService.getAgentMemoryProfile
      console.log(`🧠 MEMORY PROFILE: Using simplified memory for ${agentId}${isAdminBypass ? ' [ADMIN]' : ''}`);
      
      // SIMPLIFIED: No complex memory patterns needed
      console.log(`💬 SIMPLIFIED MEMORY: Using streamlined context for ${contextRequirement.isWorkTask ? 'work' : 'conversation'}`);
      
      // FIXED: Always prepare context (not just work tasks)
      agentContext = await simpleMemoryService.prepareAgentWorkspace(agentId, userId, message, isAdminBypass);
      
      // ENHANCED: Build better context summary with memory (FILTERED)
      if (agentMemoryProfile && agentMemoryProfile.context && agentMemoryProfile.context.memories.length > 0) {
        // VERIFICATION FIX: Don't filter out verification-related memories
        // Only filter out obvious demonstration requests, but keep verification tasks
        const filteredMemories = agentMemoryProfile.context.memories
          .filter((mem: any) => {
            const memText = (mem.data?.pattern || mem.data?.currentTask || '').toLowerCase();
            // Keep verification, check, audit, fix, implement tasks
            if (memText.includes('verify') || memText.includes('check') || 
                memText.includes('audit') || memText.includes('fix') || 
                memText.includes('implement') || memText.includes('analyze')) {
              return true;
            }
            // Filter out only obvious demonstrations
            return !memText.includes('demonstrate your') && 
                   !memText.includes('show me your') && 
                   !memText.includes('test your capabilities') &&
                   !memText.includes('arsenal');
          })
          .slice(-3);
          
        if (filteredMemories.length > 0) {
          const recentMemories = filteredMemories
            .map((mem: any) => `- ${mem.data?.pattern || mem.data?.currentTask || 'Previous interaction'}`)
            .join('\n');
          contextSummary = `RECENT CONTEXT:\n${recentMemories}\n\nCURRENT TASK: ${message.substring(0, 100)}...`;
          console.log(`🧠 FILTERED CONTEXT: Loaded ${filteredMemories.length} relevant memories for ${agentId}`);
        } else {
          contextSummary = `Agent ${agentId} ready for: ${message.substring(0, 100)}...`;
          console.log(`🧠 CLEAN CONTEXT: No relevant memories, fresh start for ${agentId}`);
        }
      } else {
        contextSummary = `Agent ${agentId} ready for: ${message.substring(0, 100)}...`;
        console.log(`🏗️ WORKSPACE: Prepared context for ${agentId}`);
      }
      
      // FIXED: Always save context for meaningful interactions (not just admin bypass)
      // VERIFICATION FIX: Don't filter out verification and test requests  
      if (agentContext && (contextRequirement.isWorkTask || contextRequirement.isContinuation)) {
        await simpleMemoryService.saveAgentMemory(agentContext, {
          currentTask: message,
          adminBypass: isAdminBypass,
          userMessage: message.substring(0, 200),
          timestamp: new Date().toISOString()
        });
        console.log(`🧠 CONTEXT SAVED: Memory updated for ${agentId}${isAdminBypass ? ' [ADMIN]' : ''}`);
      }
      
      console.log(`🧠 CONTEXT LOADED: Level ${contextRequirement.contextLevel.toUpperCase()}, Intelligence ${agentMemoryProfile.intelligenceLevel}${isAdminBypass ? ' [ADMIN BYPASS]' : ''}`);
      
    } catch (memoryError) {
      console.error('🧠 MEMORY ERROR:', memoryError);
      // Continue without memory enhancement if there's an error
    }

    // ZARA'S CONTEXT LOSS FIX: Implement workflow state tracking to prevent context loss between coordination calls
    let workflowContext = '';
    try {
      const workflowId = `admin_agent_${agentId}_${userId}`;
      
      // SIMPLIFIED WORKFLOW CONTEXT - Using memory service directly
      let workflowState = await simpleMemoryService.getWorkflowState(workflowId);
      
      if (!workflowState) {
        // Initialize new workflow state in memory service
        workflowState = {
          agentId,
          userId,
          originalTask: message,
          startTime: new Date(),
          currentStage: 'coordination',
          contextData: { latestTask: message },
          agentAssignments: [{ agentId, task: message, status: 'active' }]
        };
        await simpleMemoryService.saveWorkflowState(workflowId, workflowState);
        console.log(`🚀 WORKFLOW: Initialized new workflow ${workflowId} for ${agentId}`);
      } else {
        // Update existing workflow state
        workflowState = {
          ...workflowState,
          latestTask: message,
          lastUpdate: new Date(),
          currentStage: 'coordination',
          contextData: { ...workflowState.contextData, latestTask: message }
        };
        await simpleMemoryService.saveWorkflowState(workflowId, workflowState);
        console.log(`🔄 WORKFLOW: Updated existing workflow ${workflowId} for ${agentId}`);
      }
      
      // Build workflow context summary
      const state = await simpleMemoryService.getWorkflowState(workflowId);
      if (state && state.contextData) {
        const previousTasks = state.agentAssignments
          .filter((a: any) => a.status === 'completed')
          .map((a: any) => `✅ ${a.task.substring(0, 80)}...`);
        
        if (previousTasks.length > 0) {
          workflowContext = `\n\n## WORKFLOW CONTEXT (Preventing Context Loss):\n**Previous Completed Tasks:**\n${previousTasks.slice(-3).join('\n')}\n**Current Task:** ${message}\n**Workflow Stage:** ${state.currentStage}`;
        }
      }
      
      console.log(`💾 WORKFLOW: Context preserved for ${agentId} - preventing context loss between coordination calls`);
      
    } catch (workflowError) {
      console.error('🚨 WORKFLOW ERROR:', workflowError);
      // Continue without workflow enhancement if there's an error
    }
    
    // ENHANCED PROMPT: Include workflow context to prevent context loss
    let systemPrompt = agentConfig.systemPrompt;
    
    if (contextRequirement.isWorkTask && contextSummary) {
      systemPrompt += `\n\n## CURRENT CONTEXT:\n${contextSummary}`;
    }
    
    if (workflowContext) {
      systemPrompt += workflowContext;
    }
    
    console.log(`🚀 UNRESTRICTED: Agent ${agentId} using natural intelligence without hardcoded restrictions`);
    
    // Set response headers for streaming - FIXED ORDER
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    });

    try {
      const claudeService = getClaudeService();
      
      // UNIFIED NATIVE TOOLS: Only available tools sent to Claude
      const tools = [
        {
          name: "str_replace_based_edit_tool",
          description: "View, create and edit files",
          input_schema: {
            type: "object",
            properties: {
              command: { type: "string", enum: ["view", "create", "str_replace", "insert"] },
              path: { type: "string" },
              file_text: { type: "string" },
              old_str: { type: "string" },
              new_str: { type: "string" },
              insert_line: { type: "integer" },
              insert_text: { type: "string" },
              view_range: { type: "array", items: { type: "integer" } }
            },
            required: ["command", "path"]
          }
        },

        {
          name: "bash",
          description: "Run bash commands",
          input_schema: {
            type: "object",
            properties: {
              command: { type: "string" },
              restart: { type: "boolean" }
            }
          }
        },
        {
          name: "get_latest_lsp_diagnostics",
          description: "Check for code errors and issues",
          input_schema: {
            type: "object",
            properties: {
              file_path: { type: "string" }
            }
          }
        },
        {
          name: "packager_tool",
          description: "Install or uninstall packages",
          input_schema: {
            type: "object",
            properties: {
              install_or_uninstall: { type: "string", enum: ["install", "uninstall"] },
              language_or_system: { type: "string" },
              dependency_list: { type: "array", items: { type: "string" } }
            },
            required: ["install_or_uninstall", "language_or_system"]
          }
        },
        {
          name: "programming_language_install_tool",
          description: "Install programming languages",
          input_schema: {
            type: "object",
            properties: {
              programming_languages: { type: "array", items: { type: "string" } }
            },
            required: ["programming_languages"]
          }
        },
        {
          name: "execute_sql_tool",
          description: "Execute SQL queries on the database",
          input_schema: {
            type: "object",
            properties: {
              sql_query: { type: "string" },
              environment: { type: "string", enum: ["development"], default: "development" }
            },
            required: ["sql_query"]
          }
        },
        {
          name: "create_postgresql_database_tool",
          description: "Create a PostgreSQL database",
          input_schema: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "check_database_status",
          description: "Check database connectivity",
          input_schema: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "web_search",
          description: "Search the internet for information",
          input_schema: {
            type: "object",
            properties: {
              query: { type: "string" }
            },
            required: ["query"]
          }
        },
        {
          name: "web_fetch",
          description: "Fetch content from web pages",
          input_schema: {
            type: "object",
            properties: {
              url: { type: "string" }
            },
            required: ["url"]
          }
        },
        {
          name: "restart_workflow",
          description: "Restart or start a workflow",
          input_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              workflow_timeout: { type: "integer", default: 300 }
            },
            required: ["name"]
          }
        },
        {
          name: "suggest_deploy",
          description: "Suggest deployment when project is ready",
          input_schema: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "ask_secrets",
          description: "Request API keys from user",
          input_schema: {
            type: "object",
            properties: {
              secret_keys: { type: "array", items: { type: "string" } },
              user_message: { type: "string" }
            },
            required: ["secret_keys", "user_message"]
          }
        },
        {
          name: "check_secrets",
          description: "Check if secrets exist in environment",
          input_schema: {
            type: "object",
            properties: {
              secret_keys: { type: "array", items: { type: "string" } }
            },
            required: ["secret_keys"]
          }
        },
        {
          name: "report_progress",
          description: "Report task completion progress",
          input_schema: {
            type: "object",
            properties: {
              summary: { type: "string" }
            },
            required: ["summary"]
          }
        },
        {
          name: "mark_completed_and_get_feedback",
          description: "Mark task complete and get user feedback",
          input_schema: {
            type: "object",
            properties: {
              query: { type: "string" },
              workflow_name: { type: "string" },
              website_route: { type: "string" }
            },
            required: ["query", "workflow_name"]
          }
        },
        {
          name: "suggest_rollback",
          description: "Suggest rollback options to user",
          input_schema: {
            type: "object",
            properties: {
              suggest_rollback_reason: { type: "string" }
            },
            required: ["suggest_rollback_reason"]
          }
        },
        {
          name: "search_replit_docs",
          description: "Search Replit documentation",
          input_schema: {
            type: "object",
            properties: {
              query: { type: "string" }
            },
            required: ["query"]
          }
        },

      ];
      
      await claudeService.sendStreamingMessage(
        userId,
        agentId,          // This is agentName
        conversationId,   // This is conversationId  
        message,
        systemPrompt,
        tools, // RESTORED: Tools now available for agent execution
        res
      );

      console.log(`✅ UNRESTRICTED SUCCESS: Agent ${agentId} completed with natural intelligence${isAdminBypass ? ' [ADMIN MEMORY BYPASS]' : ''}`);
      
      // SIMPLIFIED MEMORY LEARNING: Record successful interaction
      if (agentMemoryProfile && agentContext) {
        try {
          await simpleMemoryService.saveAgentMemory(agentContext, {
            category: 'successful_conversation',
            pattern: `Completed: ${message.substring(0, 50)}...`,
            completedAt: new Date().toISOString()
          });
          console.log(`🧠 MEMORY: Saved successful interaction for ${agentId}`);
        } catch (memoryError) {
          console.error('🧠 MEMORY LEARNING ERROR:', memoryError);
        }
      }

    } catch (error) {
      console.error(`❌ UNRESTRICTED ERROR: Agent ${agentId}:`, error);
      
      // SIMPLIFIED MEMORY LEARNING: Record failure for learning  
      if (agentMemoryProfile && agentContext) {
        try {
          await simpleMemoryService.saveAgentMemory(agentContext, {
            category: 'failed_conversation',
            pattern: `Failed: ${message.substring(0, 50)}...`,
            errorAt: new Date().toISOString()
          });
          console.log(`🧠 MEMORY: Saved error for learning ${agentId}`);
        } catch (memoryError) {
          console.error('🧠 MEMORY ERROR RECORDING:', memoryError);
        }
      }
      
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: `Agent ${agentId} encountered an error: ${error}`
      })}\n\n`);
      
      res.end();
    }

  } catch (error) {
    console.error('❌ CONSULTING AGENT ERROR DETAILS:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      agentId: req.body?.agentId,
      userId: req.user?.claims?.sub
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// CONVERSATION HISTORY ENDPOINT - Uses existing backend system with bypass for efficiency
consultingAgentsRouter.get('/admin/agents/conversation-history/:agentName', adminAuth, async (req: any, res: any) => {
  try {
    const { agentName } = req.params;
    const userId = req.user ? (req.user as any).claims.sub : '42585527';
    
    console.log(`📜 BYPASS CONVERSATION LOAD: ${agentName} for user ${userId}`);
    
    // Use existing database access (no duplicate Claude service creation)
    const { db } = await import('../db.js');
    const { claudeConversations, claudeMessages } = await import('../../shared/schema.js');
    const { eq, and, desc } = await import('drizzle-orm');
    
    // Get conversation list for this agent/user
    const conversations = await db
      .select()
      .from(claudeConversations)
      .where(
        and(
          eq(claudeConversations.userId, userId),
          eq(claudeConversations.agentName, agentName.toLowerCase())
        )
      )
      .orderBy(desc(claudeConversations.lastMessageAt))
      .limit(10);
    
    // Get most recent conversation messages if available
    let messages: any[] = [];
    if (conversations.length > 0) {
      const latestConversationId = conversations[0].conversationId;
      messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, latestConversationId))
        .orderBy(claudeMessages.createdAt);
      
      console.log(`📜 BYPASS LOADED: ${messages.length} messages from conversation ${latestConversationId}`);
    }
    
    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      type: msg.role === 'assistant' ? 'agent' : msg.role,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      agentName: msg.role === 'assistant' ? agentName : undefined
    }));
    
    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv.id,
        conversationId: conv.conversationId,
        agentName: conv.agentName,
        messageCount: conv.messageCount,
        createdAt: conv.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: conv.updatedAt?.toISOString() || new Date().toISOString()
      })),
      messages: formattedMessages,
      currentConversationId: conversations[0]?.conversationId || null
    });
    
  } catch (error) {
    console.error('📜 CONVERSATION HISTORY ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load conversation history',
      conversations: [],
      messages: []
    });
  }
});

// MERGED: Implementation Monitoring Capabilities (from agent-implementation-routes.ts)
// These endpoints provide monitoring and health checking for agent operations

// Get implementation health check
consultingAgentsRouter.get('/admin/implementation/health', adminAuth, async (req: AdminRequest, res: any) => {
  try {
    res.json({
      success: true,
      system: 'Unified Agent System',
      status: 'operational',
      endpoints: {
        'consulting-chat': 'Active',
        'conversation-history': 'Active',
        'agent-personalities': 'Active'
      },
      agentCount: Object.keys(CONSULTING_AGENT_PERSONALITIES).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get system configuration 
consultingAgentsRouter.get('/admin/implementation/config', adminAuth, async (req: AdminRequest, res: any) => {
  try {
    res.json({
      success: true,
      config: {
        version: '2.0.0',
        system: 'Unified Consulting Agents',
        features: {
          directFileAccess: true,
          toolExecution: true,
          contextPreservation: true,
          tokenOptimization: true,
          adminBypass: true
        },
        agents: Object.keys(CONSULTING_AGENT_PERSONALITIES),
        routes: [
          '/api/consulting-agents/admin/consulting-chat',
          '/api/consulting-agents/admin/agents/conversation-history/:agentName',
          '/api/consulting-agents/admin/implementation/health',
          '/api/consulting-agents/admin/implementation/config'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default consultingAgentsRouter;