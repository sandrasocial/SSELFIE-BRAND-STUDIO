import { Router, Request } from 'express';
import { isAuthenticated } from '../replitAuth';
import { PersonalityManager, PURE_PERSONALITIES } from '../agents/personalities/personality-config';
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
// REMOVED: architectural-knowledge-base - part of old complex system
// SIMPLIFIED MEMORY SYSTEM: Replaced 4 competing systems with one clean interface
import { simpleMemoryService } from '../services/simple-memory-service';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
// COORDINATION TOOLS: Import schemas and direct tool functions
import { TOOL_SCHEMAS } from '../tools/tool-schemas';
import { str_replace_based_edit_tool } from '../tools/str_replace_based_edit_tool';
import { bash } from '../tools/bash';
import { get_latest_lsp_diagnostics } from '../tools/get_latest_lsp_diagnostics';
import { execute_sql_tool } from '../tools/execute_sql_tool';
import { search_filesystem } from '../tools/search_filesystem';
// ZARA'S CONTEXT LOSS FIX: Import workflow state management
import { ConversationManager } from '../agents/core/conversation/ConversationManager';

function getClaudeService() {
  return claudeApiServiceSimple;
}

// LOCAL TOOL EXECUTION: Execute tools locally while preserving agent intelligence for responses
async function handleDirectAdminExecution(
  userId: string,
  agentId: string,
  conversationId: string,
  message: string,
  availableTools: any[],
  res: any
) {
  console.log(`🔧 LOCAL TOOLS: ${agentId.toUpperCase()} executing tools locally (agent responses still use Claude API)`);
  
  // Set up streaming response
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache'
  });
  
  try {
    // Get agent personality for responses
    const agentConfig = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    const agentName = agentConfig?.name || agentId;
    
    // Stream agent acknowledgment
    res.write(`🚀 ${agentName}: Starting direct execution...\n`);
    
    // ADVANCED TOOL PARSING: Look for various tool request patterns
    const toolPatterns = [
      /\{[^}]*"command"[^}]*\}/g,        // str_replace_based_edit_tool
      /\{[^}]*"query_description"[^}]*\}/g, // search_filesystem
      /\{[^}]*"sql_query"[^}]*\}/g,     // execute_sql_tool
      /Using\s+(str_replace_based_edit_tool|search_filesystem|bash|execute_sql_tool)/gi, // Tool usage indicators
      /npm\s+run\s+\w+/g,                // NPM commands (bash)
      /node\s+\w+\.js/g,                 // Node commands (bash)
      /ls\s+-la/g,                       // File listing (bash)
      /cat\s+[\w\.\\/]+/g               // File viewing (bash)
    ];
    
    let toolMatches: string[] = [];
    let detectedTools: string[] = [];
    
    for (const pattern of toolPatterns) {
      const matches = message.match(pattern);
      if (matches) {
        toolMatches.push(...matches);
        
        // Detect tool type from pattern
        if (pattern.source.includes('command')) {
          detectedTools.push('str_replace_based_edit_tool');
        } else if (pattern.source.includes('query_description')) {
          detectedTools.push('search_filesystem');
        } else if (pattern.source.includes('sql_query')) {
          detectedTools.push('execute_sql_tool');
        } else {
          detectedTools.push('bash');
        }
      }
    }
    
    if (toolMatches.length > 0 || detectedTools.length > 0) {
      res.write(`🔧 ${agentName}: Detected tool usage - executing directly...\n`);
      
      // Execute JSON tool calls
      for (const toolMatch of toolMatches) {
        if (toolMatch.startsWith('{')) {
          try {
            const toolCall = JSON.parse(toolMatch);
            
            // Determine tool type from parameters
            let toolName = 'unknown';
            if (toolCall.command) toolName = 'str_replace_based_edit_tool';
            if (toolCall.query_description) toolName = 'search_filesystem';  
            if (toolCall.sql_query) toolName = 'execute_sql_tool';
            
            res.write(`🔧 ${agentName}: Executing ${toolName}...\n`);
            
            const result = await executeDirectTool(toolName, toolCall, agentName, res);
            
          } catch (parseError) {
            res.write(`❌ ${agentName}: Failed to parse tool call: ${parseError}\n`);
          }
        }
      }
      
      // Execute detected tool commands (bash, npm, node, etc.)
      const bashCommands = message.match(/(npm\s+run\s+\w+|node\s+\w+\.js|ls\s+-la.*|cat\s+[\w\.\\/]+)/g);
      if (bashCommands) {
        for (const command of bashCommands) {
          res.write(`🔧 ${agentName}: Executing bash command: ${command}\n`);
          await executeDirectTool('bash', { command }, agentName, res);
        }
      }
    } else {
      // TOOL COMPLETED: Return to Claude API for natural agent response
      console.log(`✅ TOOLS COMPLETE: Returning to Claude API for natural ${agentName} response`);
      return true; // Tools executed, agent will respond via Claude API
    }
    
    res.write(`\n🎯 ${agentName}: Direct execution complete - no Claude API tokens used\n`);
    
  } catch (error) {
    res.write(`❌ ADMIN DIRECT ERROR: ${error}\n`);
  } finally {
    res.end();
  }
}

