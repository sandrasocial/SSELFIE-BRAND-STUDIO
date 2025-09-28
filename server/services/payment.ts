import Stripe from 'stripe';
import { logger } from '../config/monitoring.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
});

// Enhanced error interface for better error handling
interface PaymentError extends Error {
  code?: string;
  type?: string;
  statusCode?: number;
}

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
      const paymentError = error as PaymentError;
      logger.error(`Subscription creation failed: ${paymentError.message}`, {
        customerId,
        priceId,
        errorType: paymentError.type,
        errorCode: paymentError.code
      });
      
      // Enhanced error with more context
      const enhancedError = new Error(
        `Failed to create subscription: ${paymentError.message}`
      ) as PaymentError;
      enhancedError.code = paymentError.code || 'SUBSCRIPTION_CREATION_FAILED';
      enhancedError.type = paymentError.type || 'payment_error';
      enhancedError.statusCode = 402; // Payment Required
      
      throw enhancedError;
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
      const paymentError = error as PaymentError;
      logger.error(`Webhook handling failed: ${paymentError.message}`, {
        errorType: paymentError.type,
        errorCode: paymentError.code
      });
      
      // Enhanced error for webhook failures
      const enhancedError = new Error(
        `Webhook processing failed: ${paymentError.message}`
      ) as PaymentError;
      enhancedError.code = paymentError.code || 'WEBHOOK_PROCESSING_FAILED';
      enhancedError.statusCode = 400;
      
      throw enhancedError;
    }
  }

  private async handleInvoicePaid(invoice: any) {
    // Implement invoice paid logic
    logger.info(`Invoice paid: ${invoice.id}`);
  }

  private async handleSubscriptionCanceled(subscription: any) {
    // Implement subscription cancellation logic
    logger.info(`Subscription canceled: ${subscription.id}`);
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
      logger.error(`Invoice generation failed: ${error.message}`);
      throw error;
    }
  }
}