/**
 * POST /api/checkout - Create Stripe checkout session
 * Handles payment processing for SSELFIE Studio subscription
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { storage } from '../server/storage';
import { getUserFromRequest } from './_utils/auth-helpers';
import { sendError, sendSuccess } from './_utils/response-helpers';

export const config = { runtime: 'nodejs', maxDuration: 30 };

interface CheckoutSessionRequest {
  successUrl: string;
  cancelUrl: string;
  plan?: string;
  customerEmail?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env['STRIPE_SECRET_KEY']) {
      console.error('Missing STRIPE_SECRET_KEY');
      return sendError(res, 'Payment service not configured', 503);
    }

    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
      apiVersion: '2025-09-30.clover',
    });

    const { successUrl, cancelUrl, plan = 'sselfie-studio', customerEmail } = req.body as CheckoutSessionRequest;

    // Validate required parameters
    if (!successUrl || !cancelUrl) {
      return sendError(res, 'successUrl and cancelUrl are required', 400);
    }

    // Single pricing plan - SIMPLIFIED FOR LAUNCH
    const planConfig = {
      'sselfie-studio': {
        name: 'SSELFIE STUDIO',
        description: 'Personal AI model + 100 monthly photos + Maya AI photographer',
        amount: 4700, // €47.00 in cents
      }
    };

    const selectedPlan = planConfig['sselfie-studio']; // Only one plan available

    // Build session config with optional customer email
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan: plan,
        flow: successUrl.includes('/checkout?status=success') ? 'modal' : 'page'
      }
    };

    // Pre-fill email to avoid duplicate collection
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({ url: session.url });
  } catch (error: unknown) {
    console.error('Checkout session creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return sendError(res, `Error creating checkout session: ${errorMessage}`, 500);
  }
}

