import { Router, Request } from 'express';
import { isAuthenticated } from '../replitAuth';
import { PURE_PERSONALITIES } from '../agents/personalities/personality-config';
import { claudeApiServiceSimple } from '../services/claude-api-service-simple';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { TOOL_SCHEMAS } from '../tools/tool-schemas';

// Type definitions for admin requests
interface AdminRequest extends Request {
  body: any;
  params: any;
  headers: any;
  user?: {
    claims: {
      sub: string;
      email: string;
      first_name: string;
      last_name: string;
    }
  };
  isAdminBypass?: boolean;
}

function getClaudeService() {
  return claudeApiServiceSimple;
}

const consultingAgentsRouter = Router();

// ADMIN AUTHENTICATION - Real database validation
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
    
    console.log(`✅ ADMIN AUTH: ${user.email} (ID: ${user.id})`);
    return next();
    
  } catch (error) {
    console.error('❌ ADMIN AUTH FAILED:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// CLEAN ADMIN CONSULTING CHAT HANDLER
export async function handleAdminConsultingChat(req: AdminRequest, res: any) {
  try {
    console.log(`🚀 ADMIN CONSULTING: Clean personality-first response`);

    const { agentId, message } = req.body;
    
    // Essential validation
    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // Get agent configuration
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

    console.log(`🚀 ${agentConfig.name.toUpperCase()}: Processing request`);

    // Simple conversation management  
    const normalizedAgentId = agentId.toLowerCase();
    const baseConversationId = `admin_${normalizedAgentId}_${userId}`;
    
    // Light conversation history loading (only last 20 messages)
    let conversationHistory: Array<{role: string; content: string}> = [];
    
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
          .limit(20); // Reduced from 100 to 20 for performance
        
        conversationHistory = messages.reverse().map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      }
    } catch (dbError) {
      console.error(`Database error:`, dbError);
      // Continue without history if database fails
    }

    const claudeService = getClaudeService();
    
    // Available tools for your admin agents
    const availableTools = [
      TOOL_SCHEMAS.str_replace_based_edit_tool,
      TOOL_SCHEMAS.bash,
      TOOL_SCHEMAS.get_latest_lsp_diagnostics,
      TOOL_SCHEMAS.execute_sql_tool,
      TOOL_SCHEMAS.web_search,
      TOOL_SCHEMAS.restart_workflow,
      TOOL_SCHEMAS.search_filesystem
    ];

    // Create system prompt with agent personality (safe access)
    const config = agentConfig as any; // Type-safe access to dynamic personality structure
    const identity = config.identity?.mission || config.description || `I am ${config.name}, ${config.role || 'assistant'}`;
    const voice = typeof config.voice === 'string' ? config.voice : 
                 config.voice?.style || config.voice?.tone || 'Professional and helpful';
    const expertise = typeof config.expertise === 'string' ? config.expertise :
                     config.expertise?.trends?.join(', ') || config.traits?.primary?.join(', ') || 'General assistance';

    const systemPrompt = `${identity}

Communication Style: ${voice}
Expertise: ${expertise}

You are helping Sandra with her SSELFIE Studio project. You have access to all development tools and can make changes directly to the codebase.`;

    // Send to Claude API with streaming response
    await claudeService.sendStreamingMessage(
      userId,
      normalizedAgentId,
      baseConversationId,
      message,
      systemPrompt,
      availableTools,
      res
    );

  } catch (error) {
    console.error(`❌ Consulting error:`, error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

// MAIN CONSULTING CHAT ROUTE
consultingAgentsRouter.post('/admin/consulting-chat', adminAuth, async (req: AdminRequest, res: any) => {
  return handleAdminConsultingChat(req, res);
});

// CONVERSATION HISTORY ENDPOINT
consultingAgentsRouter.get('/admin/agents/conversation-history/:agentName', adminAuth, async (req: any, res: any) => {
  try {
    const { agentName } = req.params;
    const userId = req.user?.claims?.sub;
    
    console.log(`📜 CONVERSATION LOAD: ${agentName} for user ${userId}`);
    
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

// HEALTH CHECK ENDPOINT
consultingAgentsRouter.get('/admin/implementation/health', adminAuth, async (req: AdminRequest, res: any) => {
  try {
    res.json({
      success: true,
      system: 'Clean Admin Consulting System',
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

// SYSTEM CONFIGURATION ENDPOINT
consultingAgentsRouter.get('/admin/implementation/config', adminAuth, async (req: AdminRequest, res: any) => {
  try {
    res.json({
      success: true,
      config: {
        version: '3.0.0-clean',
        system: 'Clean Admin Consulting Agents',
        features: {
          directFileAccess: true,
          toolExecution: true,
          lightweightDatabase: true,
          personalityFirst: true,
          adminOnly: true
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

// DIRECT AGENT ACCESS ENDPOINT
consultingAgentsRouter.post('/:agentId', async (req: AdminRequest, res: any) => {
  console.log(`🎯 DIRECT AGENT ACCESS: ${req.params.agentId}`);
  
  // Admin token authentication for direct access
  const adminToken = req.headers.authorization || req.body.adminToken;
  
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
  }
  
  // Set agent ID in body for processing
  req.body.agentId = req.params.agentId;
  
  // Use the main handler
  return handleAdminConsultingChat(req, res);
});

export default consultingAgentsRouter;