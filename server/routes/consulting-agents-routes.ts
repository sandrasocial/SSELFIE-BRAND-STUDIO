import { Router, Request } from 'express';
import express from 'express';
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
import { CodebaseUnderstandingIntelligence } from '../agents/codebase-understanding-intelligence';
// SIMPLIFIED MEMORY SYSTEM: Replaced 4 competing systems with one clean interface
import { simpleMemoryService } from '../services/simple-memory-service';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

function getClaudeService() {
  return claudeApiServiceSimple;
}

// REMOVED: DirectWorkspaceAccess - agents now use native bash + str_replace tools

const consultingAgentsRouter = Router();

// Add JSON body parser middleware
consultingAgentsRouter.use(express.json({ limit: '50mb' }));
consultingAgentsRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * ADMIN CONSULTING AGENTS - UNRESTRICTED INTELLIGENCE SYSTEM
 * Removed all hardcoded forcing to let agents use natural intelligence
 */
// Admin authentication middleware - connects to real Sandra session
const adminAuth = async (req: AdminRequest, res: any, next: any) => {
  try {
    // Use real authentication middleware to get Sandra's actual session
    await new Promise<void>((resolve, reject) => {
      isAuthenticated(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Verify this is Sandra's account
    const userEmail = req.user?.claims?.email;
    if (!req.user || !userEmail) {
      console.log('🚫 ADMIN AUTH: No user data after authentication');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed - no user data' 
      });
    }
    
    if (userEmail === 'ssa@ssasocial.com') {
      req.isAdminBypass = true;
      console.log(`✅ ADMIN AUTH: Sandra authenticated with real session ID: ${req.user.claims.sub}`);
      return next();
    } else {
      console.log(`🚫 ADMIN AUTH: Unauthorized user: ${userEmail}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access restricted to Sandra only' 
      });
    }
  } catch (error) {
    console.error('🚫 ADMIN AUTH: Authentication failed:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required for admin agents' 
    });
  }
};

consultingAgentsRouter.post('/admin/consulting-chat', adminAuth, async (req: AdminRequest, res: any) => {
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
    
    const userId = req.user!.claims.sub; // Use Sandra's real authenticated user ID
    const conversationId = req.body.conversationId || agentId;
    const isAdminBypass = (req as AdminRequest).isAdminBypass || false;
    
    console.log(`🔐 REAL AUTH: Using Sandra's authenticated session ID: ${userId} for agent ${agentId}`);
    
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
    
    // VERIFICATION-FIRST ENFORCEMENT: Inject mandatory verification protocols
    const { VerificationEnforcement } = await import('../services/verification-enforcement.js');
    const baseSystemPrompt = VerificationEnforcement.enforceVerificationFirst(agentConfig.systemPrompt, message);
    
    // GENERATE CLEAN PROMPT without competing system pollution
    const systemPrompt = contextRequirement.isWorkTask && contextSummary ? 
      `${baseSystemPrompt}\n\n## CURRENT CONTEXT:\n${contextSummary}` : 
      baseSystemPrompt;
    
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