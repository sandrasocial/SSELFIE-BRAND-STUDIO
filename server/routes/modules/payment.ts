/**
 * Payment Routes - Maya-Only Architecture
 * API routes for Stripe payment processing and subscription management
 */

import { Router, Request, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { PaymentProcessingService } from '../../services/payment-processing.js';
import { storage } from '../../storage.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import type { AuthenticatedRequest } from '../../types/ai-generation.js';
import type {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  CreatePaymentSessionRequest
} from '../../../shared/types/payment.js';

const router = Router();

// === Subscription Management ===

/**
 * Get current user subscription
 */
router.get('/api/subscription', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const subscription = await storage.getUserSubscription(userId);
    
    sendSuccess(res, {
      subscription: subscription || null
    });
  } catch (error) {
    console.error('❌ Get subscription failed:', error);
    throw createError.internal('Failed to fetch subscription');
  }
}));

/**
 * Create new subscription
 */
router.post('/api/subscription', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: CreateSubscriptionRequest }, res: Response) => {
  const userId = req.user.id;
  const { planId, paymentMethodId, couponCode, trialDays, metadata } = req.body;

  validateRequired({ planId }, ['planId']);

  try {
    const result = await PaymentProcessingService.createSubscription(userId, {
      planId,
      paymentMethodId,
      couponCode,
      trialDays,
      metadata
    });

    if (result.success) {
      sendSuccess(res, {
        subscription: result.data,
        clientSecret: result.clientSecret,
        redirectUrl: result.redirectUrl
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Create subscription failed:', error);
    throw createError.internal('Failed to create subscription');
  }
}));

/**
 * Update existing subscription
 */
router.put('/api/subscription/:id', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: UpdateSubscriptionRequest }, res: Response) => {
  const userId = req.user.id;
  const subscriptionId = req.params.id;
  const { planId, paymentMethodId, cancelAtPeriodEnd, prorationBehavior } = req.body;

  try {
    // Verify subscription belongs to user
    const subscription = await storage.getSubscription(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw createError.notFound('Subscription not found');
    }

    const result = await PaymentProcessingService.updateSubscription(subscriptionId, {
      planId,
      paymentMethodId,
      cancelAtPeriodEnd,
      prorationBehavior
    });

    if (result.success) {
      sendSuccess(res, {
        subscription: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Update subscription failed:', error);
    throw createError.internal('Failed to update subscription');
  }
}));

/**
 * Cancel subscription
 */
router.post('/api/subscription/:id/cancel', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const subscriptionId = req.params.id;

  try {
    // Verify subscription belongs to user
    const subscription = await storage.getSubscription(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw createError.notFound('Subscription not found');
    }

    const result = await PaymentProcessingService.cancelSubscription(subscriptionId);

    if (result.success) {
      sendSuccess(res, {
        subscription: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Cancel subscription failed:', error);
    throw createError.internal('Failed to cancel subscription');
  }
}));

/**
 * Resume cancelled subscription
 */
router.post('/api/subscription/:id/resume', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const subscriptionId = req.params.id;

  try {
    // Verify subscription belongs to user
    const subscription = await storage.getSubscription(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw createError.notFound('Subscription not found');
    }

    const result = await PaymentProcessingService.resumeSubscription(subscriptionId);

    if (result.success) {
      sendSuccess(res, {
        subscription: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Resume subscription failed:', error);
    throw createError.internal('Failed to resume subscription');
  }
}));

// === Payment Methods ===

/**
 * Get user's payment methods
 */
router.get('/api/payment-methods', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const paymentMethods = await storage.getUserPaymentMethods(userId);
    
    sendSuccess(res, {
      paymentMethods: paymentMethods || []
    });
  } catch (error) {
    console.error('❌ Get payment methods failed:', error);
    throw createError.internal('Failed to fetch payment methods');
  }
}));

/**
 * Add new payment method
 */
