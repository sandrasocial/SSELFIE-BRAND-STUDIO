import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
const router = Router();
router.post('/api/agent-protocol', asyncHandler(async (req, res) => {
    const { protocol, version, data } = req.body;
    validateRequired({ protocol, version }, ['protocol', 'version']);
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
        throw createError.validation('Invalid protocol version format. Must be semver (e.g., 1.0.0)');
    }
    const protocolId = `protocol_${Date.now()}`;
    const responseData = {
        data: { protocolId },
        message: 'Protocol registered successfully'
    };
    sendSuccess(res, responseData, 'Protocol registered successfully', 201);
}));
router.get('/api/agent-protocol/:agentId', asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const status = {
        agentId,
        status: 'active',
        lastSeen: new Date().toISOString()
    };
    const responseData = {
        data: { status }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/agent-protocol/:agentId/capabilities', asyncHandler(async (req, res) => {
    const { agentId: bodyAgentId, capabilities, metadata } = req.body;
    const { agentId: pathAgentId } = req.params;
    validateRequired({ agentId: bodyAgentId, capabilities }, ['agentId', 'capabilities']);
    if (bodyAgentId !== pathAgentId) {
        throw createError.validation('Agent ID in body must match Agent ID in path');
    }
    const responseData = {
        data: { success: true },
        message: 'Capabilities updated successfully'
    };
    sendSuccess(res, responseData);
}));
router.post('/api/agent-protocol/:agentId/message', asyncHandler(async (req, res) => {
    const { agentId: bodyAgentId, message, type } = req.body;
    const { agentId: pathAgentId } = req.params;
    validateRequired({ agentId: bodyAgentId, message }, ['agentId', 'message']);
    if (bodyAgentId !== pathAgentId) {
        throw createError.validation('Agent ID in body must match Agent ID in path');
    }
    const messageId = `msg_${Date.now()}`;
    const responseData = {
        data: { messageId },
        message: 'Message sent successfully'
    };
    sendSuccess(res, responseData, 'Message sent successfully', 201);
}));
router.get('/api/agents', requireStackAuth, asyncHandler(async (req, res) => {
    const responseData = {
        data: { agents: [], count: 0 }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/agents/:agentId', requireStackAuth, asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const agent = {
        id: agentId,
        name: 'Test Agent',
        status: 'active'
    };
    const responseData = {
        data: { agent }
    };
    sendSuccess(res, responseData);
}));
router.put('/api/agents/:agentId', requireStackAuth, asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const { name, status, config } = req.body;
    if (name === undefined && status === undefined && config === undefined) {
        throw createError.validation('At least one of name, status, or config must be provided');
    }
    if (status && !['active', 'inactive', 'error'].includes(status)) {
        throw createError.validation('Invalid status. Must be one of: active, inactive, error');
    }
    const responseData = {
        data: { success: true },
        message: 'Agent updated successfully'
    };
    sendSuccess(res, responseData);
}));
export default router;
//# sourceMappingURL=agent-protocol.js.map