import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { sendWelcomeEmail } from "../email-service";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export function registerCheckoutRoutes(app: Express) {
  // Create Stripe Checkout Session (simpler and more reliable)
  app.post("/api/create-checkout-session", async (req: any, res) => {
    try {
      const { successUrl, cancelUrl } = req.body;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'SSELFIE AI Brand Photoshoot',
                description: '100 monthly AI-generated professional photos',
              },
              unit_amount: 4700, // €67.00 in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout session creation error:', error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
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

    res.json({ received: true });
  });
}

async function triggerPostPurchaseAutomation(userId: string, plan: string) {
  try {
    // Get user details
    const user = await storage.getUser(userId);
    if (!user) return;

    // Send welcome email (in production, integrate with email service)
    await sendWelcomeEmail(user, plan);

    // Setup onboarding data
    await storage.createOnboardingData({
      userId,
      currentStep: plan === 'ai-pack' ? 'selfie-upload' : 'brand-questionnaire',
      brandVibe: '',
      targetClient: '',
      businessGoal: '',
      completedSteps: [],
    });

    console.log(`Post-purchase automation completed for user ${userId}, plan ${plan}`);
  } catch (error) {
    console.error('Automation error:', error);
  }
}

async function sendWelcomeEmail(user: any, plan: string) {
  try {
    await EmailService.sendWelcomeEmail(user.email, user.firstName || 'Beautiful', plan);
    console.log(`Welcome email sent successfully to ${user.email} for ${plan}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error - payment should still process even if email fails
  }
}