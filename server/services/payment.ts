import Stripe from 'stripe';
import { logger } from '../../config/monitoring';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

export class PaymentService {
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
      logger.error('Subscription creation failed', { error });
      throw error;
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      switch (event.type) {
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object);
          break;
        // Add other webhook handlers as needed
      }
      
      return { status: 'success' };
    } catch (error) {
      logger.error('Webhook handling failed', { error });
      throw error;
    }
  }

  private async handleInvoicePaid(invoice: any) {
    // Implement invoice paid logic
    logger.info('Invoice paid', { invoiceId: invoice.id });
  }

  private async handleSubscriptionCanceled(subscription: any) {
    // Implement subscription cancellation logic
    logger.info('Subscription canceled', { subscriptionId: subscription.id });
  }

  async generateInvoice(customerId: string, amount: number) {
    try {
      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        collection_method: 'charge_automatically',
      });
      
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: amount,
        currency: 'usd',
        invoice: invoice.id,
      });

      return invoice;
    } catch (error) {
      logger.error('Invoice generation failed', { error });
      throw error;
    }
  }
}