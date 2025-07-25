import { Router } from 'express';
import { z } from 'zod';
import { claudeApiService } from '../services/claude-api-service';
import { db } from '../db';
import { claudeConversations } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
// Agent personalities will be referenced dynamically

const router = Router();

// Schema for sending messages
const sendMessageSchema = z.object({
  agentName: z.string(),
  message: z.string(),
  conversationId: z.string().optional(),
  tools: z.array(z.any()).optional(),
  fileEditMode: z.boolean().optional(),
});

// Schema for getting conversation history
const getHistorySchema = z.object({
  conversationId: z.string(),
});

// Send message to Claude agent with memory and learning
router.post('/send-message', async (req, res) => {
  try {
    const { agentName, message, conversationId, tools, fileEditMode } = sendMessageSchema.parse(req.body);
    
    // Check authentication and get user ID
    const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
    const user = req.user;
    
    console.log('🔒 Claude API Auth Check:', {
      isAuthenticated,
      hasUser: !!user,
      userKeys: user ? Object.keys(user) : [],
      userId: user ? (user as any).id : null,
      userClaims: user ? (user as any).claims : null
    });
    
    if (!isAuthenticated || !user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Extract user ID - try multiple formats to ensure compatibility
    const userId = (user as any).id || (user as any).claims?.sub || (user as any).claims?.id;
    
    if (!userId) {
      console.error('❌ No user ID found in authentication data:', user);
      return res.status(401).json({ error: 'User ID not found in authentication' });
    }

    const finalConversationId = conversationId || `${agentName}-${userId}-${Date.now()}`;

    // Use proper agent expertise from Claude API service
    const systemPrompt = `You are ${agentName}, Sandra's specialized AI agent.`;

    // Send message to Claude with memory and learning
    const response = await claudeApiService.sendMessage(
      userId,
      agentName,
      finalConversationId,
      message,
      systemPrompt,
      tools,
      fileEditMode || false
    );

    res.json({
      success: true,
      response,
      conversationId: finalConversationId,
      agentName,
    });
  } catch (error) {
    console.error('Claude send message error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to send message',
      details: errorMessage 
    });
  }
});

// Get conversation history
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const history = await claudeApiService.getConversationHistory(conversationId);

    res.json({
      success: true,
      history,
      conversationId,
    });
  } catch (error) {
    console.error('Get conversation history error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get conversation history',
      details: errorMessage 
    });
  }
});

// Get agent memory and learning data
router.get('/agent/:agentName/memory', async (req, res) => {
  try {
    const { agentName } = req.params;
    
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = (req.user as any).claims?.sub;
    const memory = await claudeApiService.getAgentMemory(agentName, userId);

    res.json({
      success: true,
      memory,
      agentName,
    });
  } catch (error) {
    console.error('Get agent memory error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get agent memory',
      details: errorMessage 
    });
  }
});

// Get conversation history by conversation ID
router.get('/conversation/:conversationId/history', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const history = await claudeApiService.getConversationHistory(conversationId);

    res.json({
      success: true,
      messages: history,
      conversationId,
    });
  } catch (error) {
    console.error('Get conversation history error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get conversation history',
      details: errorMessage 
    });
  }
});

// Clear conversation (preserves agent memory)
router.post('/conversation/clear', async (req, res) => {
  try {
    const { agentName } = req.body;
    
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!agentName) {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    const userId = (req.user as any).claims?.sub;
    await claudeApiService.clearConversation(userId, agentName);

    res.json({
      success: true,
      message: 'Conversation cleared successfully',
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to clear conversation',
      details: errorMessage 
    });
  }
});

// Get agent capabilities
router.get('/agent/:agentName/capabilities', async (req, res) => {
  try {
    const { agentName } = req.params;
    
    const capabilities = await claudeApiService.getAgentCapabilities(agentName);

    res.json({
      success: true,
      capabilities,
      agentName,
    });
  } catch (error) {
    console.error('Get agent capabilities error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to get agent capabilities',
      details: errorMessage 
    });
  }
});

// Start new conversation
router.post('/conversation/new', async (req, res) => {
  try {
    const { agentName } = req.body;
    
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = (req.user as any).claims?.sub;
    
    console.log('🔍 Looking for existing conversations for agent:', agentName, 'user:', userId);
    
    // First try to find the most recent existing conversation for this agent and user
    const existingConversations = await db
      .select()
      .from(claudeConversations)
      .where(and(
        eq(claudeConversations.agentName, agentName),
        eq(claudeConversations.userId, userId)
      ))
      .orderBy(desc(claudeConversations.lastMessageAt))
      .limit(1);

    console.log('🔍 Database search result:', existingConversations.length, 'conversations found');
    if (existingConversations.length > 0) {
      console.log('🔍 Found conversation details:', {
        id: existingConversations[0].id,
        conversationId: existingConversations[0].conversationId,
        messageCount: existingConversations[0].messageCount,
        agentName: existingConversations[0].agentName,
        status: existingConversations[0].status
      });
    }

    let conversationId;
    
    if (existingConversations.length > 0) {
      // Use the most recent existing conversation
      conversationId = existingConversations[0].conversationId;
      console.log('✅ Found existing conversation:', conversationId, 'with', existingConversations[0].messageCount, 'messages');
    } else {
      // Create new conversation only if none exists
      conversationId = `${agentName}-${userId}-${Date.now()}`;
      await claudeApiService.createConversationIfNotExists(userId, agentName, conversationId);
      console.log('🆕 Created new conversation:', conversationId);
    }

    res.json({
      success: true,
      conversationId,
      agentName,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to create conversation',
      details: errorMessage 
    });
  }
});

// Update agent capability
router.post('/agent/:agentName/capability/:capabilityName', async (req, res) => {
  try {
    const { agentName, capabilityName } = req.params;
    const { config } = req.body;
    
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await claudeApiService.updateAgentCapability(agentName, capabilityName, config);

    res.json({
      success: true,
      message: 'Capability updated successfully',
    });
  } catch (error) {
    console.error('Update capability error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to update capability',
      details: errorMessage 
    });
  }
});

export default router;