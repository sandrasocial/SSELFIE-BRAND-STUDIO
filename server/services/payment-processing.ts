/**
 * Payment Processing Service - Maya-Only Architecture
 * Stripe integration for subscription management and payments
 */

import Stripe from 'stripe';
import { storage } from '../storage.js';
import type {
  Subscription,
  PaymentMethod,
  PaymentSession,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  CreatePaymentSessionRequest,
  PaymentResponse,
  PaymentError,
  Invoice,
  StripeWebhookEvent,
  UsageRecord,
  SubscriptionPlan
} from '../../shared/types/payment.js';

// Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_123';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_123';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true
});

// Subscription plans configuration
const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  'sselfie-studio': {
    id: 'sselfie-studio',
    name: 'SSELFIE Studio',
    description: 'Professional AI photos with Maya creative director',
    price: { amount: 4700, currency: 'EUR', formatted: '€47.00' }, // €47.00 in cents
    billingInterval: 'month',
    trialDays: 7,
    features: [
      { id: 'unlimited-generations', name: 'Unlimited Photo Generations', description: 'Generate professional photos without limits', type: 'boolean', value: true },
      { id: 'maya-ai-stylist', name: 'Maya AI Creative Director', description: 'Personal AI stylist for brand consistency', type: 'boolean', value: true },
      { id: 'all-styles', name: 'All Photo Styles', description: 'Business, lifestyle, editorial, luxury styles', type: 'boolean', value: true },
      { id: 'high-resolution', name: 'High Resolution Export', description: '4K quality professional photos', type: 'boolean', value: true },
      { id: 'priority-support', name: 'Priority Support', description: 'Fast response customer support', type: 'boolean', value: true }
    ],
    limits: {
      imagesPerMonth: -1, // Unlimited
      videosPerMonth: 10,
      storageGB: 50,
      maxConcurrentGenerations: 5,
      supportLevel: 'priority',
      advancedFeatures: true
    },
    isPopular: true,
    isEnterprise: false,
    stripePriceId: process.env.STRIPE_PRICE_ID_STUDIO || 'price_123',
    stripeProductId: process.env.STRIPE_PRODUCT_ID_STUDIO || 'prod_123'
  }
};

