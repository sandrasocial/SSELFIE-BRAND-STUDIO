/**
 * POST /api/create-retrain-checkout-session - Create Stripe checkout for retraining (one-time)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sendError, sendSuccess } from './_utils/response-helpers';

export const config = { runtime: 'nodejs', maxDuration: 30 } as const;

interface RetrainCheckoutRequest {
  successUrl: string;
  cancelUrl: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
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
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      return sendError(res, 'Payment service not configured', 503);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-09-30.clover' });

    const { successUrl, cancelUrl } = req.body as RetrainCheckoutRequest;
    if (!successUrl || !cancelUrl) {
      return sendError(res, 'successUrl and cancelUrl are required', 400);
    }

    const amountCents = parseInt(process.env['RETRAIN_PRICE_CENTS'] || '1000', 10);
    const currency = 'eur';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Retraining Session',
              description: 'One-time retraining for your personal AI model',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan: 'retraining-session',
        type: 'retrain',
      },
    });

    return sendSuccess(res, { url: session.url });
  } catch (error: unknown) {
    console.error('Retraining checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return sendError(res, `Error creating retraining checkout session: ${message}`, 500);
  }
}

