/**
 * Admin Routes Module
 * Handles administrative functions and system management
 */

import { Router, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { adminContextDetection } from '../../middleware/admin-context.js';
import { asyncHandler, createError, sendSuccess } from '../middleware/error-handler.js';
import { requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest, SuccessResponse } from '../../../shared/types/ai-generation.js';

// Extended request type for admin routes
interface AdminRequest extends AuthenticatedRequest {
  isAdmin: boolean;
}

const router = Router();

// Admin dashboard/validation routes
router.get('/api/admin/validate-all-models', requireStackAuth, adminContextDetection, asyncHandler(async (req: AdminRequest, res: Response) => {
  // Logic for validating all models
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Admin validate all models endpoint (placeholder)'
  };
  sendSuccess(res, responseData);
}));

interface ConsultingChatRequest {
  message: string;
  context?: Record<string, unknown>;
}

// Admin consulting chat routes
router.post('/api/consulting-agents/admin/consulting-chat', requireAdmin, asyncHandler(async (req: AdminRequest & { body: ConsultingChatRequest }, res: Response) => {
  // Logic for admin consulting chat
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Admin consulting chat endpoint (placeholder)'
  };
  sendSuccess(res, responseData);
}));

router.post('/api/admin/consulting-chat', requireAdmin, asyncHandler(async (req: AdminRequest & { body: ConsultingChatRequest }, res: Response) => {
  // Logic for admin consulting chat (alternative path)
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Admin consulting chat endpoint (alternative path, placeholder)'
  };
  sendSuccess(res, responseData);
}));

export default router;