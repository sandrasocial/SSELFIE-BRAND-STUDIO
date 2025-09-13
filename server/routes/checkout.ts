import type { Express } from "express";
import { requireStackAuth } from '../stack-auth';
import { storage } from "../storage";
// import { sendWelcomeEmail } from "../email-service";

import Stripe from "stripe";

export function registerCheckoutRoutes(app: Express) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
  // 🔄 PHASE 3: Create Retraining Checkout Session
  app.post("/api/create-retrain-checkout-session", requireStackAuth, async (req: any, res) => {
    try {
      const { successUrl, cancelUrl } = req.body;
      const userId = req.user.id;
      
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

      console.log(`🔄 RETRAINING SESSION: Created checkout for user ${userId} - ${session.id}`);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Retraining checkout session creation error:', error);
      res.status(500).json({ message: "Error creating retraining checkout session: " + error.message });
    }
  });

  // Create Stripe Checkout Session (simpler and more reliable)
  app.post("/api/create-checkout-session", async (req: any, res) => {
    try {
      const { successUrl, cancelUrl, plan = 'sselfie-studio' } = req.body;
      
      // Single pricing plan - SIMPLIFIED FOR LAUNCH
      const planConfig = {
        'sselfie-studio': {
          name: 'SSELFIE STUDIO',
          description: 'Personal AI model + 100 monthly photos + Maya AI photographer',
          amount: 4700, // €47.00 in cents
        }
      };

      const selectedPlan = planConfig['sselfie-studio']; // Only one plan available
      
      const session = await stripe.checkout.sessions.create({
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
          plan: plan
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout session creation error:', error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  // Subscription Management Routes
  
  // Get user's subscription details
  app.get("/api/subscription", requireStackAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: "Error fetching subscription: " + error.message });
    }
  });

  // Get user's invoices
  app.get("/api/invoices", requireStackAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ message: "Error fetching invoices: " + error.message });
    }
  });

  // Cancel subscription (at period end)
  app.post("/api/subscription/cancel", requireStackAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ message: "Error canceling subscription: " + error.message });
    }
  });

  // Reactivate subscription (remove cancel_at_period_end)
  app.post("/api/subscription/reactivate", requireStackAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      res.status(500).json({ message: "Error reactivating subscription: " + error.message });
    }
  });

  // Keep the old payment intent endpoint for backward compatibility
  app.post("/api/create-payment-intent", async (req: any, res) => {
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
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
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
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const plan = paymentIntent.metadata.plan;
      
      // For pre-login purchases, we'll store the payment intent ID and plan
      // The user will be linked to this payment during onboarding after they log in
      try {
        // Store payment record without userId for now
        console.log(`Payment succeeded for plan ${plan}, payment intent: ${paymentIntent.id}`);
        
        // The subscription will be created during onboarding when user logs in
        // For now, just log the successful payment
      } catch (error) {
        console.error('Post-payment processing error:', error);
      }
    }

    // Handle successful payments via checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { plan, userId, type } = session.metadata || {};
      
      // Handle retraining payments specifically
      if (plan === 'retraining-session' && type === 'retrain' && userId) {
        try {
          console.log(`🔄 RETRAINING PAYMENT: Successful payment for user ${userId} - session ${session.id}`);
          
          // Grant retraining access to user
          await grantRetrainingAccess(userId, session.id);
          
          console.log(`✅ RETRAINING ACCESS: Granted to user ${userId}`);
        } catch (error) {
          console.error('Retraining payment processing error:', error);
        }
      }
      
      // Handle regular subscription payments (sselfie-studio plan)
      else if (plan === 'sselfie-studio' || !plan) {
        try {
          console.log(`💰 SUBSCRIPTION PAYMENT: Successful payment - session ${session.id}`);
          
          // Create or update user with subscription access
          await handleSubscriptionPayment(session);
          
          console.log(`✅ SUBSCRIPTION ACCESS: Granted for session ${session.id}`);
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

    console.log(`🔄 RETRAINING ACCESS: User ${userId} can now access training with session ${sessionId}`);
  } catch (error) {
    console.error('Error granting retraining access:', error);
    throw error;
  }
}

// Handle successful subscription payment and user creation/upgrade
async function handleSubscriptionPayment(session: any) {
  try {
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      console.log('No customer email found in session, skipping user creation');
      return;
    }
    
    console.log(`📧 Processing subscription for email: ${customerEmail}`);
    
    // Check if user already exists
    let user = await storage.getUserByEmail(customerEmail);
    
    if (user) {
      // Update existing user with subscription details
      console.log(`👤 Updating existing user: ${user.id}`);
      
      await storage.updateUser(user.id, {
        plan: 'sselfie-studio',
        monthlyGenerationLimit: 100,
        generationsUsedThisMonth: 0,
        stripeCustomerId: session.customer,
        mayaAiAccess: true,
        updatedAt: new Date(),
      });
      
      console.log(`✅ User ${user.id} upgraded to SSELFIE STUDIO plan`);
    } else {
      // Create new user with subscription
      console.log(`👤 Creating new user for email: ${customerEmail}`);
      
      const newUserId = generateUserId(); // Generate unique user ID
      
      await storage.createUser({
        id: newUserId,
        email: customerEmail,
        plan: 'sselfie-studio',
        monthlyGenerationLimit: 100,
        generationsUsedThisMonth: 0,
        stripeCustomerId: session.customer,
        mayaAiAccess: true,
        victoriaAiAccess: false,
        role: 'user',
        preferredOnboardingMode: 'conversational',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`✅ New user ${newUserId} created with SSELFIE STUDIO plan`);
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
        currentStep: plan === 'basic' ? 'ai-training' : 'brand-questionnaire',
        brandVibe: '',
        targetClient: '',
        businessGoal: '',
        completedSteps: [],
      });
    }

    console.log(`Post-purchase automation completed for user ${userId}, plan ${plan}`);
  } catch (error) {
    console.error('Automation error:', error);
  }
}

// Email service disabled for now
// async function sendWelcomeEmail(user: any, plan: string) {
//   try {
//     await EmailService.sendWelcomeEmail(user.email, user.firstName || 'Beautiful', plan);
//     console.log(`Welcome email sent successfully to ${user.email} for ${plan}`);
//   } catch (error) {
//     console.error('Failed to send welcome email:', error);
//     // Don't throw error - payment should still process even if email fails
//   }
// }