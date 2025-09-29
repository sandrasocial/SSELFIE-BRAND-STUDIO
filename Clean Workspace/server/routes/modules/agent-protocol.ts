/**
 * Agent Protocol Routes
 * Handles agent communication and protocol management
 */

import { Router, Request, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import {
  AgentProtocolRegistration,
  AgentCapabilities,
  AgentMessage,
  Agent,
  AgentStatus,
  AgentUpdate,
  AuthenticatedRequest,
  SuccessResponse,
  ErrorResponse
} from '../../types/agent-protocol.js';

const router = Router();

// Register agent protocol
router.post('/api/agent-protocol', asyncHandler(async (req: Request & { body: AgentProtocolRegistration }, res: Response) => {
  const { protocol, version, data } = req.body;
  validateRequired({ protocol, version }, ['protocol', 'version']);

  // Validate protocol version format
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw createError.validation('Invalid protocol version format. Must be semver (e.g., 1.0.0)');
  }

  // Mock implementation - replace with actual protocol service
  const protocolId = `protocol_${Date.now()}`;
  const responseData: SuccessResponse<{ protocolId: string }> = {
    data: { protocolId },
    message: 'Protocol registered successfully'
  };
  sendSuccess(res, responseData, 'Protocol registered successfully', 201);
}));

// Get agent status
router.get('/api/agent-protocol/:agentId', asyncHandler(async (req: Request, res: Response) => {
  const { agentId } = req.params;

  // Mock implementation - replace with actual agent service
  const status: AgentStatus = {
    agentId,
    status: 'active',
    lastSeen: new Date().toISOString()
  };
  const responseData: SuccessResponse<{ status: AgentStatus }> = {
    data: { status }
  };
  sendSuccess(res, responseData);
}));

// Update agent capabilities
router.post('/api/agent-protocol/:agentId/capabilities', asyncHandler(async (req: Request & { body: AgentCapabilities }, res: Response) => {
  const { agentId: bodyAgentId, capabilities, metadata } = req.body;
  const { agentId: pathAgentId } = req.params;
  
  validateRequired({ agentId: bodyAgentId, capabilities }, ['agentId', 'capabilities']);
  
  // Ensure body agentId matches path agentId
  if (bodyAgentId !== pathAgentId) {
    throw createError.validation('Agent ID in body must match Agent ID in path');
  }

  // Mock implementation - replace with actual capability service
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Capabilities updated successfully'
  };
  sendSuccess(res, responseData);
}));

// Send message to agent
router.post('/api/agent-protocol/:agentId/message', asyncHandler(async (req: Request & { body: AgentMessage }, res: Response) => {
  const { agentId: bodyAgentId, message, type } = req.body;
  const { agentId: pathAgentId } = req.params;
  
  validateRequired({ agentId: bodyAgentId, message }, ['agentId', 'message']);
  
  // Ensure body agentId matches path agentId
  if (bodyAgentId !== pathAgentId) {
    throw createError.validation('Agent ID in body must match Agent ID in path');
  }

  // Mock implementation - replace with actual messaging service
  const messageId = `msg_${Date.now()}`;
  const responseData: SuccessResponse<{ messageId: string }> = {
    data: { messageId },
    message: 'Message sent successfully'
  };
  sendSuccess(res, responseData, 'Message sent successfully', 201);
}));

// List all agents
router.get('/api/agents', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Mock implementation - replace with actual agent service
  const responseData: SuccessResponse<{ agents: Agent[]; count: number }> = {
    data: { agents: [], count: 0 }
  };
  sendSuccess(res, responseData);
}));

// Get agent details
router.get('/api/agents/:agentId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { agentId } = req.params;

  // Mock implementation - replace with actual agent service
  const agent: Agent = {
    id: agentId,
    name: 'Test Agent',
    status: 'active'
  };
  const responseData: SuccessResponse<{ agent: Agent }> = {
    data: { agent }
  };
  sendSuccess(res, responseData);
}));

// Update agent
router.put('/api/agents/:agentId', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: AgentUpdate }, res: Response) => {
  const { agentId } = req.params;
  const { name, status, config } = req.body;

  // Validate required fields based on what's being updated
  if (name === undefined && status === undefined && config === undefined) {
    throw createError.validation('At least one of name, status, or config must be provided');
  }

  // Validate status if provided
  if (status && !['active', 'inactive', 'error'].includes(status)) {
    throw createError.validation('Invalid status. Must be one of: active, inactive, error');
  }

  // Mock implementation - replace with actual agent service
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Agent updated successfully'
  };
  sendSuccess(res, responseData);
}));

export default router;