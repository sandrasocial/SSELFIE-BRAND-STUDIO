// Vercel serverless API handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;

  try {
    // Health check endpoint
    if (url === '/api/health') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Auth user endpoint
    if (url === '/api/auth/user') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Login endpoint - redirect to Replit Auth
    if (url === '/api/login') {
      // For now, redirect to a simple auth flow
      // This will need full Replit Auth integration later
      return res.redirect('/?login=required');
    }

    // Payment intent creation
    if (url === '/api/create-payment-intent' && method === 'POST') {
      const Stripe = require('stripe');
      
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error('Missing STRIPE_SECRET_KEY');
        return res.status(500).json({ message: 'Payment configuration error' });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });

      const { amount, plan, currency = 'eur' } = req.body;
      
      if (!amount || !plan) {
        return res.status(400).json({ message: 'Amount and plan are required' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: { plan },
        description: `SSELFIE ${plan} subscription`,
      });

      return res.json({ clientSecret: paymentIntent.client_secret });
    }

    // Default 404 for unknown routes
    return res.status(404).json({ message: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
};