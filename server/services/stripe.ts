import Stripe from 'stripe';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export class StripeService {
  // Handle subscription creation
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
      logger.error('Stripe subscription creation failed:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
      }
    } catch (error) {
      logger.error('Webhook handling failed:', error);
      throw error;
    }
  }

  // Generate invoice
  async generateInvoice(customerId: string) {
    try {
      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
      });
      return invoice;
    } catch (error) {
      logger.error('Invoice generation failed:', error);
      throw error;
    }
  }

  private async handleInvoicePaid(invoice: any) {
    // Implementation for paid invoice
    logger.info('Invoice paid:', invoice.id);
  }

  private async handleSubscriptionCanceled(subscription: any) {
    // Implementation for canceled subscription
    logger.info('Subscription canceled:', subscription.id);
  }

  private async handleSubscriptionUpdated(subscription: any) {
    // Implementation for updated subscription
    logger.info('Subscription updated:', subscription.id);
  }
}