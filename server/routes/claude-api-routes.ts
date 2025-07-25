import { Router } from 'express';
import { z } from 'zod';
import { claudeApiService } from '../services/claude-api-service';
// Agent personalities will be referenced dynamically

const router = Router();

// Schema for sending messages
const sendMessageSchema = z.object({
  agentName: z.string(),
  message: z.string(),
  conversationId: z.string().optional(),
  tools: z.array(z.any()).optional(),
});

// Schema for getting conversation history
const getHistorySchema = z.object({
  conversationId: z.string(),
});

// Send message to Claude agent with memory and learning
router.post('/send-message', async (req, res) => {
  try {
    const { agentName, message, conversationId, tools } = sendMessageSchema.parse(req.body);
    
    // Verify user is authenticated
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = (req.user as any).id;
    const finalConversationId = conversationId || `${agentName}-${userId}-${Date.now()}`;

    // For now, use a default system prompt - can be enhanced later
    const systemPrompt = `You are ${agentName}, an AI assistant specialized in helping with tasks.`;

    // Send message to Claude with memory and learning
    const response = await claudeApiService.sendMessage(
      userId,
      agentName,
      finalConversationId,
      message,
      systemPrompt,
      tools
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

    const userId = (req.user as any).id;
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

    const userId = (req.user as any).id;
    const conversationId = `${agentName}-${userId}-${Date.now()}`;

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