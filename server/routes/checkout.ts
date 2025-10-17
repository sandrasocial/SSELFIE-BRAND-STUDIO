import type { Express, Request, Response } from "express";
import { requireStackAuth } from '../stack-auth.js';
import { storage } from "../storage.js";
// import { sendWelcomeEmail } from "../email-service.js";

import Stripe from "stripe";

// Type definitions for checkout routes
interface RetrainCheckoutRequest {
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSessionRequest {
  successUrl: string;
  cancelUrl: string;
  plan?: string;
  customerEmail?: string;
}

interface EmbeddedCheckoutRequest {
  plan?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

interface PaymentIntentRequest {
  amount: number;
  plan: string;
  currency?: string;
}

interface StripeCheckoutSession {
  id: string;
  client_secret?: string | null;
  customer: string;
  customer_email?: string;
  customer_details?: {
    email?: string;
  };
  metadata?: {
    plan?: string;
    userId?: string;
    type?: string;
    flow?: string;
    customerEmail?: string;
  };
}

export function registerCheckoutRoutes(app: Express) {
  if (!process.env['STRIPE_SECRET_KEY']) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
    apiVersion: "2025-09-30.clover",
  });
  // 🔄 PHASE 3: Create Retraining Checkout Session
  app.post("/api/create-retrain-checkout-session", requireStackAuth, async (req: Request & { body: RetrainCheckoutRequest }, res: Response) => {
    try {
      const { successUrl, cancelUrl } = req.body;
      const userId = req.user!.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User authentication required for retraining' });
      }

      // Check if user has existing trained model
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Retraining configuration - $10 one-time fee
      const retrainingConfig = {
        name: 'AI Model Retraining',
        description: 'One-time retraining session for your personal AI model',
        amount: 1000, // $10.00 in cents
      };
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: retrainingConfig.name,
                description: retrainingConfig.description,
              },
              unit_amount: retrainingConfig.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan: 'retraining-session',
          userId: userId,
          type: 'retrain'
        },
        customer_email: user.email || undefined,
      });

      res.json({ url: session.url });
    } catch (error: unknown) {
      console.error('Retraining checkout session creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error creating retraining checkout session: " + errorMessage });
    }
  });

  // Create Stripe Checkout Session (simpler and more reliable)
  app.post("/api/create-checkout-session", async (req: Request & { body: CheckoutSessionRequest }, res: Response) => {
    try {
      const { successUrl, cancelUrl, plan = 'sselfie-studio', customerEmail } = req.body;
      
      // Single pricing plan - SIMPLIFIED FOR LAUNCH
      const planConfig = {
        'sselfie-studio': {
          name: 'SSELFIE STUDIO',
          description: 'Personal AI model + 100 monthly photos + Maya AI photographer',
          amount: 4700, // €47.00 in cents
        }
      };

      const selectedPlan = planConfig['sselfie-studio']; // Only one plan available
      
      // 🔥 FIX: Build session config with optional customer email
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan: plan,
          flow: successUrl.includes('/checkout?status=success') ? 'modal' : 'page'
        }
      };

      // 🔥 KEY FIX: Pre-fill email to avoid duplicate collection
      if (customerEmail) {
        sessionConfig.customer_email = customerEmail;
      }
      
      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ url: session.url });
    } catch (error: unknown) {
      console.error('Checkout session creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error creating checkout session: " + errorMessage });
    }
  });

  // Subscription Management Routes
  
  // Get user's subscription details
  app.get("/api/subscription", requireStackAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      if (!userId) {
        return res.status(401).json({ message: 'User authentication required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ message: 'No subscription found' });
      }

      // Get the customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return res.status(404).json({ message: 'No subscription found' });
      }

      res.json(subscriptions.data[0]);
    } catch (error: unknown) {
      console.error('Error fetching subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error fetching subscription: " + errorMessage });
    }
  });

  // Get user's invoices
  app.get("/api/invoices", requireStackAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      if (!userId) {
        return res.status(401).json({ message: 'User authentication required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ message: 'No customer found' });
      }

      // Get the customer's invoices
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });

      res.json(invoices.data);
    } catch (error: unknown) {
      console.error('Error fetching invoices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error fetching invoices: " + errorMessage });
    }
  });

  // Cancel subscription (at period end)
  app.post("/api/subscription/cancel", requireStackAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      if (!userId) {
        return res.status(401).json({ message: 'User authentication required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ message: 'No subscription found' });
      }

      // Cancel subscription at period end (not immediately)
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      res.json(subscription);
    } catch (error: unknown) {
      console.error('Error canceling subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error canceling subscription: " + errorMessage });
    }
  });

  // Reactivate subscription (remove cancel_at_period_end)
  app.post("/api/subscription/reactivate", requireStackAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      if (!userId) {
        return res.status(401).json({ message: 'User authentication required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ message: 'No subscription found' });
      }

      // Remove the cancellation (reactivate)
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      res.json(subscription);
    } catch (error: unknown) {
      console.error('Error reactivating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error reactivating subscription: " + errorMessage });
    }
  });

  // 🔥 NEW: Create Embedded Checkout Session for SSELFIE Style Guide Payment Page
  app.post("/api/create-embedded-checkout-session", async (req: Request & { body: EmbeddedCheckoutRequest }, res: Response) => {
    try {
      const { plan = 'sselfie-studio', customerEmail, successUrl, cancelUrl } = req.body;
      
      if (!customerEmail) {
        return res.status(400).json({ message: 'Customer email is required for embedded checkout' });
      }

      // Single pricing plan - SSELFIE Studio
      const planConfig = {
        'sselfie-studio': {
          name: 'SSELFIE STUDIO',
          description: 'Personal AI model training + Maya AI photographer + 100 monthly professional photos',
          amount: 4700, // €47.00 in cents
        }
      };

      const selectedPlan = planConfig['sselfie-studio']; // Only one plan available

      // Create Stripe Embedded Checkout Session
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded', // 🔥 CRITICAL: This enables embedded checkout
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment', // One-time payment (can be changed to 'subscription' later)
        return_url: successUrl, // For embedded checkout, use return_url instead of success_url
        metadata: {
          plan,
          customerEmail,
          flow: 'embedded'
        },
        customer_email: customerEmail,
        // Optional: Pre-fill customer information to avoid duplicate entry
        custom_fields: [],
      });

      
      // Return client_secret for embedded checkout initialization
      res.json({ 
        client_secret: session.client_secret,
        session_id: session.id
      });
    } catch (error: unknown) {
      console.error('Embedded checkout session creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error creating embedded checkout session: " + errorMessage });
    }
  });

  // Keep the old payment intent endpoint for backward compatibility
  app.post("/api/create-payment-intent", async (req: Request & { body: PaymentIntentRequest }, res: Response) => {
    try {
      const { amount, plan, currency = 'eur' } = req.body;
      
      if (!amount || !plan) {
        return res.status(400).json({ message: 'Amount and plan are required' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          plan,
          // userId will be added later during onboarding after successful payment
        },
        description: `SSELFIE ${plan} subscription`,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: unknown) {
      console.error('Payment intent creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Error creating payment intent: " + errorMessage });
    }
  });

  // Webhook for successful payments
  app.post('/api/webhook/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // Verify webhook signature for security
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return res.status(500).send('Webhook configuration error');
    }

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: unknown) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const plan = paymentIntent.metadata.plan;
      
      // For pre-login purchases, we'll store the payment intent ID and plan
      // The user will be linked to this payment during onboarding after they log in
      try {
        // Store payment record without userId for now
        
        // The subscription will be created during onboarding when user logs in
        // For now, just log the successful payment
      } catch (error) {
        console.error('Post-payment processing error:', error);
      }
    }

    // Handle successful payments via checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { plan, userId, type, flow } = session.metadata || {};
      
      
      // Handle retraining payments specifically
      if (plan === 'retraining-session' && type === 'retrain' && userId) {
        try {
          
          // Grant retraining access to user
          await grantRetrainingAccess(userId, session.id);
          
        } catch (error) {
          console.error('Retraining payment processing error:', error);
        }
      }
      
      // Handle regular subscription payments (sselfie-studio plan)
      else if (plan === 'sselfie-studio' || !plan) {
        try {
          
          // Create or update user with subscription access
          await handleSubscriptionPayment(session, flow);
          
        } catch (error) {
          console.error('Subscription payment processing error:', error);
        }
      }
    }

    res.json({ received: true });
  });
}

