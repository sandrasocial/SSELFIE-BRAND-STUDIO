/**
 * Stripe Integration Service Template
 * Luxury payment processing with comprehensive error handling
 */

import Stripe from 'stripe';
import { IntegrationStatus, IntegrationConfig, IntegrationEvent } from './types';

export interface StripeConfig extends IntegrationConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: 'test' | 'live';
}

export interface StripeMetrics {
  totalRevenue: number;
  subscriptions: number;
  failedPayments: number;
  churnRate: number;
  lastUpdated: Date;
}

export class StripeIntegrationService {
  private stripe: Stripe;
  private config: StripeConfig;
  private status: IntegrationStatus = 'disconnected';
  private lastSync: Date | null = null;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async connect(): Promise<boolean> {
    try {
      this.status = 'connecting';
      
      // Test connection with account retrieval
      const account = await this.stripe.accounts.retrieve();
      
      if (!account) {
        throw new Error('Failed to retrieve Stripe account');
      }

      this.status = 'connected';
      this.lastSync = new Date();
      
      await this.emitEvent('connected', { accountId: account.id });
      return true;
    } catch (error) {
      this.status = 'error';
      await this.emitEvent('error', { error: error.message });
      throw new Error(`Stripe connection failed: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
    this.lastSync = null;
    await this.emitEvent('disconnected', {});
  }

  async syncData(): Promise<StripeMetrics> {
    if (this.status !== 'connected') {
      throw new Error('Stripe not connected');
    }

    try {
      this.status = 'syncing';
      
      const [charges, subscriptions, disputes] = await Promise.all([
        this.stripe.charges.list({ limit: 100 }),
        this.stripe.subscriptions.list({ limit: 100 }),
        this.stripe.disputes.list({ limit: 100 })
      ]);

      const metrics: StripeMetrics = {
        totalRevenue: charges.data.reduce((sum, charge) => sum + charge.amount, 0) / 100,
        subscriptions: subscriptions.data.length,
        failedPayments: charges.data.filter(c => c.status === 'failed').length,
        churnRate: this.calculateChurnRate(subscriptions.data),
        lastUpdated: new Date()
      };

      this.status = 'connected';
      this.lastSync = new Date();
      
      await this.emitEvent('sync_complete', metrics);
      return metrics;
    } catch (error) {
      this.status = 'error';
      await this.emitEvent('sync_error', { error: error.message });
      throw error;
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async handleWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.webhookSecret
    );
  }

  getStatus(): IntegrationStatus {
    return this.status;
  }

  getLastSync(): Date | null {
    return this.lastSync;
  }

  private calculateChurnRate(subscriptions: Stripe.Subscription[]): number {
    const canceledSubs = subscriptions.filter(s => s.status === 'canceled').length;
    return subscriptions.length > 0 ? (canceledSubs / subscriptions.length) * 100 : 0;
  }

  private async emitEvent(type: string, data: any): Promise<void> {
    const event: IntegrationEvent = {
      id: `stripe_${Date.now()}`,
      type,
      source: 'stripe',
      data,
      timestamp: new Date()
    };
    
    // Emit to event system
    console.log('Stripe Event:', event);
  }
}