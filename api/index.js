import express from 'express';
import session from 'express-session';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Middleware
app.use(cors());
app.use(express.json());

// Session middleware for Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'vercel-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Simple auth endpoints for Vercel
app.get('/api/login', (req, res) => {
  const testUserId = "test" + Math.floor(Math.random() * 100000);
  req.session.userId = testUserId;
  req.session.userEmail = "testuser@example.com";
  req.session.firstName = "Test";
  req.session.lastName = "User";
  req.session.createdAt = new Date().toISOString();
  
  console.log('Vercel Login: Created test user session:', testUserId);
  res.redirect('/workspace');
});

app.get('/api/logout', (req, res) => {
  if (req.session) {
    console.log('Vercel Logout: Destroying session for user:', req.session.userId);
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

app.get('/api/auth/user', (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const testUser = {
    id: req.session.userId,
    email: req.session.userEmail || "testuser@example.com",
    firstName: req.session.firstName || "Test",
    lastName: req.session.lastName || "User",
    profileImageUrl: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: req.session.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json(testUser);
});

// Stripe payment endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, plan, currency = 'eur' } = req.body;
    
    if (!amount || !plan) {
      return res.status(400).json({ message: 'Amount and plan are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        plan,
      },
      description: `SSELFIE ${plan} subscription`,
    });

    console.log(`Payment intent created for ${plan}: ${paymentIntent.id}`);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: "Error creating payment intent: " + error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    platform: 'Vercel',
    endpoints: {
      login: '/api/login',
      logout: '/api/logout',
      auth: '/api/auth/user',
      payment: '/api/create-payment-intent'
    }
  });
});

// Handle all other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app;