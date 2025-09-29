import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError } from '../middleware/error-handler.js';
import { EmailService } from '../../email-service.js';
import type { AuthenticatedRequest } from '../../types/ai-generation.js';

const router = Router();

// Send welcome email after payment
router.post('/api/send-welcome-email', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { email, firstName } = req.body;
  
  if (!email) {
    throw createError.validation('Email is required');
  }
  
  const result = await EmailService.sendModelReadyEmail(email, firstName);
  
  if (result.success) {
    res.json({ success: true, emailId: result.emailId });
  } else {
    throw createError.internal('Failed to send welcome email');
  }
}));

// Send training start email
router.post('/api/send-training-email', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { email, firstName } = req.body;
  
  if (!email) {
    throw createError.validation('Email is required');
  }
  
  const result = await EmailService.sendTrainingStartedEmail(email, firstName);
  
  if (result.success) {
    res.json({ success: true, emailId: result.emailId });
  } else {
    throw createError.internal('Failed to send training email');
  }
}));

export default router;