router.post('/api/payment-methods', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: CreatePaymentMethodRequest }, res: Response) => {
  const userId = req.user.id;
  const { type, card, billing, setAsDefault } = req.body;

  validateRequired({ type, billing }, ['type', 'billing']);

  try {
    // This would typically involve Stripe setup intent
    // For now, we'll create a placeholder implementation
    const paymentMethod = {
      id: `pm_${Date.now()}`,
      userId,
      stripePaymentMethodId: `pm_stripe_${Date.now()}`,
      type,
      card,
      billing,
      isDefault: setAsDefault || false,
      createdAt: new Date()
    };

    await storage.savePaymentMethod(paymentMethod);

    sendSuccess(res, {
      paymentMethod
    });
  } catch (error) {
    console.error('❌ Add payment method failed:', error);
    throw createError.internal('Failed to add payment method');
  }
}));

/**
 * Remove payment method
 */
router.delete('/api/payment-methods/:id', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const paymentMethodId = req.params.id;

  try {
    // Verify payment method belongs to user
    const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw createError.notFound('Payment method not found');
    }

    await storage.deletePaymentMethod(paymentMethodId);

    sendSuccess(res, {
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    console.error('❌ Remove payment method failed:', error);
    throw createError.internal('Failed to remove payment method');
  }
}));

/**
 * Set default payment method
 */
router.post('/api/payment-methods/:id/default', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const paymentMethodId = req.params.id;

  try {
    // Verify payment method belongs to user
    const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw createError.notFound('Payment method not found');
    }

    await storage.setDefaultPaymentMethod(userId, paymentMethodId);

    sendSuccess(res, {
      message: 'Default payment method updated'
    });
  } catch (error) {
    console.error('❌ Set default payment method failed:', error);
    throw createError.internal('Failed to set default payment method');
  }
}));

// === Payment Sessions (Checkout) ===

/**
 * Create payment session for checkout
 */
router.post('/api/payment-sessions', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: CreatePaymentSessionRequest }, res: Response) => {
  const userId = req.user.id;
  const { type, successUrl, cancelUrl, planId, amount, metadata } = req.body;

  validateRequired({ type, successUrl, cancelUrl }, ['type', 'successUrl', 'cancelUrl']);

  try {
    const session = await PaymentProcessingService.createPaymentSession(userId, {
      type,
      successUrl,
      cancelUrl,
      planId,
      amount,
      metadata
    });

    sendSuccess(res, {
      session
    });
  } catch (error) {
    console.error('❌ Create payment session failed:', error);
    throw createError.internal('Failed to create payment session');
  }
}));

// === Invoices ===

/**
 * Get user's invoices
 */
router.get('/api/invoices', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { limit = 10, offset = 0 } = req.query;

  try {
    const invoices = await storage.getUserInvoices(userId, {
      limit: Number(limit),
      offset: Number(offset)
    });

    sendSuccess(res, {
      invoices: invoices || [],
      hasMore: invoices.length === Number(limit)
    });
  } catch (error) {
    console.error('❌ Get invoices failed:', error);
    throw createError.internal('Failed to fetch invoices');
  }
}));

/**
 * Download invoice PDF
 */
router.get('/api/invoices/:id/download', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const invoiceId = req.params.id;

  try {
    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice || invoice.userId !== userId) {
      throw createError.notFound('Invoice not found');
    }

    if (!invoice.downloadUrl) {
      throw createError.badRequest('Invoice download not available');
    }

    // Redirect to Stripe's invoice PDF
    res.redirect(invoice.downloadUrl);
  } catch (error) {
    console.error('❌ Download invoice failed:', error);
    throw createError.internal('Failed to download invoice');
  }
}));

// === Usage Tracking ===

/**
 * Get current usage summary
 */
router.get('/api/usage', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { period = 'current' } = req.query;

  try {
    const usage = await storage.getUserUsage(userId, period as string);

    sendSuccess(res, {
      usage: usage || {
        images: { used: 0, limit: 0, remaining: 0 },
        videos: { used: 0, limit: 0, remaining: 0 },
        storage: { used: 0, limit: 0, remaining: 0 }
      }
    });
  } catch (error) {
    console.error('❌ Get usage failed:', error);
    throw createError.internal('Failed to fetch usage');
  }
}));

// === Webhook Handling ===

/**
 * Handle Stripe webhooks
 */
router.post('/api/webhooks/stripe', asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    throw createError.badRequest('Missing Stripe signature');
  }

  try {
    await PaymentProcessingService.handleWebhook(
      req.body,
      signature
    );

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handling failed:', error);
    throw createError.badRequest('Webhook validation failed');
  }
}));

export default router;