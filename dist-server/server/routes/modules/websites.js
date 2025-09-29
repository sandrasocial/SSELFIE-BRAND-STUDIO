import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess } from '../middleware/error-handler.js';
const router = Router();
router.get('/api/websites', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    sendSuccess(res, {
        websites: [],
        count: 0
    });
}));
router.post('/api/websites', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, url, description } = req.body;
    if (!name || !url) {
        throw createError.validation("Name and URL are required");
    }
    sendSuccess(res, {
        message: 'Website created successfully',
        website: {
            id: `website_${Date.now()}`,
            name,
            url,
            description,
            userId
        }
    });
}));
router.put('/api/websites/:id', requireStackAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    sendSuccess(res, {
        message: 'Website updated successfully',
        websiteId: id
    });
}));
router.delete('/api/websites/:id', requireStackAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    sendSuccess(res, {
        message: 'Website deleted successfully',
        websiteId: id
    });
}));
router.post('/api/websites/:id/refresh-screenshot', requireStackAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    sendSuccess(res, {
        message: 'Screenshot refresh initiated',
        websiteId: id
    });
}));
router.post('/api/save-brand-assessment', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const assessmentData = req.body;
    sendSuccess(res, {
        message: 'Brand assessment saved successfully',
        assessmentId: `assessment_${Date.now()}`
    });
}));
export default router;
//# sourceMappingURL=websites.js.map