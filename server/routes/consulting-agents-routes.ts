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
import { DirectWorkspaceAccess } from '../services/direct-workspace-access';
import { autonomousNavigation } from '../services/autonomous-navigation-system';
import { CodebaseUnderstandingIntelligence } from '../agents/codebase-understanding-intelligence';
import { ContextPreservationSystem } from '../agents/context-preservation-system';
import { AdvancedMemorySystem } from '../services/advanced-memory-system';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

function getClaudeService() {
  return claudeApiServiceSimple;
}

// INITIALIZE DIRECT ACCESS SYSTEM: Core bypass mechanism for agent file operations
const directAccess = new DirectWorkspaceAccess();

const consultingAgentsRouter = Router();

/**
 * ADMIN CONSULTING AGENTS - UNRESTRICTED INTELLIGENCE SYSTEM
 * Removed all hardcoded forcing to let agents use natural intelligence
 */
// Admin authentication middleware for consulting agents
const adminAuth = (req: AdminRequest, res: any, next: any) => {
  // Check for admin token in multiple places
  const adminToken = req.headers.authorization || req.body.adminToken || req.query.adminToken;
  
  if (adminToken === 'Bearer sandra-admin-2025' || adminToken === 'sandra-admin-2025') {
    console.log('🔓 ADMIN MEMORY BYPASS: Enhanced memory privileges activated');
    // Create mock user for admin operations
    req.user = {
      claims: {
        sub: '42585527', // Sandra's user ID
        email: 'ssa@ssasocial.com',
        first_name: 'Sandra',
        last_name: 'Sigurjonsdottir'
      }
    };
    req.isAdminBypass = true; // CRITICAL: Enable enhanced memory access
    return next();
  }
  
  // Fall back to regular authentication
  return isAuthenticated(req, res, next);
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
    
    const userId = req.user ? (req.user as any).claims.sub : '42585527';
    const conversationId = req.body.conversationId || agentId;
    const isAdminBypass = (req as AdminRequest).isAdminBypass || false;
    
    console.log(`🧠 MEMORY INTEGRATION: Admin bypass ${isAdminBypass ? 'ENABLED' : 'disabled'} for ${agentId}`);
    
    // ENHANCED MEMORY SYSTEM INTEGRATION with ADMIN BYPASS
    const memorySystem = AdvancedMemorySystem.getInstance();
    let agentMemoryProfile = null;
    let contextualMemories = '';
    let agentContext = null;
    
    try {
      // Load/create agent memory profile with admin bypass
      agentMemoryProfile = await memorySystem.getAgentMemoryProfile(agentId, userId, isAdminBypass);
      
      if (!agentMemoryProfile) {
        console.log(`🧠 INITIALIZING: Creating new memory profile for ${agentId}${isAdminBypass ? ' [ADMIN]' : ''}`);
        agentMemoryProfile = await memorySystem.initializeAgentMemory(agentId, userId, {
          baseIntelligence: isAdminBypass ? 10 : 7, // Admin agents get max intelligence
          specialization: agentConfig.specialization || agentId
        });
      }
      
      // Get contextual memories for this specific request
      const relevantMemories = await memorySystem.getContextualMemories(agentId, userId, message, 'agent_conversation');
      contextualMemories = relevantMemories.length > 0 ? 
        `\n## RELEVANT LEARNED PATTERNS:\n${relevantMemories.map(m => `- ${m.category}: ${m.pattern} (confidence: ${m.confidence})`).join('\n')}\n` : '';
      
      // Load/prepare agent context with admin bypass
      agentContext = await ContextPreservationSystem.prepareAgentWorkspace(agentId, userId, message, isAdminBypass);
      
      // ADMIN BYPASS: Save unlimited context for admin agents
      if (isAdminBypass) {
        await ContextPreservationSystem.saveContext(agentId, userId, {
          currentTask: message,
          adminBypass: true
        }, true);
        console.log(`🔓 ADMIN MEMORY BYPASS: Unlimited context preservation enabled for ${agentId}`);
      }
      
      console.log(`🧠 MEMORY LOADED: Intelligence level ${agentMemoryProfile.intelligenceLevel}, ${relevantMemories.length} relevant patterns${isAdminBypass ? ' [ADMIN BYPASS - UNLIMITED CONTEXT]' : ''}`);
      
    } catch (memoryError) {
      console.error('🧠 MEMORY ERROR:', memoryError);
      // Continue without memory enhancement if there's an error
    }
    
    // UNRESTRICTED INTELLIGENCE: Only use base personality, no forcing
    const baseSystemPrompt = agentConfig.systemPrompt;
    
    // COMPREHENSIVE SYSTEM PROMPT: Architecture + Design + Intelligence + Memory
    const systemPrompt = `${baseSystemPrompt}
${contextualMemories}
${agentContext ? await ContextPreservationSystem.getContextSummary(agentId, userId) : ''}

## PROJECT ARCHITECTURE - CRITICAL KNOWLEDGE
**SSELFIE Studio Structure (React + TypeScript + Express + PostgreSQL)**

### FILE ORGANIZATION:
- **client/**: React frontend (components, pages, hooks, contexts)
  - client/src/pages/: Page components (e.g., admin-dashboard.tsx)
  - client/src/components/: Reusable UI components
  - client/src/hooks/: Custom React hooks
  - client/src/index.css: Global styles with luxury design tokens
- **server/**: Express backend (routes, services, agents)
  - server/routes/: API endpoints
  - server/services/: Business logic and integrations
  - server/agents/: Intelligence systems
- **shared/**: Shared types and schemas (Drizzle ORM)
  - shared/schema.ts: Database models and types

### IMPORT PATTERNS:
- From client: import from '@/components', '@/hooks', '@/pages'
- From server: import from '../services', '../db'
- From shared: import from '@shared/schema'
- Always use .js extensions in server imports

### MODIFICATION PROTOCOL:
- ALWAYS modify existing files when asked (e.g., admin-dashboard.tsx)
- NEVER create duplicate "redesigned" versions
- Search for existing components before creating new ones
- Check imports and dependencies before changes

## DESIGN RULES - LUXURY STANDARDS
- **Colors**: Black (#0a0a0a), White (#fefefe), Gray (#f5f5f5) ONLY
- **Typography**: Times New Roman headlines, system fonts for body
- **Layout**: No rounded corners (border-radius: 0), editorial spacing
- **Style**: Magazine-quality, minimalist, sophisticated

## INTELLIGENT WORKFLOW:
1. **SEARCH** existing files first (use simple searches, not complex queries)
2. **ANALYZE** current implementation before changes
3. **MODIFY** existing files (don't create duplicates)
4. **VALIDATE** imports and structure
5. **TEST** changes for errors

## TOOLS:
- search_filesystem: Find files (use simple keywords)
- str_replace_based_edit_tool: View/edit files
- bash: Run commands and tests

**REMEMBER**: You have full codebase access. Search and understand before changing.`;
    
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
      
      // COMPLETE TOOL ACCESS: All agent tools restored
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
          name: "search_filesystem",
          description: "Search for files and code in the codebase",
          input_schema: {
            type: "object",
            properties: {
              query_description: { type: "string" },
              code: { type: "array", items: { type: "string" } },
              class_names: { type: "array", items: { type: "string" } },
              function_names: { type: "array", items: { type: "string" } },
              search_paths: { type: "array", items: { type: "string" } }
            }
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
              workflow_timeout: { type: "integer", default: 30 }
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
        {
          name: "direct_file_access",
          description: "Direct file access without filtering - view, list, check existence, or search by path",
          input_schema: {
            type: "object",
            properties: {
              action: { 
                type: "string", 
                enum: ["view", "list", "exists", "search_path"],
                description: "Action to perform: view file content, list directory, check if exists, or search by path pattern"
              },
              path: { 
                type: "string",
                description: "File or directory path relative to project root"
              },
              recursive: { 
                type: "boolean", 
                default: false,
                description: "For list/search actions, whether to search subdirectories"
              },
              max_depth: { 
                type: "integer", 
                default: 3,
                description: "Maximum depth for recursive operations"
              }
            },
            required: ["action", "path"]
          }
        }
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
      
      // MEMORY LEARNING: Record successful interaction
      if (agentMemoryProfile && memorySystem) {
        try {
          await memorySystem.recordLearningPattern(agentId, userId, {
            category: 'successful_conversation',
            pattern: `Completed: ${message.substring(0, 50)}...`,
            confidence: 0.8,
            frequency: 1,
            effectiveness: 0.9,
            contexts: ['agent_conversation', 'successful_completion']
          });
          
          // Save updated context
          if (agentContext) {
            await ContextPreservationSystem.saveContext(agentId, userId, {
              currentTask: message,
              successfulPatterns: [...(agentContext.successfulPatterns || []), 'conversation_completed'],
              lastWorkingState: { completedAt: new Date().toISOString() }
            }, isAdminBypass);
          }
        } catch (memoryError) {
          console.error('🧠 MEMORY LEARNING ERROR:', memoryError);
        }
      }

    } catch (error) {
      console.error(`❌ UNRESTRICTED ERROR: Agent ${agentId}:`, error);
      
      // MEMORY LEARNING: Record failure for learning
      if (agentMemoryProfile && memorySystem) {
        try {
          await memorySystem.recordLearningPattern(agentId, userId, {
            category: 'failed_conversation',
            pattern: `Failed: ${message.substring(0, 50)}...`,
            confidence: 0.6,
            frequency: 1,
            effectiveness: 0.1,
            contexts: ['agent_conversation', 'error_handling']
          });
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
    console.error('❌ CONSULTING AGENT ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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