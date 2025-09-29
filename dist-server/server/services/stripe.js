import Stripe from 'stripe';
import { AppError } from '../middleware/errorHandler.js';
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
    apiVersion: '2025-08-27.basil'
});
export class StripeService {
    async createSubscription(userId, priceId) {
        try {
            const customer = await this.getOrCreateCustomer(userId);
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: priceId }],
                expand: ['latest_invoice.payment_intent'],
            });
            return subscription;
        }
        catch (error) {
            throw new AppError('Error creating subscription', 500);
        }
    }
    async handleWebhookEvent(event) {
        try {
            switch (event.type) {
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = event.data.object;
                    await this.updateSubscriptionStatus(subscription);
                    break;
                case 'invoice.payment_succeeded':
                    const invoice = event.data.object;
                    await this.handleSuccessfulPayment(invoice);
                    break;
                case 'invoice.payment_failed':
                    const failedInvoice = event.data.object;
                    await this.handleFailedPayment(failedInvoice);
                    break;
            }
        }
        catch (error) {
            throw new AppError('Error processing webhook', 500);
        }
    }
    async cancelSubscription(subscriptionId) {
        try {
            const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
            return canceledSubscription;
        }
        catch (error) {
            throw new AppError('Error canceling subscription', 500);
        }
    }
    async updateSubscription(subscriptionId, newPriceId) {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            await stripe.subscriptions.update(subscriptionId, {
                items: [{
                        id: subscription.items.data[0].id,
                        price: newPriceId,
                    }],
            });
        }
        catch (error) {
            throw new AppError('Error updating subscription', 500);
        }
    }
    async getOrCreateCustomer(userId) {
        return await stripe.customers.create({
            metadata: { userId }
        });
    }
    async updateSubscriptionStatus(subscription) {
    }
    async handleSuccessfulPayment(invoice) {
    }
    async handleFailedPayment(invoice) {
    }
}
//# sourceMappingURL=stripe.js.map