// DIRECT TOOL EXECUTION HELPER
async function executeDirectTool(toolName: string, toolCall: any, agentName: string, res: any) {
  try {
    let toolFunction;
    switch (toolName) {
      case 'str_replace_based_edit_tool':
        toolFunction = str_replace_based_edit_tool;
        break;
      case 'search_filesystem':
        toolFunction = search_filesystem;
        break;
      case 'execute_sql_tool':
        toolFunction = execute_sql_tool;
        break;
      case 'bash':
        toolFunction = bash;
        break;
      case 'get_latest_lsp_diagnostics':
        toolFunction = get_latest_lsp_diagnostics;
        break;
      default:
        res.write(`❌ ${agentName}: Tool ${toolName} not available for direct execution\n`);
        return;
    }
    
    const result = await toolFunction(toolCall);
    res.write(`✅ ${agentName}: ${toolName} completed successfully\n`);
    
    if (result) {
      const resultText = typeof result === 'string' ? result : JSON.stringify(result);
      const truncated = resultText.length > 300 ? resultText.slice(0, 300) + '...' : resultText;
      res.write(`📝 ${agentName}: ${truncated}\n`);
    }
    
  } catch (error) {
    res.write(`❌ ${agentName}: ${toolName} failed - ${error}\n`);
  }
}

// REMOVED: DirectWorkspaceAccess - agents now use native bash + str_replace tools

const consultingAgentsRouter = Router();

/**
 * ADMIN CONSULTING AGENTS - UNRESTRICTED INTELLIGENCE SYSTEM
 * Removed all hardcoded forcing to let agents use natural intelligence
 */
