import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, sendSuccess } from '../middleware/error-handler.js';
const router = Router();
router.get('/api/usage/stats', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const stats = { userId, requests: 0, tokens: 0, images: 0 };
    sendSuccess(res, { stats });
}));
router.get('/api/usage/history', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { period = '30d' } = req.query;
    const history = [];
    sendSuccess(res, { history, period });
}));
router.get('/api/usage/limits', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limits = {
        requests: 1000,
        tokens: 100000,
        images: 100,
        used: { requests: 0, tokens: 0, images: 0 }
    };
    sendSuccess(res, { limits });
}));
router.get('/api/usage/analytics', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const analytics = {
        totalRequests: 0,
        totalTokens: 0,
        totalImages: 0,
        dailyUsage: []
    };
    sendSuccess(res, { analytics });
}));
router.get('/api/usage/breakdown', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const breakdown = {
        byFeature: { chat: 0, images: 0, videos: 0 },
        byTime: { hourly: [], daily: [] }
    };
    sendSuccess(res, { breakdown });
}));
export default router;
//# sourceMappingURL=usage.js.map