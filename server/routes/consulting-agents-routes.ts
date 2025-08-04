import { Router } from 'express';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '../../shared/schema';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';
import { getClaudeService } from '../services/claude-api-service-rebuilt';
import { AdvancedMemorySystem } from '../services/advanced-memory-system';

const router = Router();

/**
 * UNIFIED ADMIN CONSULTING CHAT ENDPOINT  
 * Simple, direct agent communication with memory integration
 */
router.post('/consulting-chat', async (req, res) => {
  try {
    const { agentId, message } = req.body;

    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // Simple admin check - no complex authentication
    const user = req.user as any;
    const userId = user?.claims?.sub || 'admin-sandra';
    
    console.log(`🤖 ${agentId} processing message for user ${userId}`);

    // Get agent configuration
    const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent ${agentId} not found`
      });
    }

    const conversationId = req.body.conversationId || `admin_${agentId}_${Date.now()}`;
    
    // MEMORY INTEGRATION: Load and apply memory context
    console.log(`🧠 Loading memory profile for ${agentId}`);
    const memorySystem = AdvancedMemorySystem.getInstance();
    const memoryProfile = await memorySystem.getAgentMemoryProfile(agentId, userId);
    
    // Build system prompt with memory context
    let systemPrompt = `You are ${agentConfig.name}, ${agentConfig.role}. ${agentConfig.systemPrompt}`;
    
    if (memoryProfile && memoryProfile.learningPatterns.length > 0) {
      systemPrompt += `\n\n🧠 LEARNED PATTERNS:\n`;
      memoryProfile.learningPatterns.forEach(pattern => {
        systemPrompt += `• ${pattern.category}: ${pattern.pattern}\n`;
      });
      console.log(`🧠 Applied ${memoryProfile.learningPatterns.length} learning patterns`);
    }

    // Use Claude API service for streaming response
    const claudeService = getClaudeService();
    
    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send initial status
    res.write(`data: ${JSON.stringify({
      type: 'agent_start',
      agentName: agentConfig.name,
      message: `${agentConfig.name} is thinking...`
    })}\n\n`);

    // Basic tools for agents
    const tools = [
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
        name: 'bash',
        description: 'Execute terminal commands',
        input_schema: {
          type: 'object',
          properties: {
            command: { type: 'string' },
            restart: { type: 'boolean' }
          }
        }
      },
      {
        name: 'search_filesystem',
        description: 'Search and locate files, functions, classes',
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
      }
    ];
    
    // Stream Claude API response with memory context
    await claudeService.sendStreamingMessage(
      userId,
      agentId,
      conversationId,
      message,
      systemPrompt,
      tools,
      res
    );
    
    // Record learning pattern after interaction
    if (memorySystem) {
      await memorySystem.recordLearningPattern(agentId, userId, {
        category: 'consultation',
        pattern: 'user_interaction',
        confidence: 0.8,
        frequency: 1,
        effectiveness: 0.9,
        contexts: ['admin_consulting', agentConfig.specialization || 'general']
      });
      console.log(`🧠 Recorded learning pattern for ${agentId}`);
    }
    
    res.end();

  } catch (error: any) {
    console.error('❌ Admin consulting chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Agent communication failed',
      error: error?.message || 'Unknown error'
    });
  }
});

/**
 * Load conversation history for specific agent
 */
router.post('/agent-conversation-history/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const user = req.user as any;
    const userId = user?.claims?.sub || 'admin-sandra';
    
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

/**
 * Clear conversation history for specific agent
 */
router.post('/agent-conversation-clear/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const user = req.user as any;
    const userId = user?.claims?.sub || 'admin-sandra';
    
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