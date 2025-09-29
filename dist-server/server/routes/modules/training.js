import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, sendSuccess, validateRequired } from '../middleware/error-handler.js';
const router = Router();
router.get('/api/training/status', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const status = { userId, status: 'idle', lastTraining: null };
    const responseData = {
        data: { status }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/training/request/:requestId', requireStackAuth, asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const request = { id: requestId, status: 'completed', progress: 100 };
    const responseData = {
        data: { request }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/training/start', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { modelType, data } = req.body;
    validateRequired({ modelType, data }, ['modelType', 'data']);
    const trainingId = `training_${Date.now()}`;
    const responseData = {
        data: { trainingId },
        message: 'Training started successfully'
    };
    sendSuccess(res, responseData, 'Training started successfully', 202);
}));
router.post('/api/training/stop', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { trainingId } = req.body;
    validateRequired({ trainingId }, ['trainingId']);
    const responseData = {
        data: { success: true },
        message: 'Training stopped successfully'
    };
    sendSuccess(res, responseData);
}));
router.post('/api/training/validate', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { data } = req.body;
    validateRequired({ data }, ['data']);
    const validation = { valid: true, errors: [] };
    const responseData = {
        data: { validation }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/training/metrics', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { trainingId } = req.body;
    validateRequired({ trainingId }, ['trainingId']);
    const metrics = { accuracy: 0.95, loss: 0.05, epoch: 10 };
    const responseData = {
        data: { metrics }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/training/consolidate/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    validateRequired({ userId }, ['userId']);
    const responseData = {
        data: { success: true },
        message: 'Data consolidation initiated'
    };
    sendSuccess(res, responseData);
}));
router.get('/api/training/consolidation/status', asyncHandler(async (_req, res) => {
    const responseData = {
        data: {
            status: 'healthy',
            lastConsolidation: new Date().toISOString()
        }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/training/memory/audit', asyncHandler(async (_req, res) => {
    const audit = {
        totalMemory: '1GB',
        usedMemory: '500MB',
        freeMemory: '500MB'
    };
    const responseData = {
        data: { audit }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/training/memory/cleanup/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    validateRequired({ userId }, ['userId']);
    const responseData = {
        data: { success: true },
        message: 'Memory cleanup completed'
    };
    sendSuccess(res, responseData);
}));
export default router;
//# sourceMappingURL=training.js.map