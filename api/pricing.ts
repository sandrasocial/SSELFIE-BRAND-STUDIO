/**
 * GET /api/pricing - Public pricing info for client display
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCacheHeaders } from './_utils/response-helpers';

export const config = { runtime: 'nodejs', maxDuration: 10 } as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const amountCents = parseInt(process.env['RETRAIN_PRICE_CENTS'] || '1000', 10);
  const currency = 'eur';
  const amountEuros = (amountCents / 100).toFixed(0);

  setCacheHeaders(res, 300); // cache for 5 minutes

  return res.status(200).json({
    retraining: {
      amountCents,
      currency,
      display: `€${amountEuros}`,
    },
  });
}

