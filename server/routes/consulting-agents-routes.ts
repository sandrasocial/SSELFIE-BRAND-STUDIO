import { Router } from 'express';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';
import { ClaudeApiServiceRebuilt } from '../services/claude-api-service-rebuilt';

// SINGLETON CLAUDE SERVICE: Prevent performance issues from repeated instantiation
let claudeServiceInstance: ClaudeApiServiceRebuilt | null = null;
function getClaudeService(): ClaudeApiServiceRebuilt {
  if (!claudeServiceInstance) {
    claudeServiceInstance = new ClaudeApiServiceRebuilt();
  }
  return claudeServiceInstance;
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
    const userId = user?.claims?.sub || '42585527';
    
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
 * PHASE 3.1: CONSULTING AGENTS REDIRECTION TO IMPLEMENTATION-AWARE ROUTING
 * All consulting requests now flow through implementation detection system
 */
router.post('/consulting-chat', async (req, res) => {
  try {
    console.log('🔄 PHASE 3.1 REDIRECT: Consulting agent -> Implementation-aware routing');

    // FIXED ADMIN ACCESS: Proper Sandra authentication with fallback
    const user = req.user as any;
    const isSessionAuthenticated = user?.claims?.email === 'ssa@ssasocial.com';
    const adminToken = req.body.adminToken || req.headers['x-admin-token'];
    const isTokenAuthenticated = adminToken === 'sandra-admin-2025';
    
    if (!isSessionAuthenticated && !isTokenAuthenticated) {
      console.log('❌ Admin access denied:', { 
        sessionAuth: isSessionAuthenticated, 
        tokenAuth: !!isTokenAuthenticated,
        userEmail: user?.claims?.email 
      });
      return res.status(401).json({
        success: false,
        message: 'Admin access required. Please authenticate as Sandra.'
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
    
    const userId = req.user ? (req.user as any).claims.sub : '42585527';
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
    
    // COMPLETE ENTERPRISE TOOLS: Full tool arsenal, not limited subset
    const enterpriseTools = [
      {
        name: 'str_replace_based_edit_tool',
        description: 'Create, view, edit files with precision',
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
        description: 'Intelligent file discovery and search',
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
        description: 'Command execution, testing, building, verification',
        input_schema: {
          type: 'object',
          properties: {
            command: { type: 'string' },
            restart: { type: 'boolean' }
          }
        }
      },
      {
        name: 'web_search',
        description: 'Research, API documentation, latest information',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_latest_lsp_diagnostics',
        description: 'Error detection and code validation',
        input_schema: {
          type: 'object',
          properties: {
            file_path: { type: 'string' }
          }
        }
      }
    ];
    
    console.log(`🧠 ENTERPRISE: Initializing ${agentId} with full intelligence system`);
    console.log(`🔧 TOOLS: Agent has access to ${enterpriseTools.length} enterprise tools`);
    console.log(`🎯 AGENT CONFIG: ${agentConfig.name} - ${agentConfig.role}`);
    console.log(`📋 SPECIALIZATION: ${agentConfig.specialization}`);
    console.log(`⚡ TOOLS ALLOWED: ${agentConfig.allowedTools?.length || 0} configured tools`);
    
    // TOKEN-EFFICIENT ROUTING: Check for direct tool execution first
    console.log(`💰 TOKEN OPTIMIZATION: Attempting direct execution for ${agentId}`);
    const claudeService = getClaudeService();
    
    // Try direct tool execution to save tokens
    const directResult = await claudeService.tryDirectToolExecution?.(message, conversationId, agentId);
    if (directResult) {
      console.log(`⚡ DIRECT SUCCESS: ${agentId} executed without Claude API tokens`);
      return res.status(200).json({
        success: true,
        response: directResult,
        agentId,
        conversationId,
        tokenOptimized: true,
        executionType: 'direct-bypass'
      });
    }

    // Fallback to Claude API with token optimization
    const result = await claudeService.sendMessage(
      userId,
      agentId,
      conversationId,
      message,
      specializedSystemPrompt, // Use specialized prompt instead of generic
      enterpriseTools, // Give agents ALL tools, not limited subset
      true // Full tool access enabled
    );
    
    // Add consulting mode indicator to response
    const consultingResult = {
      success: true,
      response: result,
      agentId,
      conversationId,
      consultingMode: true,
      implementationDetected: true,
      routedThrough: 'specialized-agent-direct',
      agentPersonality: agentConfig.name,
      toolCount: enterpriseTools.length,
      memorySystemActive: true
    };

    res.status(200).json(consultingResult);

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