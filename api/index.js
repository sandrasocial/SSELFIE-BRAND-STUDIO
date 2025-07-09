// Vercel serverless API handler - simplified approach
const express = require('express');
const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2023-10-16",
});

// Create Express app for this serverless function
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Core checkout endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, plan, currency = 'eur' } = req.body;
    
    if (!amount || !plan) {
      return res.status(400).json({ message: 'Amount and plan are required' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY');
      return res.status(500).json({ message: 'Payment configuration error' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: { plan },
      description: `SSELFIE ${plan} subscription`,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: "Error creating payment intent: " + error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth user endpoint (simplified)
app.get("/api/auth/user", (req, res) => {
  // For now, return unauthorized - auth system needs full implementation
  res.status(401).json({ message: "Unauthorized" });
});

module.exports = app;