// REAL ADMIN AUTH: Use actual authenticated user from database
const adminAuth = async (req: AdminRequest, res: any, next: any) => {
  try {
    // First try normal authentication
    await new Promise((resolve, reject) => {
      isAuthenticated(req, res, (err: any) => {
        if (err) reject(err);
        else resolve(null);
      });
    });
    
    // Verify user is admin in database
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user exists and is admin
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId)
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    console.log(`✅ REAL ADMIN AUTH: ${user.email} (ID: ${user.id})`);
    return next();
    
  } catch (error) {
    console.error('❌ ADMIN AUTH FAILED:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
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

    // Get agent configuration from authentic personality system
    const agentConfig = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent "${agentId}" not found`,
        availableAgents: Object.keys(PURE_PERSONALITIES)
      });
    }

    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
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
    
    // PROPER TOOL SCHEMAS: Send schemas to Claude, keep functions for execution
    const availableTools = [
      TOOL_SCHEMAS.str_replace_based_edit_tool,
      TOOL_SCHEMAS.bash,
      TOOL_SCHEMAS.get_latest_lsp_diagnostics,
      TOOL_SCHEMAS.execute_sql_tool,
      TOOL_SCHEMAS.web_search,
      TOOL_SCHEMAS.restart_workflow,
      TOOL_SCHEMAS.search_filesystem,
      TOOL_SCHEMAS.coordinate_agent,  // ELENA'S COORDINATION TOOL
      TOOL_SCHEMAS.get_assigned_tasks // WORKFLOW TASK RETRIEVAL TOOL
    ];

    // ADMIN INTELLIGENT MODE: Use Claude API for conversations, direct tools for specific requests
    const isAdminRequest = req.body.adminToken === 'sandra-admin-2025' || userId === '42585527';
    
    // TOKEN OPTIMIZED MODE: Local processing for tool operations, Claude API for agent intelligence
    const isExactJSONToolCall = message.trim().startsWith('{') && message.trim().endsWith('}') && 
                               (message.includes('"command":') || message.includes('"query_description":') || message.includes('"sql_query":'));
    
    if (isAdminRequest && isExactJSONToolCall) {
      // LOCAL TOOL EXECUTION: Direct tool processing without consuming Claude tokens
      console.log(`🔧 LOCAL TOOLS: ${normalizedAgentId.toUpperCase()} executing tools locally (token optimization)`);
      
      return await handleDirectAdminExecution(
        userId,
        normalizedAgentId, 
        baseConversationId,
        message,
        availableTools,
        res
      );
    } else {
      // CLAUDE INTELLIGENCE: All agent responses and conversations use full Claude API
      console.log(`🧠 CLAUDE INTELLIGENCE: ${normalizedAgentId.toUpperCase()} using full AI intelligence${isAdminRequest ? ' [ADMIN]' : ''}`);
      
      await claudeService.sendStreamingMessage(
        userId,
        normalizedAgentId,
        baseConversationId,
        message,
        PersonalityManager.getNaturalPrompt(normalizedAgentId),
        availableTools,
        res // Pass the response object for real streaming
      );
    }

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

    // Get agent configuration from authentic personality system
    const agentConfig = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    
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
    
    // UNRESTRICTED: All messages get full context since local processing is free
    const contextRequirement = { contextLevel: 'full', isWorkTask: true, isContinuation: true };
    console.log(`🧠 UNLIMITED ACCESS: Full context provided for all interactions`);
    
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
      
      // UNRESTRICTED: Full memory context always available
      console.log(`💬 UNLIMITED MEMORY: Full context access for all interactions`);
      
      // UNRESTRICTED: Always prepare complete context
      agentContext = await simpleMemoryService.prepareAgentWorkspace(agentId, userId, message, isAdminBypass);
      
      // UNRESTRICTED: Full memory access - no filtering since local processing doesn't cost tokens
      if (agentMemoryProfile && agentMemoryProfile.context && agentMemoryProfile.context.memories.length > 0) {
        // FULL ACCESS: Give agent ALL memories without any filtering or limits
        const allMemories = agentMemoryProfile.context.memories; // No filtering!
          
        if (allMemories.length > 0) {
          const allRecentMemories = allMemories
            .map((mem: any) => `- ${mem.data?.pattern || mem.data?.currentTask || mem.data?.userMessage || 'Previous interaction'}`)
            .join('\n');
          contextSummary = `COMPLETE CONTEXT:\n${allRecentMemories}\n\nCURRENT TASK: ${message}`;
          console.log(`🧠 FULL CONTEXT: Loaded ALL ${allMemories.length} memories for ${agentId} - no restrictions`);
        } else {
          contextSummary = `Agent ${agentId} ready for: ${message}`;
          console.log(`🧠 FRESH START: No memories yet for ${agentId}`);
        }
      } else {
        contextSummary = `Agent ${agentId} ready for: ${message}`;
        console.log(`🏗️ WORKSPACE: New context for ${agentId}`);
      }
      
      // UNRESTRICTED: Save ALL interactions to memory without filtering
      if (agentContext) {
        await simpleMemoryService.saveAgentMemory(agentContext, {
          currentTask: message,
          adminBypass: isAdminBypass,
          userMessage: message, // Save full message, not truncated
          timestamp: new Date().toISOString(),
          interactionType: 'conversation' // Track all types
        });
        console.log(`🧠 FULL MEMORY: All interactions saved for ${agentId}${isAdminBypass ? ' [ADMIN]' : ''}`);
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
    let systemPrompt = PersonalityManager.getNaturalPrompt(agentId.toLowerCase());
    
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
          name: "search_filesystem",
          description: "Search through project files and directories",
          input_schema: {
            type: "object",
            properties: {
              query_description: { type: "string" },
              class_names: { type: "array", items: { type: "string" }, default: [] },
              function_names: { type: "array", items: { type: "string" }, default: [] },
              code: { type: "array", items: { type: "string" }, default: [] },
              search_paths: { type: "array", items: { type: "string" }, default: ["."] }
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

// CONVERSATION HISTORY ENDPOINT - Full conversation loading for proper context preservation
consultingAgentsRouter.get('/admin/agents/conversation-history/:agentName', async (req: any, res: any) => {
  // ADMIN TOKEN AUTH: Check for admin token first, then fall back to regular auth
  const adminToken = req.headers.authorization || req.query.adminToken;
  
  if (adminToken === 'Bearer sandra-admin-2025' || adminToken === 'sandra-admin-2025') {
    // Direct admin access - bypass regular auth
    req.user = {
      claims: {
        sub: '42585527',
        email: 'ssa@ssasocial.com',
        first_name: 'Sandra',
        last_name: 'Sigurjonsdottir'
      }
    };
  } else {
    // Use regular admin auth for non-token requests
    try {
      await new Promise((resolve, reject) => {
        adminAuth(req, res, (err: any) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
    } catch (authError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin authentication required',
        details: 'Use admin token or valid admin session'
      });
    }
  }
  try {
    const { agentName } = req.params;
    const userId = req.user ? (req.user as any).claims.sub : '42585527';
    
    console.log(`📜 CONVERSATION LOAD: ${agentName} for user ${userId}`);
    
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
      
      console.log(`📜 CONVERSATION LOADED: ${messages.length} messages from conversation ${latestConversationId}`);
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
      agentCount: Object.keys(PURE_PERSONALITIES).length,
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
        agents: Object.keys(PURE_PERSONALITIES),
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