import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16'
});

// Create subscription
router.post('/create-subscription', authenticate, async (req, res) => {
  try {
    const { paymentMethodId, priceId } = req.body;

    // Get user
    const userResult = await pool.query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [req.user.userId]
    );

    let customerId = userResult.rows[0]?.stripe_customer_id;

    // Create or get Stripe customer
    if (!customerId) {
      const userDetails = await pool.query(
        'SELECT email, full_name FROM users WHERE id = $1',
        [req.user.userId]
      );

      const customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: userDetails.rows[0].email,
        name: userDetails.rows[0].full_name,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      customerId = customer.id;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription details
    await pool.query(
      `INSERT INTO subscriptions 
       (user_id, stripe_customer_id, stripe_subscription_id, plan_type, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.userId, customerId, subscription.id, 'premium', subscription.status]
    );

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice).payment_intent?.client_secret,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// Handle webhook
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    switch (event.type) {
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        await pool.query(
          `INSERT INTO payment_history 
           (subscription_id, amount_paid, currency, stripe_payment_intent_id, status) 
           VALUES 
           ((SELECT id FROM subscriptions WHERE stripe_subscription_id = $1), $2, $3, $4, $5)`,
          [invoice.subscription, invoice.amount_paid, invoice.currency, invoice.payment_intent, 'succeeded']
        );
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await pool.query(
          `UPDATE subscriptions 
           SET status = $1, current_period_end = to_timestamp($2) 
           WHERE stripe_subscription_id = $3`,
          [subscription.status, subscription.current_period_end, subscription.id]
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Get subscription status
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, ph.amount_paid, ph.payment_date 
       FROM subscriptions s 
       LEFT JOIN payment_history ph ON ph.subscription_id = s.id 
       WHERE s.user_id = $1 
       ORDER BY ph.payment_date DESC 
       LIMIT 1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ status: 'no_subscription' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ message: 'Error fetching subscription status' });
  }
});

export default router;