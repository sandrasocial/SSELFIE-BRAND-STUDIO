import Stripe from 'stripe';
import { AppError } from '../middleware/errorHandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export class StripeService {
  // Create a subscription
  async createSubscription(userId: string, priceId: string) {
    try {
      // Get or create customer
      const customer = await this.getOrCreateCustomer(userId);
      
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      throw new AppError('Error creating subscription', 500);
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await this.updateSubscriptionStatus(subscription);
          break;
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleSuccessfulPayment(invoice);
          break;
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          await this.handleFailedPayment(failedInvoice);
          break;
      }
    } catch (error) {
      throw new AppError('Error processing webhook', 500);
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    try {
      const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
      return canceledSubscription;
    } catch (error) {
      throw new AppError('Error canceling subscription', 500);
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
      });
    } catch (error) {
      throw new AppError('Error updating subscription', 500);
    }
  }

  // Private helper methods
  private async getOrCreateCustomer(userId: string) {
    // Implementation would look up customer in your database first
    // then create if not exists
    return await stripe.customers.create({
      metadata: { userId }
    });
  }

  private async updateSubscriptionStatus(subscription: Stripe.Subscription) {
    // Implementation would update your database with subscription status
  }

  private async handleSuccessfulPayment(invoice: Stripe.Invoice) {
    // Implementation would handle successful payment logic
  }

  private async handleFailedPayment(invoice: Stripe.Invoice) {
    // Implementation would handle failed payment logic
  }
}