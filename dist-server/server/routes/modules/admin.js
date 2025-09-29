import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { adminContextDetection } from '../../middleware/admin-context.js';
import { asyncHandler, sendSuccess } from '../middleware/error-handler.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/api/admin/validate-all-models', requireStackAuth, adminContextDetection, asyncHandler(async (req, res) => {
    const responseData = {
        data: { success: true },
        message: 'Admin validate all models endpoint (placeholder)'
    };
    sendSuccess(res, responseData);
}));
router.post('/api/consulting-agents/admin/consulting-chat', requireAdmin, asyncHandler(async (req, res) => {
    const responseData = {
        data: { success: true },
        message: 'Admin consulting chat endpoint (placeholder)'
    };
    sendSuccess(res, responseData);
}));
router.post('/api/admin/consulting-chat', requireAdmin, asyncHandler(async (req, res) => {
    const responseData = {
        data: { success: true },
        message: 'Admin consulting chat endpoint (alternative path, placeholder)'
    };
    sendSuccess(res, responseData);
}));
export default router;
//# sourceMappingURL=admin.js.map