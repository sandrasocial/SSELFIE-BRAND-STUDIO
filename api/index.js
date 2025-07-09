// Vercel serverless API handler
module.exports = async (req, res) => {
  console.log('API Request:', req.method, req.url);
  
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
      return res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '2.0-auth-fixed',
        deployment: 'vercel-live'
      });
    }

    // Auth user endpoint - return new test user data for customer testing
    if (url === '/api/auth/user') {
      const testUserId = "test" + Math.floor(Math.random() * 100000);
      return res.json({
        id: testUserId,
        email: "testuser@example.com", 
        firstName: "Test",
        lastName: "User",
        profileImageUrl: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Login endpoint - redirect to workspace (temporary fix)
    if (url === '/api/login') {
      return res.redirect('/workspace');
    }

    // Stripe webhook handler
    if (url === '/api/stripe-webhook' && method === 'POST') {
      const Stripe = require('stripe');
      const { Resend } = require('resend');
      
      if (!process.env.STRIPE_SECRET_KEY || !process.env.RESEND_API_KEY) {
        console.error('Missing Stripe or Resend API keys');
        return res.status(500).json({ message: 'Configuration error' });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        const event = stripe.webhooks.constructEvent(
          req.body,
          req.headers['stripe-signature'],
          process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object;
          const plan = paymentIntent.metadata.plan;
          
          // Send welcome email
          await resend.emails.send({
            from: 'hello@sselfie.ai',
            to: paymentIntent.receipt_email || 'customer@example.com',
            subject: 'Welcome to SSELFIE Studio! Your journey begins now.',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="font-family: 'Times New Roman', serif; font-size: 32px; font-weight: 300; text-align: center; margin-bottom: 30px;">
                  Welcome to SSELFIE Studio
                </h1>
                <p>Thank you for investing in yourself and your personal brand transformation.</p>
                <p>Your ${plan === 'ai-pack' ? 'SSELFIE AI' : plan === 'studio-founding' ? 'STUDIO Founding' : 'STUDIO Pro'} access is now active.</p>
                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li>Complete your brand questionnaire</li>
                  <li>Upload your selfies for AI training</li>
                  <li>Build your professional brandbook</li>
                  <li>Launch your business in 20 minutes</li>
                </ol>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.sselfie.ai/onboarding" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    START YOUR TRANSFORMATION
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                  Questions? Reply to this email - Sandra reads every single one.
                </p>
              </div>
            `
          });
        }

        return res.json({ received: true });
      } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).json({ error: 'Webhook error' });
      }
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