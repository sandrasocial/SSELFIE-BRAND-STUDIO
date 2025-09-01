import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { PLANS } from "../config/plans";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export function registerStripeWebhooks(app: Express) {
  // Stripe webhook handler for checkout completion
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      // Verify webhook signature if endpoint secret is configured
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        // For development, parse the event directly
        event = req.body as Stripe.Event;
      }
    } catch (err) {
      console.error('⚠️ Stripe webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('✅ Stripe checkout completed:', {
        sessionId: session.id,
        customerEmail: session.customer_email,
        plan: session.metadata?.plan || 'sselfie-studio'
      });

      try {
        // Find user by email and upgrade to sselfie-studio plan
        if (session.customer_email) {
          const user = await storage.getUserByEmail(session.customer_email);
          
          if (user) {
            await storage.updateUser(user.id, {
              plan: 'sselfie-studio',
              monthlyGenerationLimit: PLANS.sselfieStudio.monthlyGenerations,
              stripeCustomerId: session.customer as string,
            });
            
            console.log('🎯 User upgraded to sselfie-studio:', {
              userId: user.id,
              email: user.email,
              plan: 'sselfie-studio',
              monthlyLimit: PLANS.sselfieStudio.monthlyGenerations
            });
          } else {
            console.warn('⚠️ User not found for email:', session.customer_email);
          }
        }
      } catch (error) {
        console.error('❌ Error processing Stripe webhook:', error);
      }
    }

    res.json({ received: true });
  });
}