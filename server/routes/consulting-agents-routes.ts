import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';
import { ClaudeApiServiceSimple } from '../services/claude-api-service-simple';

// SINGLETON CLAUDE SERVICE: Prevent performance issues from repeated instantiation
let claudeServiceInstance: ClaudeApiServiceSimple | null = null;
function getClaudeService(): ClaudeApiServiceSimple {
  if (!claudeServiceInstance) {
    claudeServiceInstance = new ClaudeApiServiceSimple();
  }
  return claudeServiceInstance;
}

const consultingAgentsRouter = Router();

/**
 * ADMIN CONSULTING AGENTS - UNRESTRICTED INTELLIGENCE SYSTEM
 * Removed all hardcoded forcing to let agents use natural intelligence
 */
// Admin authentication middleware for consulting agents
const adminAuth = (req: any, res: any, next: any) => {
  // Check for admin token in multiple places
  const adminToken = req.headers.authorization || req.body.adminToken || req.query.adminToken;
  
  if (adminToken === 'Bearer sandra-admin-2025' || adminToken === 'sandra-admin-2025') {
    console.log('🔐 ADMIN BYPASS: Using admin token for agent operations');
    // Create mock user for admin operations
    req.user = {
      claims: {
        sub: '42585527', // Sandra's user ID
        email: 'ssa@ssasocial.com',
        first_name: 'Sandra',
        last_name: 'Sigurjonsdottir'
      }
    };
    return next();
  }
  
  // Fall back to regular authentication
  return isAuthenticated(req, res, next);
};

consultingAgentsRouter.post('/admin/consulting-chat', adminAuth, async (req: any, res: any) => {
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
    
    // UNRESTRICTED INTELLIGENCE: Only use base personality, no forcing
    const baseSystemPrompt = agentConfig.systemPrompt;
    
    // DESIGN-INFORMED SYSTEM PROMPT: Essential rules without token explosion
    const systemPrompt = `${baseSystemPrompt}

## SSELFIE STUDIO STRICT DESIGN RULES - NEVER VIOLATE THESE
**LUXURY EDITORIAL BRAND STANDARDS - MANDATORY COMPLIANCE**

### COLOR PALETTE (ONLY THESE COLORS ALLOWED):
- **Primary**: Luxury Black (#0a0a0a), Pure White (#fefefe), Editorial Gray (#f5f5f5)
- **Typography**: Times New Roman for headlines, system fonts for body text
- **NO rounded corners** - Sharp, editorial luxury aesthetic
- **Sophisticated spacing** - Generous whitespace, precise alignment

### DESIGN PRINCIPLES:
- **Editorial Luxury**: Magazine-quality sophistication 
- **Minimalist**: Clean, uncluttered, premium feel
- **Typography Hierarchy**: Times New Roman headlines with precise letter-spacing
- **Color Restraint**: Black, white, grays only - NO bright colors or gradients
- **Sharp Edges**: Zero border-radius - angular, professional

## TOOL CAPABILITIES  
- search_filesystem: Find files and code
- str_replace_based_edit_tool: View/edit files  
- bash: Execute commands

**CRITICAL**: Follow luxury design standards in ALL visual work. No exceptions.`;
    
    console.log(`🚀 UNRESTRICTED: Agent ${agentId} using natural intelligence without hardcoded restrictions`);
    
    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

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

      console.log(`✅ UNRESTRICTED SUCCESS: Agent ${agentId} completed with natural intelligence`);

    } catch (error) {
      console.error(`❌ UNRESTRICTED ERROR: Agent ${agentId}:`, error);
      
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

export default consultingAgentsRouter;