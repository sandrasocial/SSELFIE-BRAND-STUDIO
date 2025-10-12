import { VercelRequest, VercelResponse } from '@vercel/node';
// Note: Using simplified auth for Maya payments service
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { mayaPayments } from '../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import Stripe from 'stripe';

// Initialize database connection
const db = drizzle(neon(process.env.DATABASE_URL!));

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Request validation schemas
const createPaymentSessionSchema = z.object({
  planType: z.enum(['basic', 'pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const updatePaymentSchema = z.object({
  subscriptionStatus: z.enum(['active', 'canceled', 'past_due', 'unpaid']).optional(),
  planType: z.enum(['basic', 'pro', 'enterprise']).optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  metadata: z.record(z.any()).optional(),
});

// Plan pricing configuration
const PLAN_PRICES = {
  basic: { monthly: 2900, yearly: 31900 }, // $29/month, $319/year
  pro: { monthly: 4900, yearly: 53900 },   // $49/month, $539/year
  enterprise: { monthly: 9900, yearly: 108900 }, // $99/month, $1089/year
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CRITICAL: Stack Auth validation - NO hardcoded users, NO demo data
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    // Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(process.env.STACK_SECRET_SERVER_KEY);
      const { payload } = await jwtVerify(token, secret);
      userId = payload.sub as string;
      
      if (!userId) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }
    } catch (error) {
      console.error('JWT verification failed:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGetPayments(req, res, userId);
      case 'POST':
        return await handleCreatePaymentSession(req, res, userId);
      case 'PUT':
        return await handleUpdatePayment(req, res, userId);
      case 'DELETE':
        return await handleCancelSubscription(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Maya payments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetPayments(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const payments = await db.select()
      .from(mayaPayments)
      .where(eq(mayaPayments.userId, userId))
      .orderBy(desc(mayaPayments.createdAt));
    
    // Get current active subscription
    const activeSubscription = payments.find(p => p.subscriptionStatus === 'active');
    
    return res.status(200).json({
      success: true,
      data: {
        payments,
        activeSubscription,
        hasActiveSubscription: !!activeSubscription
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

async function handleCreatePaymentSession(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const validatedData = createPaymentSessionSchema.parse(req.body);
    const { planType, billingCycle, successUrl, cancelUrl } = validatedData;
    
    // Get price for the selected plan
    const amount = PLAN_PRICES[planType][billingCycle];
    
    // Create or get Stripe customer
    let stripeCustomerId: string;
    const existingPayment = await db.select()
      .from(mayaPayments)
      .where(eq(mayaPayments.userId, userId))
      .limit(1);
    
    if (existingPayment.length > 0 && existingPayment[0].stripeCustomerId) {
      stripeCustomerId = existingPayment[0].stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        metadata: { userId }
      });
      stripeCustomerId = customer.id;
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Maya ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
              description: `${billingCycle} subscription to Maya AI`,
            },
            unit_amount: amount,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planType,
        billingCycle,
      },
    });
    
    // Store payment record
    const paymentData = {
      userId,
      stripeSessionId: session.id,
      stripeCustomerId,
      subscriptionStatus: 'pending' as const,
      planType,
      billingCycle,
      amount,
      currency: 'usd',
      metadata: {
        sessionUrl: session.url,
        created: new Date().toISOString(),
      },
      isActive: false,
    };
    
    const [newPayment] = await db.insert(mayaPayments).values(paymentData).returning();
    
    return res.status(201).json({
      success: true,
      data: {
        payment: newPayment,
        checkoutUrl: session.url,
        sessionId: session.id
      },
      message: 'Payment session created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    console.error('Error creating payment session:', error);
    return res.status(500).json({ error: 'Failed to create payment session' });
  }
}

async function handleUpdatePayment(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { paymentId } = req.query;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID required' });
    }
    
    const validatedData = updatePaymentSchema.parse(req.body);
    
    const [updatedPayment] = await db
      .update(mayaPayments)
      .set(validatedData as any)
      .where(and(
        eq(mayaPayments.id, parseInt(paymentId as string)),
        eq(mayaPayments.userId, userId)
      ))
      .returning();
    
    if (!updatedPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    console.error('Error updating payment:', error);
    return res.status(500).json({ error: 'Failed to update payment' });
  }
}

async function handleCancelSubscription(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    // Find active subscription
    const activePayment = await db.select()
      .from(mayaPayments)
      .where(and(
        eq(mayaPayments.userId, userId),
        eq(mayaPayments.subscriptionStatus, 'active')
      ))
      .limit(1);
    
    if (activePayment.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    const payment = activePayment[0];
    
    // Cancel subscription in Stripe
    if (payment.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(payment.stripeSubscriptionId);
    }
    
    // Update payment record
    const [updatedPayment] = await db
      .update(mayaPayments)
      .set({
        subscriptionEndsAt: new Date()
      } as any)
      .where(eq(mayaPayments.id, payment.id))
      .returning();
    
    return res.status(200).json({
      success: true,
      data: updatedPayment,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}