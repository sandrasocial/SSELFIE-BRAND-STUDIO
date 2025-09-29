import { Router } from 'express';
import { asyncHandler, sendSuccess, validateRequired } from '../middleware/error-handler.js';
const router = Router();
router.post('/api/claude/chat', asyncHandler(async (req, res) => {
    const { message, conversationId, agentId } = req.body;
    validateRequired({ message }, ['message']);
    const response = "Hello! I'm Claude, your AI assistant. How can I help you today?";
    const responseData = {
        data: {
            response,
            conversationId: conversationId || `conv_${Date.now()}`
        }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/claude/conversations/:agentId', asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const conversations = [];
    const responseData = {
        data: {
            conversations,
            count: conversations.length
        }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/claude/conversation/:conversationId', asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const conversation = {
        id: conversationId,
        agentId: 'test_agent',
        messages: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const responseData = {
        data: { conversation }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/claude/conversation', asyncHandler(async (req, res) => {
    const { agentId, title } = req.body;
    validateRequired({ agentId }, ['agentId']);
    const conversationId = `conv_${Date.now()}`;
    const responseData = {
        data: { conversationId },
        message: 'Conversation created successfully'
    };
    sendSuccess(res, responseData, 'Conversation created successfully', 201);
}));
router.post('/api/claude/conversation/end', asyncHandler(async (req, res) => {
    const { conversationId } = req.body;
    validateRequired({ conversationId }, ['conversationId']);
    const responseData = {
        data: { success: true },
        message: 'Conversation ended successfully'
    };
    sendSuccess(res, responseData);
}));
export default router;
//# sourceMappingURL=claude.js.map