// Grant retraining access to user
async function grantRetrainingAccess(userId: string, sessionId: string) {
  try {
    // Update user with retraining access
    await storage.updateUserRetrainingAccess(userId, {
      hasRetrainingAccess: true,
      retrainingSessionId: sessionId,
      retrainingPaidAt: new Date(),
    });

  } catch (error) {
    console.error('Error granting retraining access:', error);
    throw error;
  }
}

// Handle successful subscription payment and user creation/upgrade
async function handleSubscriptionPayment(session: Stripe.Checkout.Session, flow?: string) {
  try {
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    
    if (!customerEmail) {
      return;
    }
    
    
    // Check if user already exists
    const user = await storage.getUserByEmail(customerEmail);
    
    if (user) {
      // Update existing user with subscription details
      
      await storage.updateUserProfile(user.id, {
        plan: 'sselfie-studio',
        monthlyGenerationLimit: 100,
        generationsUsedThisMonth: 0,
        stripeCustomerId: customerId,
        mayaAiAccess: true,
        updatedAt: new Date(),
      });
      
    } else {
      // Create new user with subscription
      
      const newUserId = generateUserId(); // Generate unique user ID
      
      await storage.createUser({
        id: newUserId,
        email: customerEmail,
        plan: 'sselfie-studio',
        monthlyGenerationLimit: 100,
        generationsUsedThisMonth: 0,
        stripeCustomerId: customerId,
        mayaAiAccess: true,
        victoriaAiAccess: false,
        role: 'user',
        preferredOnboardingMode: 'conversational',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      
    }

    // Enhanced logging for modal vs page flow
    if (flow === 'modal') {
    } else {
    }
  } catch (error) {
    console.error('Error handling subscription payment:', error);
    throw error;
  }
}

// Generate unique user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function triggerPostPurchaseAutomation(userId: string, plan: string) {
  try {
    // Get user details
    const user = await storage.getUser(userId);
    if (!user) return;

    // Send welcome email (in production, integrate with email service)
    // await sendWelcomeEmail(user, plan);

    // Setup onboarding data
    const existingOnboarding = await storage.getOnboardingData(userId);
    if (!existingOnboarding) {
      await storage.saveOnboardingData({
        userId,
        currentStep: plan === 'basic' ? 1 : 2,
        brandVoice: '',
        targetAudience: '',
        businessGoals: '',
      } as any);
    }

  } catch (error) {
    console.error('Automation error:', error);
  }
}

// Email service disabled for now
// async function sendWelcomeEmail(user: unknown, plan: string) {
//   try {
//     await EmailService.sendWelcomeEmail(user.email, user.firstName || 'Beautiful', plan);
//   } catch (error) {
//     console.error('Failed to send welcome email:', error);
//     // Don't throw error - payment should still process even if email fails
//   }
// }