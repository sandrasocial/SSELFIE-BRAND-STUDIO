/**
 * Payment System Types for Maya-Only Architecture
 * Stripe integration and subscription management types
 */

// === Core Payment Types ===

export interface PaymentProvider {
  id: 'stripe';
  name: string;
  enabled: boolean;
  config: StripeConfig;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  apiVersion: string;
  currency: string;
  locale: string;
}

// === Subscription Types ===

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  credits: SubscriptionCredits;
  features: SubscriptionFeature[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'paused';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: Money;
  billingInterval: 'month' | 'year';
  trialDays?: number;
  features: SubscriptionFeature[];
  limits: SubscriptionLimits;
  isPopular?: boolean;
  isEnterprise?: boolean;
  stripePriceId: string;
  stripeProductId: string;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'limit' | 'access';
  value: boolean | number | string;
  unit?: string;
}

export interface SubscriptionLimits {
  imagesPerMonth: number;
  videosPerMonth: number;
  storageGB: number;
  maxConcurrentGenerations: number;
  apiRequestsPerMonth?: number;
  supportLevel: 'basic' | 'priority' | 'premium';
  advancedFeatures: boolean;
}

export interface SubscriptionCredits {
  images: {
    total: number;
    used: number;
    remaining: number;
    resetDate: Date;
  };
  videos: {
    total: number;
    used: number;
    remaining: number;
    resetDate: Date;
  };
  apiRequests?: {
    total: number;
    used: number;
    remaining: number;
    resetDate: Date;
  };
}

// === Payment Methods ===

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: PaymentMethodType;
  card?: CardDetails;
  billing: BillingDetails;
  isDefault: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type PaymentMethodType = 'card' | 'sepa_debit' | 'ideal' | 'bancontact' | 'giropay';

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
  country: string;
}

export interface BillingDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

// === Invoices & Billing ===

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  number: string;
  status: InvoiceStatus;
  amount: Money;
  tax?: Money;
  total: Money;
  currency: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  paymentMethod?: PaymentMethod;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: Money;
  amount: Money;
  period?: {
    start: Date;
    end: Date;
  };
}

export interface Money {
  amount: number; // Amount in cents
  currency: string;
  formatted: string; // Human-readable format like "$19.99"
}

// === Payment Processing ===

export interface PaymentIntent {
  id: string;
  userId: string;
  stripePaymentIntentId: string;
  amount: Money;
  status: PaymentIntentStatus;
  paymentMethod?: PaymentMethod;
  clientSecret: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export interface PaymentSession {
  id: string;
  userId: string;
  type: 'subscription' | 'one_time' | 'setup';
  stripeSessionId: string;
  url: string;
  status: PaymentSessionStatus;
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type PaymentSessionStatus = 'open' | 'complete' | 'expired';

// === Payment Requests ===

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string;
  couponCode?: string;
  trialDays?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  paymentMethodId?: string;
  cancelAtPeriodEnd?: boolean;
  prorationBehavior?: 'create_prorations' | 'none';
}

export interface CreatePaymentMethodRequest {
  type: PaymentMethodType;
  card?: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  };
  billing: BillingDetails;
  setAsDefault?: boolean;
}

export interface CreatePaymentSessionRequest {
  type: PaymentSession['type'];
  successUrl: string;
  cancelUrl: string;
  planId?: string; // For subscription sessions
  amount?: Money; // For one-time payment sessions
  metadata?: Record<string, unknown>;
}

// === Payment Responses ===

export interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: PaymentError;
  clientSecret?: string;
  redirectUrl?: string;
}

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  type: 'validation' | 'payment' | 'authentication' | 'rate_limit' | 'api_error';
  details?: Record<string, unknown>;
  field?: string;
}

export type PaymentErrorCode =
  | 'CARD_DECLINED'
  | 'INSUFFICIENT_FUNDS'
  | 'EXPIRED_CARD'
  | 'INVALID_CVC'
  | 'INVALID_EXPIRY'
  | 'INVALID_NUMBER'
  | 'PROCESSING_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'RATE_LIMITED'
  | 'SUBSCRIPTION_NOT_FOUND'
  | 'PLAN_NOT_FOUND'
  | 'PAYMENT_METHOD_NOT_FOUND'
  | 'COUPON_INVALID'
  | 'COUPON_EXPIRED'
  | 'UNKNOWN_ERROR';

// === Webhooks ===

export interface StripeWebhookEvent {
  id: string;
  type: StripeEventType;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key: string;
  };
}

export type StripeEventType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'invoice.upcoming'
  | 'payment_method.attached'
  | 'payment_method.detached'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'setup_intent.succeeded';

// === Usage Tracking ===

export interface UsageRecord {
  id: string;
  userId: string;
  subscriptionId: string;
  type: 'image_generation' | 'video_generation' | 'api_request' | 'storage';
  quantity: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface UsageSummary {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  images: {
    used: number;
    limit: number;
    remaining: number;
  };
  videos: {
    used: number;
    limit: number;
    remaining: number;
  };
  storage: {
    used: number; // in GB
    limit: number;
    remaining: number;
  };
  apiRequests?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

// === Coupons & Discounts ===

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number; // Percentage (0-100) or amount in cents
  currency?: string; // Required for fixed_amount
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number; // Required for repeating
  maxRedemptions?: number;
  redemptions: number;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  stripeCouponId: string;
  createdAt: Date;
  updatedAt: Date;
}

// === Hook Types ===

export interface UseStripeReturn {
  stripe: any | null;
  elements: any | null;
  isLoading: boolean;
  error: PaymentError | null;
}

export interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: PaymentError | null;
  createSubscription: (request: CreateSubscriptionRequest) => Promise<PaymentResponse>;
  updateSubscription: (request: UpdateSubscriptionRequest) => Promise<PaymentResponse>;
  cancelSubscription: () => Promise<PaymentResponse>;
  resumeSubscription: () => Promise<PaymentResponse>;
}

export interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: PaymentError | null;
  addPaymentMethod: (request: CreatePaymentMethodRequest) => Promise<PaymentResponse>;
  removePaymentMethod: (id: string) => Promise<PaymentResponse>;
  setDefaultPaymentMethod: (id: string) => Promise<PaymentResponse>;
}

// === Configuration ===

export interface PaymentConfig {
  providers: PaymentProvider[];
  defaultCurrency: string;
  supportedCurrencies: string[];
  taxRates: Record<string, number>; // Country code -> tax rate
  webhookEndpoints: {
    stripe: string;
  };
  features: {
    subscriptions: boolean;
    oneTimePayments: boolean;
    setupIntents: boolean;
  };
}