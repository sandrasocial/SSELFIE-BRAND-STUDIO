import Stripe from 'stripe';
import { logger } from '../config/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const stripeService = {
  // Create a subscription
  async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Handle webhook events
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          // Handle subscription creation
          break;
        case 'customer.subscription.updated':
          // Handle subscription updates
          break;
        case 'customer.subscription.deleted':
          // Handle subscription deletion
          break;
        case 'invoice.paid':
          // Handle successful payments
          break;
        case 'invoice.payment_failed':
          // Handle failed payments
          break;
      }
    } catch (error) {
      logger.error('Error handling webhook event:', error);
      throw error;
    }
  },

  // Create a customer
  async createCustomer(email: string, name: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  },

  // Create a payment intent
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  },
};