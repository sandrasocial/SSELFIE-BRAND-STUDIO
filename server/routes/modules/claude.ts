/**
 * Claude Routes
 * Handles Claude AI interactions
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler';
import { AuthenticatedRequest } from '../../api/_shared/auth-types';
import { SuccessResponse } from '../../types/ai-generation';

interface ClaudeMessage {
  message: string;
  conversationId?: string;
  agentId?: string;
}

interface ClaudeConversation {
  id: string;
  agentId: string;
  title?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  status: 'active' | 'ended';
  createdAt: string;
  updatedAt: string;
}

interface ClaudeCreateConversation {
  agentId: string;
  title?: string;
}

interface ClaudeEndConversation {
  conversationId: string;
}

const router = Router();

// Send message to Claude
router.post('/api/claude/chat', asyncHandler(async (req: AuthenticatedRequest & { body: ClaudeMessage }, res: Response) => {
  const { message, conversationId, agentId } = req.body;
  validateRequired({ message }, ['message']);

  // Mock implementation - replace with actual Claude service
  const response = "Hello! I'm Claude, your AI assistant. How can I help you today?";
  
  const responseData: SuccessResponse<{
    response: string;
    conversationId: string;
  }> = {
    data: {
      response,
      conversationId: conversationId || `conv_${Date.now()}`
    }
  };
  
  sendSuccess(res, responseData);
}));

// Get Claude conversations
router.get('/api/claude/conversations/:agentId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { agentId } = req.params;

  // Mock implementation - replace with actual Claude service
  const conversations: ClaudeConversation[] = [];
  
  const responseData: SuccessResponse<{
    conversations: ClaudeConversation[];
    count: number;
  }> = {
    data: {
      conversations,
      count: conversations.length
    }
  };
  
  sendSuccess(res, responseData);
}));

// Get specific conversation
router.get('/api/claude/conversation/:conversationId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { conversationId } = req.params;

  // Mock implementation - replace with actual Claude service
  const conversation: ClaudeConversation = {
    id: conversationId,
    agentId: 'test_agent',
    messages: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const responseData: SuccessResponse<{
    conversation: ClaudeConversation;
  }> = {
    data: { conversation }
  };
  
  sendSuccess(res, responseData);
}));

// Create new conversation
router.post('/api/claude/conversation', asyncHandler(async (req: AuthenticatedRequest & { body: ClaudeCreateConversation }, res: Response) => {
  const { agentId, title } = req.body;
  validateRequired({ agentId }, ['agentId']);

  // Mock implementation - replace with actual Claude service
  const conversationId = `conv_${Date.now()}`;
  
  const responseData: SuccessResponse<{
    conversationId: string;
  }> = {
    data: { conversationId },
    message: 'Conversation created successfully'
  };
  
  sendSuccess(res, responseData, 'Conversation created successfully', 201);
}));

// End conversation
router.post('/api/claude/conversation/end', asyncHandler(async (req: AuthenticatedRequest & { body: ClaudeEndConversation }, res: Response) => {
  const { conversationId } = req.body;
  validateRequired({ conversationId }, ['conversationId']);

  // Mock implementation - replace with actual Claude service
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Conversation ended successfully'
  };
  
  sendSuccess(res, responseData);
}));

export default router;