export class PaymentProcessingService {
  /**
   * Create a new subscription for a user
   */
  static async createSubscription(
    userId: string, 
    request: CreateSubscriptionRequest
  ): Promise<PaymentResponse> {
    try {
      const plan = SUBSCRIPTION_PLANS[request.planId];
      if (!plan) {
        return {
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Invalid subscription plan.',
            type: 'validation'
          }
        };
      }

      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(userId);

      // Create subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: request.trialDays || plan.trialDays,
        coupon: request.couponCode,
        metadata: {
          userId,
          planId: request.planId,
          ...request.metadata
        }
      });

      // Save subscription to database
      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customer.id,
        plan,
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : undefined,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        credits: {
          images: {
            total: plan.limits.imagesPerMonth,
            used: 0,
            remaining: plan.limits.imagesPerMonth === -1 ? -1 : plan.limits.imagesPerMonth,
            resetDate: new Date(stripeSubscription.current_period_end * 1000)
          },
          videos: {
            total: plan.limits.videosPerMonth,
            used: 0,
            remaining: plan.limits.videosPerMonth,
            resetDate: new Date(stripeSubscription.current_period_end * 1000)
          }
        },
        features: plan.features,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storage.saveSubscription(subscription);

      // Get client secret for payment intent
      const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      return {
        success: true,
        data: subscription,
        clientSecret: paymentIntent?.client_secret
      };

    } catch (error) {
      console.error('❌ Create subscription failed:', error);
      return {
        success: false,
        error: this.handleStripeError(error)
      };
    }
  }

  /**
   * Update an existing subscription
   */
  static async updateSubscription(
    subscriptionId: string,
    request: UpdateSubscriptionRequest
  ): Promise<PaymentResponse> {
    try {
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'Subscription not found.',
            type: 'validation'
          }
        };
      }

      const updateData: Stripe.SubscriptionUpdateParams = {};

      // Update plan if provided
      if (request.planId && request.planId !== subscription.plan.id) {
        const newPlan = SUBSCRIPTION_PLANS[request.planId];
        if (!newPlan) {
          return {
            success: false,
            error: {
              code: 'PLAN_NOT_FOUND',
              message: 'Invalid subscription plan.',
              type: 'validation'
            }
          };
        }

        updateData.items = [{
          id: subscription.stripeSubscriptionId,
          price: newPlan.stripePriceId
        }];
        updateData.proration_behavior = request.prorationBehavior || 'create_prorations';
      }

      // Update payment method if provided
      if (request.paymentMethodId) {
        updateData.default_payment_method = request.paymentMethodId;
      }

      // Update cancellation settings
      if (request.cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = request.cancelAtPeriodEnd;
      }

      // Update Stripe subscription
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        updateData
      );

      // Update local subscription
      const updatedSubscription: Subscription = {
        ...subscription,
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        updatedAt: new Date()
      };

      await storage.saveSubscription(updatedSubscription);

      return {
        success: true,
        data: updatedSubscription
      };

    } catch (error) {
      console.error('❌ Update subscription failed:', error);
      return {
        success: false,
        error: this.handleStripeError(error)
      };
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<PaymentResponse> {
    try {
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'Subscription not found.',
            type: 'validation'
          }
        };
      }

      // Cancel at period end to maintain access until billing cycle ends
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true
        }
      );

      // Update local subscription
      const updatedSubscription: Subscription = {
        ...subscription,
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      };

      await storage.saveSubscription(updatedSubscription);

      return {
        success: true,
        data: updatedSubscription
      };

    } catch (error) {
      console.error('❌ Cancel subscription failed:', error);
      return {
        success: false,
        error: this.handleStripeError(error)
      };
    }
  }

  /**
   * Resume a cancelled subscription
   */
  static async resumeSubscription(subscriptionId: string): Promise<PaymentResponse> {
    try {
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'Subscription not found.',
            type: 'validation'
          }
        };
      }

      // Resume subscription by removing cancellation
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false
        }
      );

      // Update local subscription
      const updatedSubscription: Subscription = {
        ...subscription,
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      };

      await storage.saveSubscription(updatedSubscription);

      return {
        success: true,
        data: updatedSubscription
      };

    } catch (error) {
      console.error('❌ Resume subscription failed:', error);
      return {
        success: false,
        error: this.handleStripeError(error)
      };
    }
  }

  /**
   * Create a payment session for checkout
   */
  static async createPaymentSession(
    userId: string,
    request: CreatePaymentSessionRequest
  ): Promise<PaymentSession> {
    try {
      // Get or create customer
      const customer = await this.getOrCreateCustomer(userId);

      let sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customer.id,
        mode: request.type === 'subscription' ? 'subscription' : 'payment',
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        metadata: {
          userId,
          type: request.type,
          ...request.metadata
        }
      };

      // Configure based on session type
      if (request.type === 'subscription' && request.planId) {
        const plan = SUBSCRIPTION_PLANS[request.planId];
        if (!plan) {
          throw new Error('Invalid subscription plan');
        }

        sessionParams.line_items = [{
          price: plan.stripePriceId,
          quantity: 1
        }];
        
        if (plan.trialDays) {
          sessionParams.subscription_data = {
            trial_period_days: plan.trialDays
          };
        }
      } else if (request.type === 'one_time' && request.amount) {
        sessionParams.line_items = [{
          price_data: {
            currency: request.amount.currency,
            product_data: {
              name: 'SSELFIE Studio Credits'
            },
            unit_amount: request.amount.amount
          },
          quantity: 1
        }];
      } else if (request.type === 'setup') {
        sessionParams.mode = 'setup';
        sessionParams.setup_intent_data = {
          metadata: { userId }
        };
      }

      // Create Stripe checkout session
      const stripeSession = await stripe.checkout.sessions.create(sessionParams);

      // Create payment session record
      const paymentSession: PaymentSession = {
        id: `session_${Date.now()}`,
        userId,
        type: request.type,
        stripeSessionId: stripeSession.id,
        url: stripeSession.url!,
        status: 'open',
        successUrl: request.successUrl,
        cancelUrl: request.cancelUrl,
        expiresAt: new Date(stripeSession.expires_at * 1000),
        metadata: request.metadata,
        createdAt: new Date()
      };

      await storage.savePaymentSession(paymentSession);

      return paymentSession;

    } catch (error) {
      console.error('❌ Create payment session failed:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(
    body: string,
    signature: string
  ): Promise<void> {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      ) as StripeWebhookEvent;

      console.log(`🔔 Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object);
          break;

        default:
          console.log(`🤷 Unhandled webhook type: ${event.type}`);
      }

    } catch (error) {
      console.error('❌ Webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Get or create Stripe customer for user
   */
  private static async getOrCreateCustomer(userId: string): Promise<Stripe.Customer> {
    const user = await storage.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if customer already exists
    if (user.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (!customer.deleted) {
          return customer as Stripe.Customer;
        }
      } catch (error) {
        console.warn('Existing Stripe customer not found, creating new one');
      }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
      metadata: { userId }
    });

    // Save customer ID to user
    await storage.updateUser(userId, { stripeCustomerId: customer.id });

    return customer;
  }

  /**
   * Map Stripe subscription status to our status
   */
  private static mapStripeStatus(stripeStatus: string): Subscription['status'] {
    const statusMap: Record<string, Subscription['status']> = {
      'active': 'active',
      'past_due': 'past_due',
      'unpaid': 'unpaid',
      'canceled': 'canceled',
      'incomplete': 'incomplete',
      'incomplete_expired': 'incomplete_expired',
      'trialing': 'trialing',
      'paused': 'paused'
    };

    return statusMap[stripeStatus] || 'incomplete';
  }

  /**
   * Handle Stripe errors
   */
  private static handleStripeError(error: any): PaymentError {
    if (error.type === 'StripeCardError') {
      return {
        code: 'CARD_DECLINED',
        message: error.message,
        type: 'payment',
        details: { stripeCode: error.code }
      };
    }

    if (error.type === 'StripeInvalidRequestError') {
      return {
        code: 'INVALID_REQUEST',
        message: error.message,
        type: 'validation',
        details: { stripeCode: error.code }
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Payment processing failed',
      type: 'api_error'
    };
  }

  /**
   * Webhook handlers
   */
  private static async handleSubscriptionUpdate(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    // Update subscription in database
    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (existingSubscription) {
      const updatedSubscription: Subscription = {
        ...existingSubscription,
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
      };

      await storage.saveSubscription(updatedSubscription);
    }
  }

  private static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const existingSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    if (existingSubscription) {
      const updatedSubscription: Subscription = {
        ...existingSubscription,
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date()
      };

      await storage.saveSubscription(updatedSubscription);
    }
  }

  private static async handlePaymentSucceeded(invoice: any): Promise<void> {
    console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
    // Reset usage counters, send success email, etc.
  }

  private static async handlePaymentFailed(invoice: any): Promise<void> {
    console.log(`❌ Payment failed for invoice: ${invoice.id}`);
    // Send payment failed email, update subscription status, etc.
  }

  private static async handleTrialWillEnd(subscription: any): Promise<void> {
    console.log(`⏰ Trial ending soon for subscription: ${subscription.id}`);
    // Send trial ending notification
  }
}